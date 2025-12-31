"""
Initialize database with admin user
"""
from sqlalchemy.orm import Session
from core import get_password_hash
from modules.users.models.user import User
import logging

logger = logging.getLogger(__name__)


def init_sample_data(db: Session):
    """Initialize database with admin user only"""
    try:
        # Check if admin user already exists
        existing_user = db.query(User).first()
        if existing_user:
            logger.info("Admin user already exists, skipping initialization")
            return

        logger.info("Creating admin user...")

        # Create admin user
        admin_user = User(
            email="admin@rmgerp.com",
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
        logger.info("Admin user created successfully!")
        logger.info("Default login credentials:")
        logger.info("  Username: admin | Password: admin")

    except Exception as e:
        logger.error(f"Error creating admin user: {e}")
        db.rollback()
        raise
