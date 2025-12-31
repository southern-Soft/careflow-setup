from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from core.database import BaseOrders as Base

class OrderManagement(Base):
    __tablename__ = "order_management"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(String, unique=True, nullable=False, index=True) # Auto-generated
    order_name = Column(String, nullable=True) # New field
    order_desc = Column(Text, nullable=True)
    client_name = Column(String, nullable=True, index=True) # Dropdown value
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True) # Replacing contact_id

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
