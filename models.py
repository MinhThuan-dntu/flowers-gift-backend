"""
Các Document models cho MongoEngine (ODM).
Phù hợp cho dự án Flowers Websites / Thương mại điện tử hoa.
"""

from datetime import datetime
from mongoengine import (
    Document,
    StringField,
    FloatField,
    IntField,
    BooleanField,
    DateTimeField,
    ListField,
    ReferenceField,
    CASCADE,
)


class Category(Document):
    """Danh mục hoa (ví dụ: Hoa sinh nhật, Hoa cưới, Hoa khai trương...)"""
    name = StringField(required=True, unique=True, max_length=100)
    description = StringField()
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "categories",
        "indexes": ["name"],
        "ordering": ["name"],
    }

    def __str__(self):
        return self.name


class Flower(Document):
    """Thông tin sản phẩm hoa"""
    name = StringField(required=True, max_length=150)
    category = ReferenceField(Category, reverse_delete_rule=CASCADE)
    price = FloatField(required=True, min_value=0.0)
    stock = IntField(default=0, min_value=0)
    description = StringField()
    tags = ListField(StringField(max_length=50))
    is_available = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "flowers",
        "indexes": ["name", "category", "price"],
        "ordering": ["-created_at"],
    }

    def __str__(self):
        return f"{self.name} - {self.price:,.0f} VND"
