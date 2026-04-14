from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Order, User, Admin

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/admin/analytics")
def analytics(db: Session = Depends(get_db)):

    users_count = db.query(User).count()
    admins_count = db.query(Admin).count()
    orders = db.query(Order).all()

    total_orders = len(orders)

    # ✅ FIXED revenue calculation
    revenue = 0
    for o in orders:
        if o.total_amount:
            revenue += o.total_amount

    return {
        "users": users_count,
        "admins": admins_count,
        "orders": total_orders,
        "revenue": revenue
    }