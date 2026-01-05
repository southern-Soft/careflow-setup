from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
from core.database import get_db_gateway
from core.logging import setup_logging
from modules.gateway.models.gateway import Gateway
from modules.gateway.schemas.gateway import GatewayCreate, Gateway as GatewaySchema, GatewayUpdate

logger = setup_logging()

router = APIRouter()

def generate_gateway_id(db: Session):
    """Generate G-YYYY-0001 format ID"""
    year = datetime.now().year
    prefix = f"G-{year}-"
    
    # Find highest existing ID for this year
    last_gatewawy = db.query(Gateway).filter(Gateway.gateway_ID.like(f"{prefix}%")).order_by(Gateway.gateway_ID.desc()).first()
    
    if last_gatewawy:
        try:
            last_number = int(last_gatewawy.gateway_ID.split("-")[-1])
            new_number = last_number + 1
        except:
            new_number = 1
    else:
        new_number = 1
        
    return f"{prefix}{new_number:04d}"

@router.post("/", response_model=GatewaySchema, status_code=status.HTTP_201_CREATED)
def create_gateway(gateway_data: GatewayCreate, db: Session = Depends(get_db_gateway)):
    """Create a new gateway with auto-generated ID"""
    try:
        gateway_ID = generate_gateway_id(db)
        
        new_gateway = Gateway(
            tenant_name = gateway_data.tenant_name,
            application_name = gateway_data.application_name,
            application_description = gateway_data.application_description,
            application_tags = gateway_data.application_tags,

            #Gateway Registration
            gateway_name = gateway_data.gateway_name,
            gateway_ID = gateway_ID,
            gateway_stats_interval= gateway_data.gateway_stats_interval,
        ) 

        db.add(new_gateway)
        db.commit()
        db.refresh(new_gateway)

        return new_gateway
    except Exception as e:
        db.rollback()
        logger.error(f"Gateway creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create Gateway: {str(e)}"
        )

@router.get("/", response_model=List[GatewaySchema])
def get_gateway(skip: int = 0, limit: int = 10000, db: Session = Depends(get_db_gateway)):
    """Get all Gateway"""
    gateway = db.query(Gateway).order_by(Gateway.id.desc()).offset(skip).limit(limit).all()
    return gateway

@router.get("/{identifier}", response_model=GatewaySchema)
def get_gateway(identifier: str, db: Session = Depends(get_db_gateway)):
    """Get a specific gateway by internal ID (int) or Public ID (G-XXXX-XXXX)"""
    
    # Try integer lookup first if it looks like an int
    if identifier.isdigit():
         gateway = db.query(Gateway).filter(Gateway.id == int(identifier)).first()
         if gateway:
             return gateway
             
    # Try string lookup
    gateway = db.query(Gateway).filter(Gateway.gateway_ID == identifier).first()
    
    if not gateway:
        raise HTTPException(status_code=404, detail="Gateway not found")
    return gateway

@router.put("/{id}", response_model=GatewaySchema)
def update_gateway(id: int, gateway_data: GatewayUpdate, db: Session = Depends(get_db_gateway)):
    """Update a gateway"""
    try:
        gateway = db.query(Gateway).filter(Gateway.id == id).first()
        if not gateway:
            raise HTTPException(status_code=404, detail="Gateway not found")

        update_data = gateway_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(gateway, key, value)

        db.commit()
        db.refresh(gateway)
        return gateway
    except Exception as e:
        db.rollback()
        logger.error(f"Gateway update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update gateway: {str(e)}"
        )

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gateway(id: int, db: Session = Depends(get_db_gateway)):
    """Delete a Gateway"""
    try:
        gateway = db.query(Gateway).filter(Gateway.id == id).first()
        if not gateway:
            raise HTTPException(status_code=404, detail="Gateway not found")

        db.delete(gateway)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        logger.error(f"Gateway deletion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete Gateway"
        )


# ============================================================================
# Telemetry Endpoints
# ============================================================================

from modules.gateway.models.telemetry import GatewayTelemetry
from modules.gateway.schemas.telemetry import GatewayTelemetryCreate, GatewayTelemetryResponse
from core.device_security import verify_device_token

@router.post("/{gateway_id}/telemetry", response_model=GatewayTelemetryResponse, status_code=status.HTTP_201_CREATED)
def create_gateway_telemetry(
    gateway_id: str, 
    telemetry_data: GatewayTelemetryCreate, 
    db: Session = Depends(get_db_gateway),
    authorized: bool = Depends(verify_device_token)
):
    """
    Record new telemetry data for a gateway.
    Protected by X-IOT-Token header.
    """
    # Verify gateway exists (using string ID)
    gateway = db.query(Gateway).filter(Gateway.gateway_ID == gateway_id).first()
    if not gateway:
        raise HTTPException(status_code=404, detail=f"Gateway with ID {gateway_id} not found")

    try:
        new_telemetry = GatewayTelemetry(
            gateway_id=gateway_id,
            data=telemetry_data.data
        )
        db.add(new_telemetry)
        db.commit()
        db.refresh(new_telemetry)
        
        return new_telemetry
    except Exception as e:
        db.rollback()
        logger.error(f"Gateway Telemetry creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{gateway_id}/telemetry", response_model=List[GatewayTelemetryResponse])
def get_gateway_telemetry(gateway_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db_gateway)):
    """
    Get JSON telemetry data for a specific gateway.
    """
    # TODO: Add user authentication here (Depends(get_current_user)) when ready.
    # Currently public for frontend consumption.
    
    return db.query(GatewayTelemetry).filter(GatewayTelemetry.gateway_id == gateway_id)\
        .order_by(GatewayTelemetry.timestamp.desc())\
        .offset(skip).limit(limit).all()
