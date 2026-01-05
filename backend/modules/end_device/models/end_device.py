from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from core.database import BaseEndDevice as Base

class End_device(Base):
    __tablename__ = "end-device"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    end_device_name = Column(String, nullable=False, index=True) # Mandatory
    end_device_ID = Column(String, unique=True, nullable=False, index=True) # Auto-generated
    maximum_bus = Column(Integer, nullable=False)
    fota_update_version = Column(String, nullable=True)
    address = Column(Text, nullable=True) # Replaced contact_id

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
