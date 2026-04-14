from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Wishlist, Product
from pydantic import BaseModel

router = APIRouter(prefix="/wishlist")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class WishlistCreate(BaseModel):
    user_id: int
    product_id: int

class WishlistRemove(BaseModel):
    user_id: int
    product_id: int

@router.get("/{user_id}")
def get_wishlist(user_id: int, db: Session = Depends(get_db)):
    items = db.query(Wishlist).filter(Wishlist.user_id == user_id).all()

    result = []
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()

        if product:
            result.append({
                "id": item.product_id,
                "name": product.name,
                "price": product.price,
                "image": product.image
            })

    return result

@router.post("/")
def add_to_wishlist(data: WishlistCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = db.query(Wishlist).filter(
        Wishlist.user_id == data.user_id,
        Wishlist.product_id == data.product_id
    ).first()

    if existing:
        return {"message": "Already in wishlist"}

    item = Wishlist(
        user_id=data.user_id,
        product_id=data.product_id
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return {"message": "Added to wishlist"}

@router.delete("/remove")
def remove_from_wishlist(data: WishlistRemove, db: Session = Depends(get_db)):
    item = db.query(Wishlist).filter(
        Wishlist.user_id == data.user_id,
        Wishlist.product_id == data.product_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")

    db.delete(item)
    db.commit()

    return {"message": "Removed from wishlist"}