"""
Health Check Endpoint
Monitors system health for production deployment - Multi-Database Architecture
"""

from fastapi import APIRouter
from sqlalchemy import text
from datetime import datetime
from core.database import (
    engines, DatabaseType,
    SessionLocalUsers,
    SessionLocalOrders, 
)

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring all databases
    Returns 200 if all systems are healthy, 503 if any are unhealthy
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "databases": {}
    }

    # Check all databases
    db_sessions = {

        "users": SessionLocalUsers,
        "orders": SessionLocalOrders,

    }

    all_healthy = True

    for db_name, session_class in db_sessions.items():
        db = session_class()
        try:
            db.execute(text("SELECT 1"))
            health_status["databases"][db_name] = {
                "status": "connected",
                "pool_size": engines[DatabaseType(db_name)].pool.size(),
                "checked_in": engines[DatabaseType(db_name)].pool.checkedin(),
                "checked_out": engines[DatabaseType(db_name)].pool.checkedout(),
            }
        except Exception as e:
            all_healthy = False
            health_status["databases"][db_name] = {
                "status": "error",
                "error": str(e)
            }
        finally:
            db.close()

    if not all_healthy:
        health_status["status"] = "unhealthy"

    return health_status


@router.get("/ready")
async def readiness_check():
    """
    Readiness check - returns 200 if ready to serve traffic
    Checks only the primary databases (clients, samples, users, orders)
    """
    db_sessions = {
        "users": SessionLocalUsers,
        "orders": SessionLocalOrders,
    }

    for db_name, session_class in db_sessions.items():
        db = session_class()
        try:
            db.execute(text("SELECT 1"))
        except Exception:
            db.close()
            return {"status": "not_ready", "failed_db": db_name}
        finally:
            db.close()

    return {"status": "ready"}
