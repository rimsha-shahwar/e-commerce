from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Admin, Order
from pydantic import BaseModel

router = APIRouter()

# ================= DB =================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ================= SCHEMAS =================
class AdminCreate(BaseModel):
    name: str
    email: str
    password: str


class AdminLogin(BaseModel):
    email: str
    password: str


# ================= REGISTER ADMIN =================
@router.post("/admin/register")
def register_admin(data: AdminCreate, db: Session = Depends(get_db)):
    existing = db.query(Admin).filter(Admin.email == data.email).first()

    if existing:
        raise HTTPException(status_code=400, detail="Admin already exists")

    new_admin = Admin(
        name=data.name,
        email=data.email,
        password=data.password,
        is_active=True   # ✅ FIX ADDED
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return {"message": "Admin registered successfully"}


# ================= LOGIN ADMIN =================
@router.post("/admin/login")
def admin_login(data: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == data.email).first()

    if not admin or admin.password != data.password:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # 🚨 BLOCK CHECK
    if not admin.is_active:
        raise HTTPException(status_code=403, detail="Admin is blocked")

    return {"message": "Login successful", "admin_id": admin.id}


# ================= GET ALL ADMINS =================
@router.get("/admins")
def get_admins(db: Session = Depends(get_db)):
    admins = db.query(Admin).all()

    result = []

    for admin in admins:
        # ⚠ TEMP LOGIC (since no admin_id in Order)
        orders = db.query(Order).all()

        total_orders = len(orders)
        revenue = sum(o.total_amount or 0 for o in orders)

        result = []

        for admin in admins:
            result.append({
                "id": admin.id,
                "name": admin.name,
                "email": admin.email,
                "is_active": getattr(admin, "is_active", True),
                "orders": total_orders,
                "revenue": revenue
            })

    return result


# ================= BLOCK ADMIN =================
@router.put("/admins/block/{id}")
def block_admin(id: int, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.id == id).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    admin.is_active = False
    db.commit()

    return {"message": "Admin blocked"}


# ================= UNBLOCK ADMIN =================
@router.put("/admins/unblock/{id}")
def unblock_admin(id: int, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.id == id).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    admin.is_active = True
    db.commit()

    return {"message": "Admin unblocked"}


# ================= DELETE ADMIN =================
@router.delete("/admins/{id}")
def delete_admin(id: int, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.id == id).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    db.delete(admin)
    db.commit()

    return {"message": "Admin deleted"}