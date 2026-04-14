import os
import json
import hmac
import hashlib
import razorpay

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from email_sender import send_invoice_email

from database import engine, SessionLocal
from models import (
    Base,
    Product,
    Category,
    Order,
    User,
    Banner,
    Admin,
    Address,
    Owner,
    Setting
)

# optional routers
from routes import (
    analytics_routes,
    order_routes,
    user_routes,
    product_routes,
    category_routes,
    banner_routes,
    admin_routes,
    cart_routes,
    wishlist_routes,
    settings_routes
)

# =========================================================
# LOAD ENV
# =========================================================
load_dotenv()

# =========================================================
# APP
# =========================================================
app = FastAPI()

# =========================================================
# DB SESSION
# =========================================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================================================
# CORS
# =========================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# CREATE TABLES
# =========================================================
Base.metadata.create_all(bind=engine)

# =========================================================
# RAZORPAY CONFIG
# =========================================================
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    raise Exception("Razorpay keys are missing in .env file")

razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# =========================================================
# OWNER
# =========================================================
class OwnerCreate(BaseModel):
    name: str
    email: str
    password: str


class OwnerLogin(BaseModel):
    email: str
    password: str


@app.post("/owner/register")
def register_owner(data: OwnerCreate, db: Session = Depends(get_db)):
    existing = db.query(Owner).filter(Owner.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    owner = Owner(
        name=data.name,
        email=data.email,
        password=data.password
    )
    db.add(owner)
    db.commit()
    db.refresh(owner)

    return {"message": "Owner registered successfully"}


@app.post("/owner/login")
def login_owner(data: OwnerLogin, db: Session = Depends(get_db)):
    owner = db.query(Owner).filter(
        Owner.email == data.email,
        Owner.password == data.password
    ).first()

    if not owner:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "id": owner.id,
        "name": owner.name,
        "email": owner.email,
        "role": owner.role
    }

# =========================================================
# ADMIN
# =========================================================
class AdminCreate(BaseModel):
    name: str
    email: str
    password: str


class AdminLogin(BaseModel):
    email: str
    password: str


@app.post("/admin/register")
def register_admin(data: AdminCreate, db: Session = Depends(get_db)):
    existing = db.query(Admin).filter(Admin.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    admin = Admin(**data.dict())
    db.add(admin)
    db.commit()
    db.refresh(admin)

    return {"message": "Admin registered successfully"}


@app.post("/admin/login")
def login_admin(data: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(
        Admin.email == data.email,
        Admin.password == data.password
    ).first()

    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "message": "Login success",
        "admin": {
            "id": admin.id,
            "name": admin.name,
            "email": admin.email
        }
    }

# =========================================================
# USER
# =========================================================
class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserUpdate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_image: Optional[str] = None


@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "address": u.address,
            "profile_image": u.profile_image,
            "role": u.role,
            "is_active": u.is_active
        }
        for u in users
    ]


@app.post("/users/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(**user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.post("/users/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    if user.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid password")

    if user.is_active in [False, 0, "0"]:
        raise HTTPException(status_code=403, detail="User blocked")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "address": user.address,
        "profile_image": user.profile_image
    }


@app.put("/users/{user_id}/toggle")
def toggle_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)

    return {
        "message": "User status updated",
        "is_active": user.is_active
    }


@app.put("/users/{user_id}")
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.name = data.name
    user.email = data.email
    user.phone = data.phone
    user.address = data.address
    user.profile_image = data.profile_image

    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "address": user.address,
        "profile_image": user.profile_image,
        "is_active": user.is_active
    }


@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully"}


@app.get("/users/check-by-email")
def check_user_by_email(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "email": user.email,
        "is_active": user.is_active
    }


@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "is_active": user.is_active
    }

# =========================================================
# PRODUCTS
# =========================================================
@app.post("/products")
def add_product(product: dict, db: Session = Depends(get_db)):
    new_product = Product(**product)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()


@app.put("/products/{product_id}")
def update_product(product_id: int, data: dict, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)

    return {
        "message": "Product updated successfully",
        "product": product
    }

# =========================================================
# CATEGORIES
# =========================================================
@app.post("/categories")
def add_category(category: dict, db: Session = Depends(get_db)):
    new_category = Category(**category)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category


@app.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

# =========================================================
# BANNERS
# =========================================================
@app.post("/banners")
def add_banner(data: dict, db: Session = Depends(get_db)):
    banner = Banner(**data)
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return banner


@app.get("/banners")
def get_banners(db: Session = Depends(get_db)):
    return db.query(Banner).all()

