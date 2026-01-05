from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
from core.database import get_db_clients
from core.logging import setup_logging
from modules.clients.models.client import Client
from modules.clients.schemas.client import ClientCreate, Client as ClientSchema, ClientUpdate

logger = setup_logging()

router = APIRouter()

def generate_client_id(db: Session):
    """Generate CLI-YYYY-0001 format ID"""
    year = datetime.now().year
    prefix = f"CLI-{year}-"
    
    # Find highest existing ID for this year
    last_client = db.query(Client).filter(Client.client_ID.like(f"{prefix}%")).order_by(Client.client_ID.desc()).first()
    
    if last_client:
        try:
            last_number = int(last_client.client_ID.split("-")[-1])
            new_number = last_number + 1
        except:
            new_number = 1
    else:
        new_number = 1
        
    return f"{prefix}{new_number:04d}"

@router.post("/", response_model=ClientSchema, status_code=status.HTTP_201_CREATED)
def create_client(client_data: ClientCreate, db: Session = Depends(get_db_clients)):
    """Create a new client with auto-generated ID"""
    try:
        client_ID = generate_client_id(db)
        
        new_client = Client(
            client_name=client_data.client_name,
            client_ID=client_ID,
            email=client_data.email,
            phone=client_data.phone,
            address=client_data.address
        )

        db.add(new_client)
        db.commit()
        db.refresh(new_client)

        return new_client
    except Exception as e:
        db.rollback()
        logger.error(f"Client creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create client: {str(e)}"
        )

@router.get("/", response_model=List[ClientSchema])
def get_clients(skip: int = 0, limit: int = 10000, db: Session = Depends(get_db_clients)):
    """Get all clients"""
    clients = db.query(Client).order_by(Client.id.desc()).offset(skip).limit(limit).all()
    return clients

@router.get("/{id}", response_model=ClientSchema)
def get_client(id: int, db: Session = Depends(get_db_clients)):
    """Get a specific client by internal ID"""
    client = db.query(Client).filter(Client.id == id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.put("/{id}", response_model=ClientSchema)
def update_client(id: int, client_data: ClientUpdate, db: Session = Depends(get_db_clients)):
    """Update a client"""
    try:
        client = db.query(Client).filter(Client.id == id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")

        update_data = client_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(client, key, value)

        db.commit()
        db.refresh(client)
        return client
    except Exception as e:
        db.rollback()
        logger.error(f"Client update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update client: {str(e)}"
        )

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(id: int, db: Session = Depends(get_db_clients)):
    """Delete a client"""
    try:
        client = db.query(Client).filter(Client.id == id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")

        db.delete(client)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        logger.error(f"Client deletion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete client"
        )
