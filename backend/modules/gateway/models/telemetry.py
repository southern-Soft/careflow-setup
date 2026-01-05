from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from core.database import BaseGateway as Base

class GatewayTelemetry(Base):
    __tablename__ = "gateway_telemetry"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    gateway_id = Column(String, index=True) # Matches Gateway.gateway_ID
    data = Column(JSON, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
