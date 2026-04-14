from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Cart, Product
from pydantic import BaseModel

router = APIRouter(prefix="/cart")

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Request body schema
class CartCreate(BaseModel):
    user_id: int
    product_id: int
    quantity: int


class CartRemove(BaseModel):
    user_id: int
    product_id: int


# ✅ ADD TO CART
@router.post("/")
def add_to_cart(cart: CartCreate, db: Session = Depends(get_db)):
    try:
        product = db.query(Product).filter(Product.id == cart.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        existing = db.query(Cart).filter(
            Cart.user_id == cart.user_id,
            Cart.product_id == cart.product_id
        ).first()

        if existing:
            existing.quantity += cart.quantity
            db.commit()
            db.refresh(existing)
            return {"message": "Cart updated"}

        cart_item = Cart(
            user_id=cart.user_id,
            product_id=cart.product_id,
            quantity=cart.quantity
        )

        db.add(cart_item)
        db.commit()
        db.refresh(cart_item)

        return {"message": "Added to cart"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ GET CART BY USER
@router.get("/{user_id}")
def get_cart(user_id: int, db: Session = Depends(get_db)):
    try:
        cart_items = db.query(Cart).filter(Cart.user_id == user_id).all()

        result = []

        for item in cart_items:
            product = db.query(Product).filter(Product.id == item.product_id).first()

            if not product:
                continue

            result.append({
                "id": item.product_id,
                "name": product.name,
                "price": product.price,
                "image": product.image,
                "quantity": item.quantity
            })

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ UPDATE CART QUANTITY
@router.put("/update")
def update_cart(cart: CartCreate, db: Session = Depends(get_db)):
    try:
        cart_item = db.query(Cart).filter(
            Cart.user_id == cart.user_id,
            Cart.product_id == cart.product_id
        ).first()

        if not cart_item:
            raise HTTPException(status_code=404, detail="Cart item not found")

        if cart.quantity < 1:
            raise HTTPException(status_code=400, detail="Quantity must be at least 1")

        cart_item.quantity = cart.quantity
        db.commit()
        db.refresh(cart_item)

        return {"message": "Cart quantity updated"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ REMOVE ITEM FROM CART
@router.delete("/remove")
def remove_from_cart(data: CartRemove, db: Session = Depends(get_db)):
    try:
        cart_item = db.query(Cart).filter(
            Cart.user_id == data.user_id,
            Cart.product_id == data.product_id
        ).first()

        if not cart_item:
            raise HTTPException(status_code=404, detail="Cart item not found")

        db.delete(cart_item)
        db.commit()

        return {"message": "Item removed from cart"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))