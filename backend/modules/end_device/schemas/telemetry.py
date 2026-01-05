from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime

class TelemetryCreate(BaseModel):
    data: Dict[str, Any]

class TelemetryResponse(BaseModel):
    id: int
    end_device_id: str
    data: Dict[str, Any]
    timestamp: datetime

    class Config:
        from_attributes = True
