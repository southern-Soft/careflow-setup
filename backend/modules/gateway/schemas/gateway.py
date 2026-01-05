from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GatewayBase(BaseModel):    
    # Application creation
    tenant_name : str
    application_name : str
    application_description : Optional[str] = None
    application_tags : Optional[str] = None

    #Gateway Registration
    gateway_name : str
    gateway_stats_interval: str


class GatewayCreate(GatewayBase):
    pass # end device_ID will be generated in route

class GatewayUpdate(BaseModel):
    tenant_name: Optional[str] = None
    application_name: Optional[str] = None
    application_description: Optional[str] = None
    application_tags : Optional[str] = None

    gateway_name: Optional[str] = None
    gateway_stats_interval: Optional[str] = None


class Gateway(GatewayBase):
    id: int
    gateway_ID: str # Included in response

    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
