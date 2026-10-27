import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

# Đảm bảo console trên Windows in được ký tự tiếng Việt UTF-8
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI")
if not MONGO_URI:
    raise ValueError("Chưa tìm thấy MONGO_URI hoặc MONGODB_URI trong file .env!")

client = MongoClient(MONGO_URI)
db = client["flowers_db"]
products_col = db["products"]

# Xóa dữ liệu cũ nếu có để tránh trùng lặp khi chạy lại
products_col.delete_many({})

sample_products = [
    {
        "name": "Bó Hoa Hồng Kem Dâu Pastel",
        "slug": "bo-hoa-hong-kem-dau-pastel",
        "category": "hoa-sinh-nhat",
        "price": 450000,
        "original_price": 520000,
        "images": [
            "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600"
        ],
        "description": "Hoa hồng pastel phối hoa baby trắng và lá bạc nhập khẩu. Phù hợp tặng sinh nhật, kỷ niệm.",
        "is_same_day": True,
        "vendor_name": "Tiệm Hoa Sài Gòn",
        "stock": 15,
        "addons": [
            {"name": "Thiệp viết tay cao cấp", "price": 0},
            {"name": "Gấu bông mini cử nhân", "price": 60000},
            {"name": "Hộp Socola Ferrero Rocher (3 viên)", "price": 45000}
        ]
    },
    {
        "name": "Hộp Hoa Hướng Dương Nắng Mai",
        "slug": "hop-hoa-huong-duong-nang-mai",
        "category": "hoa-khai-truong",
        "price": 590000,
        "original_price": 650000,
        "images": [
            "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600"
        ],
        "description": "Hoa hướng dương tươi phối cúc tana trong hộp gỗ cao cấp, biểu trưng cho sự khởi đầu may mắn.",
        "is_same_day": True,
        "vendor_name": "Flora Corner",
        "stock": 10,
        "addons": [
            {"name": "Banner chúc mừng in decal", "price": 0},
            {"name": "Thiệp chúc mừng", "price": 0}
        ]
    },
    {
        "name": "Bó Hoa Baby Rainbow Cầu Vồng",
        "slug": "bo-hoa-baby-rainbow-cau-vong",
        "category": "hoa-tinh-yeu",
        "price": 380000,
        "original_price": 420000,
        "images": [
            "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600"
        ],
        "description": "Hoa baby khô nhuộm màu pastel ngọt ngào, giữ được lâu từ 1 đến 2 năm.",
        "is_same_day": False,
        "vendor_name": "Tiệm Hoa Sài Gòn",
        "stock": 25,
        "addons": [
            {"name": "Đèn led đom đóm trang trí", "price": 25000},
            {"name": "Túi giấy đựng hoa trong suốt", "price": 30000}
        ]
    },
    {
        "name": "Set Quà Tặng Nến Thơm & Hoa Khô",
        "slug": "set-qua-tang-nen-thom-hoa-kho",
        "category": "qua-tang",
        "price": 320000,
        "original_price": 350000,
        "images": [
            "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600"
        ],
        "description": "Hộp quà bao gồm 1 hũ nến thơm sáp đậu nành hương gỗ ấm và 1 bó hoa khô mini.",
        "is_same_day": True,
        "vendor_name": "Gift & Soul",
        "stock": 30,
        "addons": [
            {"name": "Túi quà thắt nơ lụa", "price": 0}
        ]
    }
]

result = products_col.insert_many(sample_products)
print(f"Đã thêm thành công {len(result.inserted_ids)} sản phẩm vào MongoDB Atlas!")
