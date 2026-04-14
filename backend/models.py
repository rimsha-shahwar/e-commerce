from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, Text
from database import Base

# ----------------- OWNER -----------------
class Owner(Base):
    __tablename__ = "owners"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="owner")


# ----------------- ADMIN -----------------
class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    is_active = Column(Boolean, default=True)


# ----------------- USER -----------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
    role = Column(String, default="user")
    is_active = Column(Boolean, default=True)


# ----------------- CART -----------------
class Cart(Base):
    __tablename__ = "cart"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    product_id = Column(Integer)
    quantity = Column(Integer)


# ----------------- WISHLIST -----------------
class Wishlist(Base):
    __tablename__ = "wishlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    product_id = Column(Integer)


# ----------------- PRODUCT -----------------
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    price = Column(Float)
    category = Column(String)
    brand = Column(String)
    image = Column(String)
    description = Column(String, default="")
    stock = Column(Integer, default=0)


# ----------------- CATEGORY -----------------
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    image = Column(String, nullable=True)


# ----------------- BANNER -----------------
class Banner(Base):
    __tablename__ = "banners"

    id = Column(Integer, primary_key=True)
    image = Column(String)
    title = Column(String)


# ----------------- ORDER -----------------
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    address_id = Column(Integer, nullable=True)
    payment_mode = Column(String)
    payment_status = Column(String, default="Pending")
    total_amount = Column(Float)
    products = Column(Text)
    status = Column(String, default="Pending")
    razorpay_order_id = Column(String, nullable=True)
    razorpay_payment_id = Column(String, nullable=True)
    razorpay_signature = Column(String, nullable=True)


# ----------------- ADDRESS -----------------
class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    name = Column(String)
    phone = Column(String)
    address_line = Column(String)
    city = Column(String)
    state = Column(String)
    pincode = Column(String)


# ----------------- SETTINGS -----------------
class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    store_name = Column(String, default="My E-Commerce")
    store_email = Column(String, default="support@myecommerce.com")
    store_phone = Column(String, default="+91 9876543210")
    store_address = Column(String, default="Hyderabad, Telangana, India")
    currency = Column(String, default="INR")
    timezone = Column(String, default="Asia/Kolkata")
    order_auto_confirm = Column(Boolean, default=True)
    maintenance_mode = Column(Boolean, default=False)
    email_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=False)
    low_stock_alerts = Column(Boolean, default=True)
    two_factor = Column(Boolean, default=False)
    logo_preview = Column(Text, nullable=True)
    banner_preview = Column(Text, nullable=True)