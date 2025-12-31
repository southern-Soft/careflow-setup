"""
Core module - Shared logic for all modules
"""
from .config import settings
from .database import Base, engine, SessionLocalUsers, SessionLocalOrders, get_db_users, get_db_orders, init_db
from .security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_token
)
from .logging import setup_logging

__all__ = [
    "settings",
    "Base",
    "engine",
    "SessionLocalUsers",
    "SessionLocalOrders",
    "get_db_users",
    "get_db_orders",
    "init_db",
    "verify_password",
    "get_password_hash",
    "create_access_token",
    "decode_token",
    "setup_logging"
]
