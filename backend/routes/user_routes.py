from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from pydantic import BaseModel
import shutil, os

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    phone: str = ""
    address: str = ""
    profile_image: str = ""
    role: str = "user"

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: str
    phone: str = ""
    address: str = ""
    profile_image: str = ""

# SIGNUP
@router.post("/users/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(**user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

# LOGIN
@router.post("/users/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == data.email,
        User.password == data.password
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail=" User is blocked")
    
    return user

# GET USERS
@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

# UPDATE PROFILE (WITH IMAGE)
@router.put("/users/{id}")
def update_user(
    id: int,
    name: str = Form(...),
    phone: str = Form(""),
    address: str = Form(""),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.name = name
    user.phone = phone
    user.address = address

    if file:
        file_path = f"{UPLOAD_DIR}/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        user.profile_image = file_path

    db.commit()
    db.refresh(user)

    return user

# DELETE
@router.delete("/users/{id}")
def delete_user(id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "Deleted"}

# BLOCK USER
@router.put("/users/block/{id}")
def block_user(id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    db.commit()
    return {"message": "User blocked"}


# UNBLOCK USER
@router.put("/users/unblock/{id}")
def unblock_user(id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = True
    db.commit()
    return {"message": "User unblocked"}