import os
import sys
import urllib.parse
from dotenv import load_dotenv
from pymongo import MongoClient

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

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI")
if not MONGO_URI:
    raise ValueError("Chưa tìm thấy MONGO_URI trong file .env!")

client = MongoClient(MONGO_URI)
db = client["flowers_db"]
products_col = db["products"]

DEFAULT_ADDONS = [
    {"name": "Thiệp viết tay cao cấp (Miễn phí)", "price": 0},
    {"name": "Hộp Socola Ferrero Rocher (5 viên)", "price": 65000},
    {"name": "Gấu bông mini ôm tim tình yêu", "price": 85000},
    {"name": "Đèn led đom đóm phát sáng lung linh", "price": 35000},
]

def make_url(folder: str, filename: str) -> str:
    return "/Images/" + urllib.parse.quote(folder, safe='/') + "/" + urllib.parse.quote(filename)

new_teddy_products = [
    {
        "name": "Gấu Bông Cún Husky Giận Dỗi Mặc Áo Đen - Grumpy Husky",
        "slug": "gau-bong-cun-husky-gian-doi-mac-ao-den",
        "category": "gau-bong",
        "tag": "Gấu Bông",
        "price": 320000,
        "original_price": 390000,
        "images": [
            make_url("Gấu bông/Cún giận dỗi", "400_FfvVIbUl42thhPY8fpDWHUEqq.webp"),
            make_url("Gấu bông/Cún giận dỗi", "400_Fk1grt088i7coMop6fiAjmQSe.webp"),
            make_url("Gấu bông/Cún giận dỗi", "400_GpzOdfm6wfZkA9lEY2872Ca7i.webp"),
            make_url("Gấu bông/Cún giận dỗi", "400_WCnFrzEC8iTdqN0iaDLX3Yz9B.webp"),
        ],
        "description": "Bé cún Husky bông với biểu cảm giận dỗi ngộ nghĩnh siêu đáng yêu, mặc áo hoodie đen cá tính, chất lông tuyết siêu êm ái ôm ngủ cực thích.",
        "composition": "Vải lông nhung tuyết co giãn 4 chiều mềm mịn, 100% bông gòn xoắn 3D tinh khiết đàn hồi tốt không xẹp lún.",
        "size": "Chiều dài ~55cm, Vòng bụng ~38cm",
        "is_same_day": True,
        "vendor_name": "Potico Teddy & Gifts",
        "stock": 35,
        "addons": DEFAULT_ADDONS,
    },
    {
        "name": "Bó Hoa Gấu Bông Tốt Nghiệp May Mắn - Lucky Grad Bear",
        "slug": "bo-hoa-gau-bong-tot-nghiep-may-man",
        "category": "gau-bong",
        "tag": "Gấu Bông",
        "price": 420000,
        "original_price": 520000,
        "images": [
            make_url("Gấu bông/Gấu may mắn", "400_67XPRcwXRJZo2OKd1tVph4DL0.webp"),
            make_url("Gấu bông/Gấu may mắn", "400_WJcdxThlRyqtOmTRgCXR3XXkQ.webp"),
            make_url("Gấu bông/Gấu may mắn", "400_sQV7irI27kck3rp1krGsmTcDB.webp"),
            make_url("Gấu bông/Gấu may mắn", "400_ux5XQjZMKpnZpzq87lCC9iZqf.webp"),
        ],
        "description": "Bó hoa thiết kế tinh tế với chú gấu bông cử nhân tốt nghiệp đeo kính nón tốt nghiệp sang trọng, thay lời chúc tương lai rạng ngời may mắn.",
        "composition": "Gấu bông cử nhân đeo kính nón cử nhân, Giấy gói lụa rượu vang cao cấp, Ruy băng nơ satin tinh tế.",
        "size": "Chiều cao bó hoa ~45cm, Đường kính ~35cm",
        "is_same_day": True,
        "vendor_name": "Potico Teddy & Gifts",
        "stock": 40,
        "addons": DEFAULT_ADDONS,
    },
]

print("=== THÊM 2 SẢN PHẨM GẤU BÔNG VÀO DATABASE ===")
for p in new_teddy_products:
    res = products_col.update_one(
        {"slug": p["slug"]},
        {"$set": p},
        upsert=True
    )
    if res.upserted_id:
        print(f"[+] Đã tạo mới: {p['name']} (ID: {res.upserted_id})")
    else:
        print(f"[✓] Đã cập nhật: {p['name']}")

print(f"\nTổng số sản phẩm gấu bông hiện tại:")
for p in products_col.find({"category": "gau-bong"}):
    print(f" - {p['name']} | Giá: {p['price']:,}đ | Số ảnh: {len(p['images'])}")
