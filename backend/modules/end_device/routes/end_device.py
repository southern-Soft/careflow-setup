from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
from core.database import get_db_end_device
from core.logging import setup_logging
from modules.end_device.models.end_device import End_device
from modules.end_device.schemas.end_device import EndDeviceCreate, EndDevice as EndDeviceSchema, EndDeviceUpdate

logger = setup_logging()

router = APIRouter()

def generate_end_device_id(db: Session):
    """Generate ED-YYYY-0001 format ID"""
    year = datetime.now().year
    prefix = f"ED-{year}-"
    
    # Find highest existing ID for this year
    last_end_device = db.query(End_device).filter(End_device.end_device_ID.like(f"{prefix}%")).order_by(End_device.end_device_ID.desc()).first()
    
    if last_end_device:
        try:
            last_number = int(last_end_device.end_device_ID.split("-")[-1])
            new_number = last_number + 1
        except:
            new_number = 1
    else:
        new_number = 1
        
    return f"{prefix}{new_number:04d}"

@router.post("/", response_model=EndDeviceSchema, status_code=status.HTTP_201_CREATED)
def create_end_device(end_device_data: EndDeviceCreate, db: Session = Depends(get_db_end_device)):
    """Create a new end device with auto-generated ID"""
    try:
        end_device_ID = generate_end_device_id(db)
        
        new_end_device = End_device(
            end_device_name=end_device_data.end_device_name,
            end_device_ID=end_device_ID,
            maximum_bus=end_device_data.maximum_bus,
            fota_update_version=end_device_data.fota_update_version,
            address=end_device_data.address
        )

        db.add(new_end_device)
        db.commit()
        db.refresh(new_end_device)

        return new_end_device
    except Exception as e:
        db.rollback()
        logger.error(f"End Device creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create End Device: {str(e)}"
        )

@router.get("/", response_model=List[EndDeviceSchema])
def get_end_devices(skip: int = 0, limit: int = 10000, db: Session = Depends(get_db_end_device)):
    """Get all end devices"""
    end_devices = db.query(End_device).order_by(End_device.id.desc()).offset(skip).limit(limit).all()
    return end_devices

@router.get("/{identifier}", response_model=EndDeviceSchema)
def get_end_device(identifier: str, db: Session = Depends(get_db_end_device)):
    """Get a specific end device by internal ID (int) or Public ID (ED-XXXX-XXXX)"""
    
    # Try integer lookup first if it looks like an int
    if identifier.isdigit():
         end_device = db.query(End_device).filter(End_device.id == int(identifier)).first()
         if end_device:
             return end_device
             
    # Try string lookup
    end_device = db.query(End_device).filter(End_device.end_device_ID == identifier).first()
    
    if not end_device:
        raise HTTPException(status_code=404, detail="End device not found")
    return end_device

@router.put("/{id}", response_model=EndDeviceSchema)
def update_end_device(id: int, end_device_data: EndDeviceUpdate, db: Session = Depends(get_db_end_device)):
    """Update a end device"""
    try:
        end_device = db.query(End_device).filter(End_device.id == id).first()
        if not end_device:
            raise HTTPException(status_code=404, detail="End Device not found")

        update_data = end_device_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(end_device, key, value)

        db.commit()
        db.refresh(end_device)
        return end_device
    except Exception as e:
        db.rollback()
        logger.error(f"End device update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update end device: {str(e)}"
        )

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_end_device(id: int, db: Session = Depends(get_db_end_device)):
    """Delete a end device"""
    try:
        end_device = db.query(End_device).filter(End_device.id == id).first()
        if not end_device:
            raise HTTPException(status_code=404, detail="End device not found")

        db.delete(end_device)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        logger.error(f"End device deletion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete end device"
        )


# ============================================================================
# Telemetry Endpoints
# ============================================================================

from modules.end_device.models.telemetry import Telemetry
from modules.end_device.schemas.telemetry import TelemetryCreate, TelemetryResponse
from core.device_security import verify_device_token

@router.post("/{end_device_id}/telemetry", response_model=TelemetryResponse, status_code=status.HTTP_201_CREATED)
def create_device_telemetry(
    end_device_id: str, 
    telemetry_data: TelemetryCreate, 
    db: Session = Depends(get_db_end_device),
    authorized: bool = Depends(verify_device_token)
):
    """
    Record new telemetry data for a device.
    Protected by X-IOT-Token header.
    """
    # Verify device exists (using string ID mostly likely passed from device)
    device = db.query(End_device).filter(End_device.end_device_ID == end_device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail=f"End Device with ID {end_device_id} not found")

    try:
        new_telemetry = Telemetry(
            end_device_id=end_device_id,
            data=telemetry_data.data
        )
        db.add(new_telemetry)
        db.commit()
        db.refresh(new_telemetry)
        
        return new_telemetry
    except Exception as e:
        db.rollback()
        logger.error(f"Telemetry creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{end_device_id}/telemetry", response_model=List[TelemetryResponse])
def get_device_telemetry(end_device_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db_end_device)):
    """
    Get JSON telemetry data for a specific device.
    """
    return db.query(Telemetry).filter(Telemetry.end_device_id == end_device_id)\
        .order_by(Telemetry.timestamp.desc())\
        .offset(skip).limit(limit).all()
