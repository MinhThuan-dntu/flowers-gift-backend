"""
Script kiểm tra kết nối nhanh tới MongoDB Atlas.
Chạy: python test_connection.py
"""

import sys
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from database import test_connection

if __name__ == "__main__":
    success = test_connection()
    if not success:
        print("\n[HƯỚNG DẪN XỬ LÝ NHANH]")
        print("1. Mở file .env và cập nhật MONGODB_URI với chuỗi kết nối thực tế từ MongoDB Atlas.")
        print("2. Đảm bảo tài khoản database (username & password) đã được tạo trong MongoDB Atlas -> Database Access.")
        print("3. Đảm bảo IP hiện tại đã được whitelist trong MongoDB Atlas -> Network Access.")
        print("   (Chọn 'Add Current IP Address' hoặc tạm thời chọn 'Allow Access From Anywhere: 0.0.0.0/0').")
