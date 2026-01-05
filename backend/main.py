"""
Southern IOT System - Main Application Entry Point
Modular FastAPI Backend
"""
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core import settings, init_db, setup_logging
from core.database import SessionLocalUsers, SessionLocalUsersImplementation


# Import routers from modules (Importing here ensures models are registered before init_db)
from modules.auth import auth_router, auth_implementation_router
from modules.orders import orders_router
from modules.clients import clients_router
from modules.users import users_router

from modules.users_implementation import users_implementation_router
from modules.users_implementation.models.user_implementation import User as UserImplementation
from modules.end_device import end_device_router
# Import Telemetry models to register them with Base metadata for init_db
from modules.end_device.models.telemetry import Telemetry
from modules.gateway import gateway_router
from modules.gateway.models.telemetry import GatewayTelemetry

from modules.health import health_router

# Configure logging
logger = setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS - Allow all origins for internal ERP
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler for unhandled exceptions
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Unhandled exception: {type(exc).__name__}: {str(exc)}\n"
        f"Request: {request.method} {request.url}\n"
        f"Traceback: {traceback.format_exc()}"
    )
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error. Please try again later.",
            "error_type": type(exc).__name__
        }
    )

@app.on_event("startup")
async def startup_event():
    """Initialize all databases on startup"""
    logger.info("Initializing all databases...")
    init_db()
    logger.info("All databases initialized successfully!")

    # Initialize sample data in users database
    db = SessionLocalUsers()
    db_implement = SessionLocalUsersImplementation()
    try:
        from init_data import init_admin_user
        init_admin_user(db)
        # For implementation users
        init_admin_user(db_implement, UserImplementation)
    finally:
        db.close()
        db_implement.close()

@app.get("/")
async def root():
    return {
        "message": "Welcome to Southern IOT Sales/Implementation Dashboard",
        "version": settings.VERSION,
        "docs": "/docs"
    }

# Register routers
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(auth_implementation_router, prefix=f"{settings.API_V1_STR}/auth_implementation", tags=["auth_implementation"])
app.include_router(orders_router, prefix=f"{settings.API_V1_STR}/orders", tags=["orders"])
app.include_router(clients_router, prefix=f"{settings.API_V1_STR}/clients", tags=["clients"])
app.include_router(users_router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])

app.include_router(users_implementation_router, prefix=f"{settings.API_V1_STR}/users_implementation", tags=["users_implementation"])
app.include_router(end_device_router, prefix=f"{settings.API_V1_STR}/end_device", tags=["end_device"])
app.include_router(gateway_router, prefix=f"{settings.API_V1_STR}/gateway", tags=["gateway"])

app.include_router(health_router, prefix=f"{settings.API_V1_STR}", tags=["health"])
