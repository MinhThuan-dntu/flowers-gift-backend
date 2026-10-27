"""
Ví dụ thao tác CRUD sử dụng PyMongo.
Chạy: python example_pymongo.py
"""

import sys
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from datetime import datetime
from database import get_database, test_connection


def run_pymongo_demo():
    print("=" * 60)
    print("DEMO THAO TÁC CƠ SỞ DỮ LIỆU BẰNG PYMONGO")
    print("=" * 60)

    # 1. Kiểm tra kết nối trước
    if not test_connection():
        print("[!] Không thể tiếp tục vì kết nối thất bại.")
        return

    db = get_database()
    flowers_col = db["flowers_raw"]

    # 2. CREATE: Thêm tài liệu (Insert)
    sample_flower = {
        "name": "Hoa Hồng Đỏ Ecuador",
        "category": "Hoa tình yêu",
        "price": 350000.0,
        "stock": 25,
        "is_available": True,
        "created_at": datetime.utcnow(),
    }
    insert_result = flowers_col.insert_one(sample_flower)
    print(f"\n[+] Đã thêm 1 bông hoa với ID: {insert_result.inserted_id}")

    # 3. READ: Tìm kiếm tài liệu (Find)
    found_flower = flowers_col.find_one({"_id": insert_result.inserted_id})
    print(f"[i] Dữ liệu vừa lấy ra: {found_flower['name']} - Giá: {found_flower['price']:,} VND")

    # 4. UPDATE: Cập nhật tài liệu (Update)
    flowers_col.update_one(
        {"_id": insert_result.inserted_id},
        {"$set": {"price": 320000.0, "discount": 10}}
    )
    updated_flower = flowers_col.find_one({"_id": insert_result.inserted_id})
    print(f"[✓] Sau khi cập nhật giá: {updated_flower['price']:,} VND")

    # 5. LIST: Đếm số lượng
    count = flowers_col.count_documents({})
    print(f"[i] Tổng số hoa trong collection 'flowers_raw': {count}")

    print("\n=> Demo PyMongo hoàn tất thành công!")


if __name__ == "__main__":
    run_pymongo_demo()