# =========================================================
# SETTINGS
# =========================================================
@app.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    setting = db.query(Setting).first()

    if not setting:
        setting = Setting()
        db.add(setting)
        db.commit()
        db.refresh(setting)

    return {
        "store_name": setting.store_name,
        "store_email": setting.store_email,
        "store_phone": setting.store_phone,
        "store_address": setting.store_address,
        "currency": setting.currency,
        "timezone": setting.timezone
    }

# =========================================================
# PAYMENT SCHEMAS
# =========================================================
class CreatePaymentOrderRequest(BaseModel):
    user_id: int
    amount: float
    currency: str = "INR"
    payment_mode: str
    products: List[dict]


class VerifyPaymentRequest(BaseModel):
    order_db_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class CODOrderRequest(BaseModel):
    user_id: int
    address_id: Optional[int] = None
    payment_mode: str
    total_amount: float
    products: List[dict]

# =========================================================
# PAYMENT ROUTES
# =========================================================
@app.post("/payments/create-order")
def create_payment_order(data: CreatePaymentOrderRequest, db: Session = Depends(get_db)):
    try:
        print("PAYMENT REQUEST:", data.dict())

        amount_in_paise = int(data.amount * 100)
        print("AMOUNT IN PAISE:", amount_in_paise)

        if amount_in_paise <= 0:
            raise HTTPException(status_code=400, detail="Invalid amount")

        razorpay_order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": data.currency,
            "receipt": f"receipt_{data.user_id}_{amount_in_paise}"
        })
        print("RAZORPAY ORDER:", razorpay_order)

        new_order = Order(
            user_id=data.user_id,
            address_id=None,
            payment_mode=data.payment_mode,
            payment_status="Pending",
            total_amount=data.amount,
            products=json.dumps(data.products),
            status="Pending",
            razorpay_order_id=razorpay_order["id"]
        )

        db.add(new_order)
        db.commit()
        db.refresh(new_order)

        return {
            "message": "Razorpay order created",
            "order_db_id": new_order.id,
            "razorpay_order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": razorpay_order["currency"],
            "key": RAZORPAY_KEY_ID
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        print("CREATE ORDER ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/payments/verify")
def verify_payment(data: VerifyPaymentRequest, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == data.order_db_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    generated_signature = hmac.new(
        bytes(RAZORPAY_KEY_SECRET, "utf-8"),
        bytes(f"{data.razorpay_order_id}|{data.razorpay_payment_id}", "utf-8"),
        hashlib.sha256
    ).hexdigest()

    if generated_signature != data.razorpay_signature:
        order.payment_status = "Failed"
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    order.razorpay_payment_id = data.razorpay_payment_id
    order.razorpay_signature = data.razorpay_signature
    order.payment_status = "Paid"
    order.status = "Confirmed"

    db.commit()
    db.refresh(order)

    return {
        "message": "Payment verified successfully",
        "order_id": order.id,
        "payment_status": order.payment_status
    }


@app.post("/orders/cod")
def create_cod_order(data: CODOrderRequest, db: Session = Depends(get_db)):
    try:
        new_order = Order(
            user_id=data.user_id,
            address_id=data.address_id,
            payment_mode=data.payment_mode,
            payment_status="COD",
            total_amount=data.total_amount,
            products=json.dumps(data.products),
            status="Pending"
        )

        db.add(new_order)
        db.commit()
        db.refresh(new_order)

        return {
            "message": "COD order placed successfully",
            "order_id": new_order.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/orders/{order_id}/address")
def attach_address_to_order(order_id: int, address_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    address = db.query(Address).filter(Address.id == address_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    order.address_id = address_id
    db.commit()
    db.refresh(order)

    return {"message": "Address attached successfully"}

# =========================================================
# ORDERS
# =========================================================
class OrderCreate(BaseModel):
    user_id: int
    address_id: int
    payment_mode: str
    total_amount: float
    products: List[dict]


@app.post("/orders")
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    try:
        new_order = Order(
            user_id=order.user_id,
            address_id=order.address_id,
            payment_mode=order.payment_mode,
            payment_status="Pending",
            total_amount=order.total_amount,
            products=json.dumps(order.products),
            status="Pending"
        )

        db.add(new_order)
        db.commit()
        db.refresh(new_order)

        return {
            "message": "Order placed successfully",
            "order_id": new_order.id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/orders")
def get_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    result = []

    for o in orders:
        products_list = json.loads(o.products) if o.products else []
        enriched_products = []

        for p in products_list:
            product = db.query(Product).filter(Product.id == p["product_id"]).first()

            if product:
                enriched_products.append({
                    "product_id": product.id,
                    "name": product.name,
                    "image": product.image,
                    "price": product.price,
                    "quantity": p["quantity"]
                })

        result.append({
            "id": o.id,
            "user_id": o.user_id,
            "address_id": o.address_id,
            "total_amount": o.total_amount,
            "payment_mode": o.payment_mode,
            "payment_status": getattr(o, "payment_status", "Pending"),
            "status": o.status,
            "razorpay_order_id": getattr(o, "razorpay_order_id", None),
            "razorpay_payment_id": getattr(o, "razorpay_payment_id", None),
            "products": enriched_products
        })

    return result


@app.get("/orders/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    products_list = json.loads(order.products) if order.products else []
    enriched_products = []

    for p in products_list:
        product = db.query(Product).filter(Product.id == p["product_id"]).first()

        if product:
            enriched_products.append({
                "product_id": product.id,
                "name": product.name,
                "image": product.image,
                "price": product.price,
                "quantity": p["quantity"]
            })

    return {
        "id": order.id,
        "user_id": order.user_id,
        "address_id": order.address_id,
        "total_amount": order.total_amount,
        "payment_mode": order.payment_mode,
        "payment_status": getattr(order, "payment_status", "Pending"),
        "status": order.status,
        "razorpay_order_id": getattr(order, "razorpay_order_id", None),
        "razorpay_payment_id": getattr(order, "razorpay_payment_id", None),
        "products": enriched_products
    }


@app.get("/orders/user/{user_id}")
def get_orders_by_user(user_id: int, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.user_id == user_id).all()

    result = []
    for o in orders:
        result.append({
            "id": o.id,
            "user_id": o.user_id,
            "address_id": o.address_id,
            "total_amount": o.total_amount,
            "payment_mode": o.payment_mode,
            "payment_status": getattr(o, "payment_status", "Pending"),
            "status": o.status,
            "razorpay_order_id": getattr(o, "razorpay_order_id", None),
            "razorpay_payment_id": getattr(o, "razorpay_payment_id", None),
            "products": json.loads(o.products) if o.products else []
        })

    return result


@app.put("/orders/cancel/{order_id}")
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = "Cancelled"
    db.commit()

    return {"message": "Order cancelled"}


@app.post("/orders/{order_id}/send-invoice")
def send_order_invoice(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    user = db.query(User).filter(User.id == order.user_id).first()

    print("ORDER USER:", user.email if user else None)

    if not user or not user.email:
        raise HTTPException(status_code=400, detail="Mail is incorrect")

    products_list = json.loads(order.products) if order.products else []
    enriched_products = []

    for p in products_list:
        product = db.query(Product).filter(Product.id == p["product_id"]).first()

        if product:
            enriched_products.append({
                "product_id": product.id,
                "name": product.name,
                "image": product.image,
                "price": product.price,
                "quantity": p["quantity"]
            })

    order_data = {
        "id": order.id,
        "user_id": order.user_id,
        "payment_mode": order.payment_mode,
        "payment_status": getattr(order, "payment_status", "Pending"),
        "status": order.status,
        "total_amount": order.total_amount,
        "razorpay_order_id": getattr(order, "razorpay_order_id", None),
        "razorpay_payment_id": getattr(order, "razorpay_payment_id", None),
        "products": enriched_products
    }

    send_invoice_email(user.email, order_data)

    return {
        "message": f"Invoice sent successfully to {user.email}"
    }


# =========================================================
# ADDRESS
# =========================================================
class AddressCreate(BaseModel):
    user_id: int
    name: str
    phone: str
    address_line: str
    city: str
    state: str
    pincode: str


@app.post("/addresses")
def add_address(data: AddressCreate, db: Session = Depends(get_db)):
    new_address = Address(**data.dict())
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address


@app.get("/addresses/{user_id}")
def get_addresses(user_id: int, db: Session = Depends(get_db)):
    return db.query(Address).filter(Address.user_id == user_id).all()


@app.delete("/addresses/{id}")
def delete_address(id: int, db: Session = Depends(get_db)):
    addr = db.query(Address).filter(Address.id == id).first()

    if not addr:
        raise HTTPException(status_code=404, detail="Not found")

    db.delete(addr)
    db.commit()
    return {"message": "Deleted"}

# =========================================================
# EXTRA ROUTERS
# =========================================================
app.include_router(analytics_routes.router)
app.include_router(order_routes.router)
app.include_router(user_routes.router)
app.include_router(product_routes.router)
app.include_router(category_routes.router)
app.include_router(banner_routes.router)
app.include_router(admin_routes.router)
app.include_router(cart_routes.router)
app.include_router(wishlist_routes.router)
app.include_router(settings_routes.router)