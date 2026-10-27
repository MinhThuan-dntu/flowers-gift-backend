"""
Module quản lý kết nối MongoDB Atlas cho cả PyMongo và MongoEngine.
"""

import os
import sys
from dotenv import load_dotenv

# Đảm bảo console trên Windows in được ký tự tiếng Việt UTF-8
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from pymongo import MongoClient
from pymongo.server_api import ServerApi
from pymongo.errors import (
    ConnectionFailure,
    ServerSelectionTimeoutError,
    OperationFailure,
    ConfigurationError,
)
import mongoengine

# Tải biến môi trường từ file .env
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "")
DATABASE_NAME = os.getenv("DATABASE_NAME", "flowers_db")

_mongo_client = None


def _get_connection_info():
    load_dotenv(override=True)
    uri = os.getenv("MONGODB_URI", "").strip()
    db_name = os.getenv("DATABASE_NAME", "flowers_db").strip()

    if not uri or "<username>" in uri or "<password>" in uri or "<db_password>" in uri:
        raise ValueError(
            "Chưa cấu hình MONGODB_URI hợp lệ trong file .env!\n"
            "Vui lòng mở file .env và thay thế <db_password> (hoặc <password>) bằng mật khẩu thực tế của bạn."
        )
    return uri, db_name


def get_mongo_client(server_selection_timeout_ms: int = 5000) -> MongoClient:
    """
    Khởi tạo và trả về singleton MongoClient (PyMongo).
    """
    global _mongo_client
    uri, _ = _get_connection_info()

    if _mongo_client is None:
        _mongo_client = MongoClient(
            uri,
            server_api=ServerApi("1"),
            serverSelectionTimeoutMS=server_selection_timeout_ms,
        )
    return _mongo_client


def get_database(db_name: str | None = None):
    """
    Lấy đối tượng Database từ PyMongo.
    """
    _, default_db = _get_connection_info()
    client = get_mongo_client()
    return client[db_name or default_db]


def init_mongoengine(db_name: str | None = None, alias: str = "default"):
    """
    Khởi tạo kết nối MongoEngine với MongoDB Atlas.
    """
    uri, default_db = _get_connection_info()
    target_db = db_name or default_db
    return mongoengine.connect(
        db=target_db,
        host=uri,
        alias=alias,
        serverSelectionTimeoutMS=5000,
    )


def test_connection() -> bool:
    """
    Kiểm tra kết nối tới MongoDB Atlas và in ra thông báo lỗi chi tiết nếu có sự cố.
    """
    try:
        _, target_db = _get_connection_info()
    except ValueError as e:
        print(f"[!] Lỗi cấu hình: {e}")
        return False

    print(f"[*] Đang kiểm tra kết nối tới MongoDB Atlas (Database: {target_db})...")

    try:
        client = get_mongo_client(server_selection_timeout_ms=5000)
        # Lệnh ping kiểm tra xác thực và kết nối
        client.admin.command("ping")
        print("[✓] Kết nối MongoDB Atlas thành công!")

        # In danh sách database hiện có
        dbs = client.list_database_names()
        print(f"[i] Các database hiện có trên cluster: {dbs}")
        return True

    except ValueError as e:
        print(f"[!] Lỗi cấu hình: {e}")
        return False
    except OperationFailure as e:
        print(f"[X] Lỗi xác thực tài khoản (Authentication Failed):")
        print(f"    Chi tiết: {e}")
        print("    -> Vui lòng kiểm tra lại username và password trong MongoDB Atlas (Database Access).")
        return False
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        print(f"[X] Không thể kết nối tới server (Timeout/ConnectionFailure):")
        print(f"    Chi tiết: {e}")
        print("    -> Nguyên nhân phổ biến: Địa chỉ IP của bạn chưa được cấp quyền (whitelist) trên Atlas.")
        print("    -> Khắc phục: Vào MongoDB Atlas -> Network Access -> Add IP Address -> Chọn 'Add Current IP Address' hoặc '0.0.0.0/0' (cho dev/test).")
        return False
    except ConfigurationError as e:
        print(f"[X] Lỗi định dạng URI hoặc thiếu dnspython:")
        print(f"    Chi tiết: {e}")
        return False
    except Exception as e:
        print(f"[X] Lỗi không xác định: {type(e).__name__} - {e}")
        return False


if __name__ == "__main__":
    test_connection()
