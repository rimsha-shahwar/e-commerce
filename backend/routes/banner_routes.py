from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Banner

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/banners")
def add_banner(data: dict, db: Session = Depends(get_db)):
    banner = Banner(**data)
    db.add(banner)
    db.commit()
    return banner

@router.get("/banners")
def get_banners(db: Session = Depends(get_db)):
    return db.query(Banner).all()