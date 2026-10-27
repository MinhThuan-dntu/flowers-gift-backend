import os
import sys
from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pymongo import MongoClient

# Đảm bảo console trên Windows in được ký tự UTF-8
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

load_dotenv()

app = FastAPI(
    title="Flower & Gift Delivery API",
    description="Backend API cho dịch vụ đặt hoa tươi & quà tặng trực tuyến (phong cách Potico.vn)",
    version="1.0.0",
)

# Cấu hình CORS để Frontend (React/Vue/HTML) gọi được API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI")
if not MONGO_URI:
    raise ValueError("Chưa tìm thấy MONGO_URI hoặc MONGODB_URI trong file .env!")

client = MongoClient(MONGO_URI)
db = client["flowers_db"]
products_col = db["products"]
orders_col = db["orders"]
reminders_col = db["reminders"]


def serialize_item(item: dict) -> dict:
    """Chuyển đổi ObjectId của MongoDB thành string để trả về JSON."""
    item["id"] = str(item["_id"])
    del item["_id"]
    return item


@app.get("/", tags=["General"])
def root():
    return {
        "message": "Chào mừng đến với API Flower & Gift Delivery!",
        "docs_url": "/docs",
        "health": "OK",
    }


# 1. API lấy danh sách sản phẩm (có lọc theo danh mục, giao trong ngày, tìm kiếm)
@app.get("/api/products", tags=["Products"])
def get_products(
    category: Optional[str] = Query(None, description="Lọc theo slug danh mục, ví dụ: hoa-sinh-nhat"),
    same_day: Optional[bool] = Query(None, description="Lọc sản phẩm giao trong ngày (True/False)"),
    q: Optional[str] = Query(None, description="Tìm kiếm theo tên sản phẩm"),
):
    filter_query = {}
    if category:
        filter_query["category"] = category
    if same_day is not None:
        filter_query["is_same_day"] = same_day
    if q:
        filter_query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"tag": {"$regex": q, "$options": "i"}},
            {"category": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ]

    cursor = products_col.find(filter_query)
    return [serialize_item(doc) for doc in cursor]


# 2. API xem chi tiết 1 sản phẩm
@app.get("/api/products/{product_id}", tags=["Products"])
def get_product_detail(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="ID sản phẩm không hợp lệ")

    product = products_col.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")

    return serialize_item(product)


# 3. Model và API tạo đơn đặt hàng
class OrderItem(BaseModel):
    product_id: str
    name: str
    price: int
    quantity: int
    addons: List[str] = []


class OrderCreateRequest(BaseModel):
    recipient_name: str
    recipient_phone: str
    delivery_address: str
    delivery_date: str  # Định dạng YYYY-MM-DD
    delivery_time_slot: str  # Ví dụ: 09:00 - 12:00
    card_message: Optional[str] = ""
    is_anonymous: bool = False
    items: List[OrderItem]
    total_amount: int
    user_email: Optional[str] = ""


@app.post("/api/orders", tags=["Orders"])
def create_order(order: OrderCreateRequest):
    # Hỗ trợ cả Pydantic v1 và v2
    order_data = order.model_dump() if hasattr(order, "model_dump") else order.dict()
    order_data["status"] = "pending_payment"
    order_data["created_at"] = datetime.utcnow()

    res = orders_col.insert_one(order_data)
    order_id = str(res.inserted_id)

    # Sinh link mã VietQR thanh toán nhanh
    bank_id = "MB"
    account_no = "0901234567"  # Thay số tài khoản thực tế của bạn nếu cần
    memo = f"HOA_{order_id[-6:].upper()}"
    vietqr_url = f"https://img.vietqr.io/image/{bank_id}-{account_no}-compact2.png?amount={order.total_amount}&addInfo={memo}"

    # Cập nhật mã QR và memo vào DB
    orders_col.update_one(
        {"_id": res.inserted_id},
        {"$set": {"payment_qr_url": vietqr_url, "transfer_memo": memo}}
    )

    return {
        "order_id": order_id,
        "payment_qr_url": vietqr_url,
        "transfer_memo": memo,
        "total_amount": order.total_amount,
        "message": "Đơn hàng đã được khởi tạo thành công!",
    }


# API tra cứu danh sách đơn hàng cho người dùng (theo email hoặc phone)
@app.get("/api/orders", tags=["Orders"])
def get_orders(
    email: Optional[str] = Query(None, description="Lọc theo email người đặt"),
    phone: Optional[str] = Query(None, description="Lọc theo số điện thoại người nhận/đặt"),
):
    query = {}
    if email and phone:
        query = {"$or": [{"user_email": email}, {"recipient_phone": phone}]}
    elif email:
        query = {"user_email": email}
    elif phone:
        query = {"recipient_phone": phone}

    orders = list(orders_col.find(query).sort("_id", -1))
    for order in orders:
        if "created_at" in order and isinstance(order["created_at"], datetime):
            order["created_at"] = order["created_at"].isoformat()
        if "payment_qr_url" not in order:
            oid = str(order["_id"])
            order["payment_qr_url"] = f"https://img.vietqr.io/image/MB-0901234567-compact2.png?amount={order.get('total_amount', 0)}&addInfo=HOA_{oid[-6:].upper()}"
            order["transfer_memo"] = f"HOA_{oid[-6:].upper()}"
    return [serialize_item(order) for order in orders]


# API tra cứu toàn bộ đơn hàng (Admin)
@app.get("/api/admin/orders", tags=["Orders"])
def get_all_orders():
    orders = list(orders_col.find().sort("_id", -1))
    for order in orders:
        if "created_at" in order and isinstance(order["created_at"], datetime):
            order["created_at"] = order["created_at"].isoformat()
        if "payment_qr_url" not in order:
            oid = str(order["_id"])
            order["payment_qr_url"] = f"https://img.vietqr.io/image/MB-0901234567-compact2.png?amount={order.get('total_amount', 0)}&addInfo=HOA_{oid[-6:].upper()}"
            order["transfer_memo"] = f"HOA_{oid[-6:].upper()}"
    return [serialize_item(order) for order in orders]


# ==========================================
# 4. REMINDER SERVICE (NHẮC NHỞ NGÀY KỶ NIỆM)
# ==========================================

class ReminderCreateRequest(BaseModel):
    user_email: str
    recipient_name: str
    occasion_name: str  # Ví dụ: Sinh nhật bạn gái, Kỷ niệm ngày cưới...
    event_date: str  # Định dạng: YYYY-MM-DD
    remind_before_days: int = 3  # Nhắc trước bao nhiêu ngày (mặc định 3 ngày)
    notes: Optional[str] = ""


# API đăng ký nhắc nhở ngày kỷ niệm
@app.post("/api/reminders", tags=["Reminders"])
def create_reminder(payload: ReminderCreateRequest):
    reminder_data = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
    reminder_data["created_at"] = datetime.utcnow()

    res = reminders_col.insert_one(reminder_data)
    return {
        "reminder_id": str(res.inserted_id),
        "message": f"Đã lưu nhắc nhở cho dịp '{payload.occasion_name}' thành công!",
    }


# API lấy danh sách các sự kiện cần nhắc nhở
@app.get("/api/reminders", tags=["Reminders"])
def get_reminders(email: Optional[str] = Query(None, description="Lọc theo email người dùng")):
    query = {}
    if email:
        query["user_email"] = email
    reminders = list(reminders_col.find(query).sort("event_date", 1))
    return [serialize_item(r) for r in reminders]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
