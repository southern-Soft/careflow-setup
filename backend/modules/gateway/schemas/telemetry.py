from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime

class GatewayTelemetryCreate(BaseModel):
    data: Dict[str, Any]

class GatewayTelemetryResponse(BaseModel):
    id: int
    gateway_id: str
    data: Dict[str, Any]
    timestamp: datetime

    class Config:
        from_attributes = True
