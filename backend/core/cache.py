"""
Redis Caching Layer for Performance Optimization
Provides caching decorators and utilities for API endpoints
"""

import redis
import json
import logging
from functools import wraps
from typing import Optional, Any, Callable
from .config import settings

logger = logging.getLogger(__name__)

# Redis client instance
redis_client: Optional[redis.Redis] = None


def get_redis_client() -> Optional[redis.Redis]:
    """Get or create Redis client"""
    global redis_client

    if redis_client is None:
        try:
            redis_client = redis.Redis(
                host=getattr(settings, 'REDIS_HOST', 'redis'),
                port=getattr(settings, 'REDIS_PORT', 6379),
                db=getattr(settings, 'REDIS_DB', 0),
                decode_responses=True,
                socket_connect_timeout=5,
                socket_keepalive=True,
                health_check_interval=30
            )
            # Test connection
            redis_client.ping()
            logger.info("✅ Redis connection established successfully")
        except Exception as e:
            logger.warning(f"⚠️  Redis connection failed: {e}. Caching disabled.")
            redis_client = None

    return redis_client


def cache_response(
    key_prefix: str,
    ttl: int = 300,
    key_builder: Optional[Callable] = None
):
    """
    Decorator to cache API responses in Redis

    Args:
        key_prefix: Prefix for cache key (e.g., "buyers", "samples")
        ttl: Time-to-live in seconds (default: 300 = 5 minutes)
        key_builder: Custom function to build cache key from function args

    Example:
        @cache_response(key_prefix="buyers", ttl=300)
        def get_buyers(skip: int, limit: int):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Try to get from cache
            cache_key = _build_cache_key(key_prefix, func, args, kwargs, key_builder)
            cached_data = _get_from_cache(cache_key)

            if cached_data is not None:
                logger.debug(f"🎯 Cache HIT: {cache_key}")
                return cached_data

            # Cache miss - execute function
            logger.debug(f"❌ Cache MISS: {cache_key}")
            result = await func(*args, **kwargs)

            # Store in cache
            _set_in_cache(cache_key, result, ttl)

            return result

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            # Try to get from cache
            cache_key = _build_cache_key(key_prefix, func, args, kwargs, key_builder)
            cached_data = _get_from_cache(cache_key)

            if cached_data is not None:
                logger.debug(f"🎯 Cache HIT: {cache_key}")
                return cached_data

            # Cache miss - execute function
            logger.debug(f"❌ Cache MISS: {cache_key}")
            result = func(*args, **kwargs)

            # Store in cache
            _set_in_cache(cache_key, result, ttl)

            return result

        # Return appropriate wrapper based on function type
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper

    return decorator


def invalidate_cache(key_pattern: str):
    """
    Invalidate cache entries matching a pattern

    Args:
        key_pattern: Redis key pattern (e.g., "buyers:*", "sample:123")

    Example:
        invalidate_cache("buyers:*")  # Clear all buyer caches
        invalidate_cache("buyer:123")  # Clear specific buyer cache
    """
    client = get_redis_client()
    if client is None:
        return

    try:
        keys = client.keys(key_pattern)
        if keys:
            client.delete(*keys)
            logger.info(f"🗑️  Invalidated {len(keys)} cache entries: {key_pattern}")
    except Exception as e:
        logger.error(f"❌ Cache invalidation failed: {e}")


def _build_cache_key(
    prefix: str,
    func: Callable,
    args: tuple,
    kwargs: dict,
    key_builder: Optional[Callable] = None
) -> str:
    """Build cache key from function arguments"""
    if key_builder:
        return f"{prefix}:{key_builder(*args, **kwargs)}"

    # Default key builder: combine all arguments
    key_parts = [prefix]

    # Add positional arguments (skip 'db' session)
    for arg in args:
        if hasattr(arg, '__class__') and 'Session' in arg.__class__.__name__:
            continue  # Skip database session
        key_parts.append(str(arg))

    # Add keyword arguments (skip 'db' session)
    for k, v in sorted(kwargs.items()):
        if k == 'db':
            continue
        key_parts.append(f"{k}={v}")

    return ":".join(key_parts)


def _get_from_cache(key: str) -> Optional[Any]:
    """Get data from Redis cache"""
    client = get_redis_client()
    if client is None:
        return None

    try:
        cached = client.get(key)
        if cached:
            return json.loads(cached)
    except Exception as e:
        logger.error(f"❌ Cache read error for {key}: {e}")

    return None


def _set_in_cache(key: str, data: Any, ttl: int):
    """Store data in Redis cache"""
    client = get_redis_client()
    if client is None:
        return

    try:
        # Convert Pydantic models to dict if needed
        if hasattr(data, 'model_dump'):
            data = data.model_dump()
        elif hasattr(data, '__dict__'):
            # Handle SQLAlchemy models
            data = {c.name: getattr(data, c.name) for c in data.__table__.columns}
        elif isinstance(data, list):
            # Handle list of models
            data = [
                item.model_dump() if hasattr(item, 'model_dump')
                else {c.name: getattr(item, c.name) for c in item.__table__.columns}
                if hasattr(item, '__table__') else item
                for item in data
            ]

        serialized = json.dumps(data, default=str)  # default=str for dates
        client.setex(key, ttl, serialized)
        logger.debug(f"💾 Cached: {key} (TTL: {ttl}s)")
    except Exception as e:
        logger.error(f"❌ Cache write error for {key}: {e}")


def get_cache_stats() -> dict:
    """Get Redis cache statistics"""
    client = get_redis_client()
    if client is None:
        return {"status": "disabled", "connected": False}

    try:
        info = client.info()
        return {
            "status": "enabled",
            "connected": True,
            "used_memory": info.get('used_memory_human', 'N/A'),
            "total_keys": client.dbsize(),
            "hits": info.get('keyspace_hits', 0),
            "misses": info.get('keyspace_misses', 0),
            "hit_rate": round(
                info.get('keyspace_hits', 0) /
                (info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0) + 1) * 100,
                2
            )
        }
    except Exception as e:
        logger.error(f"❌ Failed to get cache stats: {e}")
        return {"status": "error", "connected": False, "error": str(e)}


# Cache TTL configurations (in seconds)
class CacheTTL:
    """Cache time-to-live configurations"""
    LOOKUP_DATA = 600          # 10 minutes - Buyers, Suppliers (rarely changes)
    TRANSACTIONAL = 60         # 1 minute - Orders, Samples (changes frequently)
    STYLE_DATA = 300           # 5 minutes - Styles, Variants
    MATERIAL_DATA = 1800       # 30 minutes - Material master (rarely changes)
    USER_DATA = 600            # 10 minutes - User profiles
    DASHBOARD_STATS = 120      # 2 minutes - Dashboard statistics
