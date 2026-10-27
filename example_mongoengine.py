"""
Ví dụ thao tác CRUD sử dụng MongoEngine (ODM - Object Document Mapper).
Chạy: python example_mongoengine.py
"""

import sys
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from database import init_mongoengine
from models import Category, Flower


def run_mongoengine_demo():
    print("=" * 60)
    print("DEMO THAO TÁC CƠ SỞ DỮ LIỆU BẰNG MONGOENGINE")
    print("=" * 60)

    try:
        # 1. Khởi tạo kết nối MongoEngine
        print("[*] Đang khởi tạo kết nối MongoEngine...")
        init_mongoengine()
        print("[✓] Kết nối MongoEngine thành công!")

        # 2. CREATE: Tạo hoặc lấy danh mục (Category)
        category_name = "Hoa Cưới Cầm Tay"
        category = Category.objects(name=category_name).first()
        if not category:
            category = Category(
                name=category_name,
                description="Bộ sưu tập hoa cưới sang trọng, thanh lịch cho cô dâu",
            ).save()
            print(f"[+] Tạo mới danh mục: {category.name}")
        else:
            print(f"[i] Đã có danh mục: {category.name}")

        # 3. CREATE: Tạo sản phẩm hoa tham chiếu đến Category
        flower = Flower(
            name="Bó Hoa Cưới Tulip Trắng Hà Lan",
            category=category,
            price=850000.0,
            stock=10,
            description="Hoa tulip trắng nhập khẩu trực tiếp Hà Lan, phối lá bạc thanh lịch.",
            tags=["hoa cuoi", "tulip", "nhap khau", "sang trong"],
            is_available=True,
        ).save()
        print(f"[+] Đã lưu hoa: {flower.name} (ID: {flower.id})")

        # 4. READ & QUERY: Lọc dữ liệu qua QuerySet
        cheap_flowers = Flower.objects(price__lte=1000000)
        print(f"\n[i] Danh sách hoa có giá <= 1,000,000 VND (Tổng: {cheap_flowers.count()}):")
        for f in cheap_flowers[:5]:
            cat_name = f.category.name if f.category else "Không có"
            print(f"    - {f.name} | Danh mục: {cat_name} | Giá: {f.price:,.0f} VND")

        # 5. UPDATE: Cập nhật tồn kho
        flower.stock += 5
        flower.save()
        print(f"[✓] Đã cập nhật tồn kho mới: {flower.stock}")

        print("\n=> Demo MongoEngine hoàn tất thành công!")

    except Exception as e:
        print(f"[X] Gặp lỗi khi chạy MongoEngine demo: {e}")


if __name__ == "__main__":
    run_mongoengine_demo()
