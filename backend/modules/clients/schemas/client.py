from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ClientBase(BaseModel):
    client_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class ClientCreate(ClientBase):
    pass # client_ID will be generated in route

class ClientUpdate(BaseModel):
    client_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class Client(ClientBase):
    id: int
    client_ID: str # Included in response
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
