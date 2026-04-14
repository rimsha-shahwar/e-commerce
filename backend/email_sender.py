import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email_validator import validate_email, EmailNotValidError
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))


def validate_receiver_email(email: str) -> str:
    try:
        valid = validate_email(email, check_deliverability=False)
        return valid.email
    except EmailNotValidError as e:
        print("EMAIL VALIDATION ERROR:", str(e))
        raise HTTPException(status_code=400, detail="Mail is incorrect")


def build_invoice_body(order: dict) -> str:
    products_text = "\n".join(
        [
            f"{idx + 1}. {p['name']} x {p['quantity']} = ₹{p['price'] * p['quantity']}"
            for idx, p in enumerate(order["products"])
        ]
    )

    return f"""
Hello,

Thank you for your order.

Invoice Details
-------------------------
Order ID: {order['id']}
User ID: {order['user_id']}
Payment Mode: {order['payment_mode']}
Payment Status: {order['payment_status']}
Razorpay Order ID: {order.get('razorpay_order_id') or 'N/A'}
Razorpay Payment ID: {order.get('razorpay_payment_id') or 'N/A'}
Order Status: {order['status']}
Total Amount: ₹{order['total_amount']}

Products:
{products_text}

Thank you for shopping with us.
""".strip()


def send_invoice_email(to_email: str, order: dict):
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("SMTP CONFIG ERROR: missing SMTP_EMAIL or SMTP_PASSWORD")
        raise HTTPException(status_code=500, detail="Email configuration missing")

    validated_email = validate_receiver_email(to_email)

    subject = f"Invoice for Order #{order['id']}"
    body = build_invoice_body(order)

    msg = MIMEMultipart()
    msg["From"] = SMTP_EMAIL
    msg["To"] = validated_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        print("SMTP_EMAIL:", SMTP_EMAIL)
        print("TO_EMAIL:", validated_email)
        print("SMTP_HOST:", SMTP_HOST)
        print("SMTP_PORT:", SMTP_PORT)

        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, validated_email, msg.as_string())
        server.quit()

        print("MAIL SENT SUCCESSFULLY")

    except Exception as e:
        print("SMTP ERROR:", str(e))
        raise HTTPException(status_code=400, detail=str(e))