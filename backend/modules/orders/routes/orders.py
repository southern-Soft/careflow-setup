from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from core.database import get_db_orders
from core.logging import setup_logging
from modules.orders.models.order import OrderManagement
from modules.orders.schemas.order import OrderCreate, OrderUpdate, OrderResponse

logger = setup_logging()

router = APIRouter()

def generate_order_id(db: Session):
    """Generate ORD-YYYY-0001 format ID"""
    year = datetime.now().year
    prefix = f"ORD-{year}-"
    
    last_order = db.query(OrderManagement).filter(OrderManagement.order_id.like(f"{prefix}%")).order_by(OrderManagement.order_id.desc()).first()
    
    if last_order:
        try:
            last_number = int(last_order.order_id.split("-")[-1])
            new_number = last_number + 1
        except:
            new_number = 1
    else:
        new_number = 1
        
    return f"{prefix}{new_number:04d}"

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db_orders)):
    """Create a new order with auto-generated ID"""
    try:
        order_id = generate_order_id(db)
        
        new_order = OrderManagement(
            order_id=order_id,
            order_name=order_data.order_name,
            order_desc=order_data.order_desc,
            client_name=order_data.client_name,
            email=order_data.email,
            phone=order_data.phone,
            address=order_data.address
        )
        
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        return new_order
    except Exception as e:
        db.rollback()
        logger.error(f"Order creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )

@router.get("/", response_model=List[OrderResponse])
def get_orders(
    client_name: str = None,
    skip: int = 0,
    limit: int = 10000,
    db: Session = Depends(get_db_orders)
):
    """Get all orders with optional filter by client_name"""
    query = db.query(OrderManagement)
    
    if client_name:
        query = query.filter(OrderManagement.client_name == client_name)
    
    orders = query.order_by(OrderManagement.id.desc()).offset(skip).limit(limit).all()
    return orders

@router.get("/{id}", response_model=OrderResponse)
def get_order(id: int, db: Session = Depends(get_db_orders)):
    """Get a specific order by internal ID"""
    order = db.query(OrderManagement).filter(OrderManagement.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/{id}", response_model=OrderResponse)
def update_order(id: int, order_data: OrderUpdate, db: Session = Depends(get_db_orders)):
    """Update an order"""
    try:
        order = db.query(OrderManagement).filter(OrderManagement.id == id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        update_data = order_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(order, key, value)
        
        db.commit()
        db.refresh(order)
        return order
    except Exception as e:
        db.rollback()
        logger.error(f"Order update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update order: {str(e)}"
        )

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(id: int, db: Session = Depends(get_db_orders)):
    """Delete an order"""
    try:
        order = db.query(OrderManagement).filter(OrderManagement.id == id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        db.delete(order)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        logger.error(f"Order deletion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete order"
        )
