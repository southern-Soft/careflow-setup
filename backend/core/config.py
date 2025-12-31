from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "RMG IOT System"
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

    # Multi-Database Names
    POSTGRES_DB_USERS: str = "IOT_users"
    POSTGRES_DB_ORDERS: str = "IOT_orders"



    # Computed Database URLs
    DATABASE_URL: Optional[str] = None
    DATABASE_URL_USERS: Optional[str] = None
    DATABASE_URL_ORDERS: Optional[str] = None


    # JWT Settings
    SECRET_KEY: str = "your-secret-key-change-this-in-production-please-make-it-secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days



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



settings = Settings()
