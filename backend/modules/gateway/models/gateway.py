from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from core.database import BaseGateway as Base

class Gateway(Base):
    __tablename__ = "gateway"

    tenant_name = Column(String, nullable=False, index=True)
    
    # Application creation
    application_name = Column(String, nullable=False, index=True)
    application_description = Column(String, nullable=True, index=True)
    application_tags = Column(String, nullable=True, index=True)

    #Gateway Registration
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    gateway_name = Column(String, nullable=False, index=True) # Mandatory
    gateway_ID = Column(String, unique=True, nullable=False, index=True) # Auto-generated
    gateway_stats_interval=  Column(String, nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# ============================================================================
# Application creation
# ============================================================================
