from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EndDeviceBase(BaseModel):
    end_device_name: str
    maximum_bus: int
    fota_update_version: Optional[str] = None
    address: Optional[str] = None

class EndDeviceCreate(EndDeviceBase):
    pass # end device_ID will be generated in route

class EndDeviceUpdate(BaseModel):
    end_device_name: Optional[str] = None
    maximum_bus: Optional[int] = None
    fota_update_version: Optional[str] = None
    address: Optional[str] = None

class EndDevice(EndDeviceBase):
    id: int
    end_device_ID: str # Included in response
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
