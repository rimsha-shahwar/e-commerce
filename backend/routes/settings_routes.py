from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Setting
from pydantic import BaseModel

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class SettingUpdate(BaseModel):
    store_name: str
    store_email: str
    store_phone: str
    store_address: str
    currency: str
    timezone: str
    order_auto_confirm: bool
    maintenance_mode: bool
    email_notifications: bool
    sms_notifications: bool
    low_stock_alerts: bool
    two_factor: bool
    logo_preview: str | None = None
    banner_preview: str | None = None

@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(Setting).first()

    if not settings:
        settings = Setting()
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return {
        "id": settings.id,
        "store_name": settings.store_name,
        "store_email": settings.store_email,
        "store_phone": settings.store_phone,
        "store_address": settings.store_address,
        "currency": settings.currency,
        "timezone": settings.timezone,
        "order_auto_confirm": settings.order_auto_confirm,
        "maintenance_mode": settings.maintenance_mode,
        "email_notifications": settings.email_notifications,
        "sms_notifications": settings.sms_notifications,
        "low_stock_alerts": settings.low_stock_alerts,
        "two_factor": settings.two_factor,
        "logo_preview": settings.logo_preview,
        "banner_preview": settings.banner_preview,
    }

@router.put("/settings")
def update_settings(data: SettingUpdate, db: Session = Depends(get_db)):
    settings = db.query(Setting).first()

    if not settings:
        settings = Setting()
        db.add(settings)
        db.commit()
        db.refresh(settings)

    settings.store_name = data.store_name
    settings.store_email = data.store_email
    settings.store_phone = data.store_phone
    settings.store_address = data.store_address
    settings.currency = data.currency
    settings.timezone = data.timezone
    settings.order_auto_confirm = data.order_auto_confirm
    settings.maintenance_mode = data.maintenance_mode
    settings.email_notifications = data.email_notifications
    settings.sms_notifications = data.sms_notifications
    settings.low_stock_alerts = data.low_stock_alerts
    settings.two_factor = data.two_factor
    settings.logo_preview = data.logo_preview
    settings.banner_preview = data.banner_preview

    db.commit()
    db.refresh(settings)

    return {
        "message": "Settings updated successfully",
        "settings": {
            "id": settings.id,
            "store_name": settings.store_name,
            "store_email": settings.store_email,
            "store_phone": settings.store_phone,
            "store_address": settings.store_address,
            "currency": settings.currency,
            "timezone": settings.timezone,
            "order_auto_confirm": settings.order_auto_confirm,
            "maintenance_mode": settings.maintenance_mode,
            "email_notifications": settings.email_notifications,
            "sms_notifications": settings.sms_notifications,
            "low_stock_alerts": settings.low_stock_alerts,
            "two_factor": settings.two_factor,
            "logo_preview": settings.logo_preview,
            "banner_preview": settings.banner_preview,
        }
    }