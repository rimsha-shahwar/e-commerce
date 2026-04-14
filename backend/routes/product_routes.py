from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Product

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/products")
def add_product(product: dict, db: Session = Depends(get_db)):
    new_product = Product(**product)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.get("/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()

@router.put("/products/{id}")
def update_product(id: int, data: dict, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Not found")

    for key in data:
        setattr(product, key, data[key])

    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{id}")
def delete_product(id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Not found")

    db.delete(product)
    db.commit()
    return {"message": "Deleted"}