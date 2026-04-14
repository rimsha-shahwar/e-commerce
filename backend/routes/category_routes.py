from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Category
from pydantic import BaseModel

router = APIRouter()

class CategoryCreate(BaseModel):
    name: str
    image: str = ""

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/categories")
def add_category(cat: CategoryCreate, db: Session = Depends(get_db)):
    new = Category(**cat.dict())
    db.add(new)
    db.commit()
    db.refresh(new)
    return new

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()