from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Order, Product, Setting
from pydantic import BaseModel
from typing import List
import json

router = APIRouter()

class OrderCreate(BaseModel):
    user_id: int
    address_id: int
    payment_mode: str
    total_amount: float
    products: List[dict]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/orders")
def add_order(order: OrderCreate, db: Session = Depends(get_db)):
    settings = db.query(Setting).first()
    default_status = "Processing" if settings and settings.order_auto_confirm else "Pending"

    new_order = Order(
        user_id=order.user_id,
        address_id=order.address_id,
        payment_mode=order.payment_mode,
        total_amount=order.total_amount,
        products=json.dumps(order.products),
        status=default_status
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return {
        "message": "Order placed successfully",
        "order_id": new_order.id
    }

@router.get("/orders")
def get_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    result = []

    for o in orders:
      try:
          products_list = json.loads(o.products) if o.products else []
      except:
          products_list = []

      enriched_products = []

      for p in products_list:
          product = db.query(Product).filter(Product.id == p.get("product_id")).first()

          if product:
              enriched_products.append({
                  "product_id": product.id,
                  "name": product.name,
                  "image": product.image,
                  "price": product.price,
                  "quantity": p.get("quantity", 1)
              })
          else:
              enriched_products.append({
                  "product_id": p.get("product_id"),
                  "name": p.get("name", "Product"),
                  "image": p.get("image", ""),
                  "price": p.get("price", 0),
                  "quantity": p.get("quantity", 1)
              })

      result.append({
          "id": o.id,
          "user_id": o.user_id,
          "address_id": o.address_id,
          "payment_mode": o.payment_mode,
          "total_amount": o.total_amount,
          "status": o.status,
          "products": enriched_products
      })

    return result

@router.get("/orders/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    try:
        products_list = json.loads(order.products) if order.products else []
    except:
        products_list = []

    enriched_products = []

    for p in products_list:
        product = db.query(Product).filter(Product.id == p.get("product_id")).first()

        if product:
            enriched_products.append({
                "product_id": product.id,
                "name": product.name,
                "image": product.image,
                "price": product.price,
                "quantity": p.get("quantity", 1)
            })
        else:
            enriched_products.append({
                "product_id": p.get("product_id"),
                "name": p.get("name", "Product"),
                "image": p.get("image", ""),
                "price": p.get("price", 0),
                "quantity": p.get("quantity", 1)
            })

    return {
        "id": order.id,
        "user_id": order.user_id,
        "address_id": order.address_id,
        "payment_mode": order.payment_mode,
        "total_amount": order.total_amount,
        "status": order.status,
        "products": enriched_products
    }

@router.get("/orders/user/{user_id}")
def get_orders_by_user(user_id: int, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    result = []

    for o in orders:
        try:
            products_list = json.loads(o.products) if o.products else []
        except:
            products_list = []

        enriched_products = []

        for p in products_list:
            product = db.query(Product).filter(Product.id == p.get("product_id")).first()

            if product:
                enriched_products.append({
                    "product_id": product.id,
                    "name": product.name,
                    "image": product.image,
                    "price": product.price,
                    "quantity": p.get("quantity", 1)
                })
            else:
                enriched_products.append({
                    "product_id": p.get("product_id"),
                    "name": "Product",
                    "image": "",
                    "price": 0,
                    "quantity": p.get("quantity", 1)
                })

        result.append({
            "id": o.id,
            "user_id": o.user_id,
            "address_id": o.address_id,
            "payment_mode": o.payment_mode,
            "total_amount": o.total_amount,
            "status": o.status,
            "products": enriched_products
        })

    return result

@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status: str = Query(...),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    status = status.capitalize()
    allowed = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]

    if status not in allowed:
        raise HTTPException(status_code=400, detail="Invalid status")

    order.status = status
    db.commit()
    db.refresh(order)

    return {
        "message": "Status updated successfully",
        "order_id": order.id,
        "status": order.status
    }

@router.put("/orders/cancel/{order_id}")
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = "Cancelled"
    db.commit()

    return {"message": "Order cancelled successfully"}

@router.delete("/orders/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(order)
    db.commit()

    return {"message": "Order deleted successfully"}