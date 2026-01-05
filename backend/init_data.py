"""
Initialize database with admin user
"""
from sqlalchemy.orm import Session
from core import get_password_hash
from modules.users.models.user import User
import logging

logger = logging.getLogger(__name__)


def init_admin_user(db: Session, user_model=User):
    """Initialize database with admin user only"""
    try:
        # Check if admin user already exists
        existing_user = db.query(user_model).filter(user_model.username == "admin").first()
        if existing_user:
            logger.info(f"Admin user already exists in {db.bind.url.database}, skipping initialization")
            return

        logger.info(f"Creating admin user in {db.bind.url.database}...")

        # Create admin user
        admin_user = user_model(
            email="admin@rmgiot.com",
            username="admin",
            hashed_password=get_password_hash("admin"),
            full_name="System Administrator",
            is_active=True,
            is_superuser=True,
            department="Admin",
            designation="System Admin"
        )
        db.add(admin_user)

        db.commit()
        logger.info(f"Admin user created successfully in {db.bind.url.database}!")

    except Exception as e:
        logger.error(f"Error creating admin user in {db.bind.url.database}: {e}")
        db.rollback()
        raise
