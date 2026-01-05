from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "Southern IOT System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # PostgreSQL Base Settings
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "root"
    POSTGRES_PORT: str = "5432"

    # Multi-Database Host Configuration
    POSTGRES_HOST_USERS: str = "db-users"
    POSTGRES_HOST_ORDERS: str = "db-orders"

    POSTGRES_HOST_USERS_IMPLEMENTATION: str = "IOT_users_implementation"
    POSTGRES_HOST_END_DEVICE: str = "IOT_end_device"
    POSTGRES_HOST_GATEWAY: str = "IOT_gateway"
    POSTGRES_HOST_CLIENTS: str = "IOT_clients"


    # Multi-Database Names
    POSTGRES_DB_USERS: str = "IOT_users"
    POSTGRES_DB_ORDERS: str = "IOT_orders"
    
    POSTGRES_DB_USERS_IMPLEMENTATION:str = "IOT_users_implementation"
    POSTGRES_DB_END_DEVICE:str = "IOT_end_device"
    POSTGRES_DB_GATEWAY:str ="IOT_gateway"
    POSTGRES_DB_CLIENTS:str = "IOT_clients"

    # Computed Database URLs
    DATABASE_URL: Optional[str] = None
    DATABASE_URL_USERS: Optional[str] = None
    DATABASE_URL_ORDERS: Optional[str] = None
    DATABASE_URL_CLIENTS: Optional[str] = None

    DATABASE_URL_USERS_IMPLEMENTATION: Optional[str] = None
    DATABASE_URL_END_DEVICE: Optional[str] = None
    DATABASE_URL_GATEWAY: Optional[str] = None


    # JWT Settings
    SECRET_KEY: str = "your-secret-key-change-this-in-production-please-make-it-secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Device Authentication
    # In a real system, this would be a per-device key, but for simplicity/demo:
    IOT_DEVICE_ACCESS_TOKEN: str = "southern-iot-secret-access-token"



    # CORS - Allow all origins for internal ERP system
    # Set CORS_ORIGINS env variable to restrict (comma-separated list)
    CORS_ORIGINS: str = "*"
    BACKEND_CORS_ORIGINS: list = ["*"]

    class Config:
        case_sensitive = True
        env_file = ".env"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Build database URLs for each database
        self.DATABASE_URL_USERS = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST_USERS}:{self.POSTGRES_PORT}/{self.POSTGRES_DB_USERS}"
        self.DATABASE_URL_ORDERS = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST_ORDERS}:{self.POSTGRES_PORT}/{self.POSTGRES_DB_ORDERS}"
        self.DATABASE_URL_CLIENTS = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST_CLIENTS}:{self.POSTGRES_PORT}/{self.POSTGRES_DB_CLIENTS}"
        self.DATABASE_URL_USERS_IMPLEMENTATION = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST_USERS_IMPLEMENTATION}:{self.POSTGRES_PORT}/{self.POSTGRES_DB_USERS_IMPLEMENTATION}"
        self.DATABASE_URL_END_DEVICE = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST_END_DEVICE}:{self.POSTGRES_PORT}/{self.POSTGRES_DB_END_DEVICE}"
        self.DATABASE_URL_GATEWAY = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST_GATEWAY}:{self.POSTGRES_PORT}/{self.POSTGRES_DB_GATEWAY}"


settings = Settings()
