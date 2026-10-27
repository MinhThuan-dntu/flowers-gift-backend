import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient

# Configure UTF-8 for console
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

load_dotenv()
mongo_uri = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI")
if not mongo_uri:
    print("❌ Chưa tìm thấy MONGO_URI trong file .env!")
    sys.exit(1)

client = MongoClient(mongo_uri)
db = client["flowers_db"]
products_col = db["products"]

# Default addons
DEFAULT_ADDONS = [
    {"name": "Thiệp viết tay cao cấp (Miễn phí)", "price": 0},
    {"name": "Hộp Socola Ferrero Rocher (5 viên)", "price": 65000},
    {"name": "Gấu bông mini ôm tim tình yêu", "price": 85000},
    {"name": "Đèn led đom đóm phát sáng lung linh", "price": 35000},
]

NEW_PRODUCTS = [
    # ==========================================
    # 1. HOA SINH NHẬT (Birthday folder)
    # ==========================================
    {
        "name": "Bó Hoa Sinh Nhật Ngọt Ngào - Sweet Sunshine",
        "slug": "bo-hoa-sinh-nhat-ngot-ngao",
        "category": "hoa-sinh-nhat",
        "price": 420000,
        "original_price": 500000,
        "images": [
            "/Images/Birthday/400_1EIRaCPJ4tVDLwhp1oNT26yht.webp",
            "/Images/Birthday/400_i7aUFx8Rni2Qkj8WNBZoMVarr.webp",
            "/Images/Birthday/400_J1yyfCox5zived2A5q3VlYEKn.webp",
        ],
        "description": "Bó hoa tone vàng ấm áp và cam ngọt ngào, tượng trưng cho tuổi mới ngập tràn niềm vui, may mắn và hạnh phúc rạng rỡ.",
        "composition": "Hoa hồng vàng ánh kim, Hoa đồng tiền kép, Hoa cúc Tana, Lá phụ trang trí cao cấp.",
        "size": "Chiều cao ~50cm, Đường kính tán ~35cm.",
        "is_same_day": True,
        "vendor_name": "Potico Birthday Studio",
        "stock": 25,
        "addons": DEFAULT_ADDONS,
    },
    {
        "name": "Bó Hoa Sinh Nhật Hồng Dịu Dàng - Pink Whisper",
        "slug": "bo-hoa-sinh-nhat-pink-whisper",
        "category": "hoa-sinh-nhat",
        "price": 480000,
        "original_price": 560000,
        "images": [
            "/Images/Birthday/400_j5gLI3mAsJXgPf5zmvwu9NHro.webp",
            "/Images/Birthday/400_lbMkruSBZzKmC0c0JHXVtj9CJ.webp",
            "/Images/Birthday/400_nc9odtMj600ntWxrJvUyCvVgl.webp",
        ],
        "description": "Sắc hồng pastel ngọt lịm kết hợp cùng baby trắng tinh khôi, là món quà sinh nhật hoàn hảo dành tặng bạn gái, vợ hoặc người thương.",
        "composition": "Hoa hồng dâu pastel 12 bông, Hoa baby trắng nhập khẩu, Lá bạc thơm dịu.",
        "size": "Chiều cao ~55cm, Đường kính tán ~40cm.",
        "is_same_day": True,
        "vendor_name": "Potico Dalat Farm",
        "stock": 30,
        "addons": DEFAULT_ADDONS,
    },
    {
        "name": "Hộp Hoa Sinh Nhật Quý Phái - Joyful Elegance",
        "slug": "hop-hoa-sinh-nhat-joyful-elegance",
        "category": "hoa-sinh-nhat",
        "price": 550000,
        "original_price": 650000,
        "images": [
            "/Images/Birthday/400_QKOgosM1xHdcKJHZOtVQ3gbTG.webp",
            "/Images/Birthday/400_r3C0lVwZrSzdQXgqXbjAOnOq1.webp",
            "/Images/Birthday/400_vGWAXWT5cSpGjzbLJy2lGI1hk.webp",
        ],
        "description": "Thiết kế dạng hộp hoa tròn sang trọng phong cách Châu Âu, cắm xốp giữ ẩm giúp hoa tươi lâu suốt cả tuần.",
        "composition": "Hồng phấn Juliet, Hoa cẩm chướng viền tím, Baby trắng, Hộp tròn bọc nơ lụa.",
        "size": "Hộp đường kính 22cm, Chiều cao tổng thể ~35cm.",
        "is_same_day": True,
        "vendor_name": "Potico Birthday Studio",
        "stock": 20,
        "addons": DEFAULT_ADDONS,
    },
    {
        "name": "Bó Hoa Sinh Nhật Tươi Vui - Colorful Day",
        "slug": "bo-hoa-sinh-nhat-colorful-day",
        "category": "hoa-sinh-nhat",
        "price": 390000,
        "original_price": 450000,
        "images": [
            "/Images/Birthday/400_wC1BTQkCd9xBlJfdljoktRO1C.webp",
            "/Images/Birthday/400_WEuW2G4oS8qCGWEOlmIykctzr.webp",
        ],
        "description": "Bó hoa đa sắc rực rỡ tươi mới, mang đến nguồn năng lượng tràn đầy cho ngày sinh nhật thêm đáng nhớ.",
        "composition": "Hồng cam Spirit, Cúc Tana, Hoa thạch thảo trắng, Giấy gói craft cao cấp.",
        "size": "Chiều cao ~48cm, Đường kính tán ~32cm.",
        "is_same_day": True,
        "vendor_name": "Potico Dalat Farm",
        "stock": 40,
        "addons": DEFAULT_ADDONS,
    },

    # ==========================================
    # 2. HOA TÌNH YÊU & HOA HỒNG (Roses folder)
    # ==========================================
    {
        "name": "Bó Hoa Hồng Đỏ Ecuador Tình Nồng - Endless Love",
        "slug": "bo-hoa-hong-do-ecuador-tinh-nong",
        "category": "hoa-tinh-yeu",
        "price": 590000,
        "original_price": 720000,
        "images": [
            "/Images/Roses/400_44ipxi6dxXB3yrtfxKVllyuAu.webp",
            "/Images/Roses/400_j2sD2S0Urrq07fOUdxsx7tfSu.webp",
            "/Images/Roses/400_jHvII3bV2FYvHEgevCgg1zLTp.webp",
        ],
        "description": "Biểu tượng bất diệt của tình yêu say đắm. Những đóa hồng đỏ nhung cánh dày dặn tuyển chọn tạo nên thông điệp yêu thương sâu sắc nhất.",
        "composition": "Hoa hồng đỏ nhung 19 bông, Baby trắng Hà Lan, Giấy gói đen mờ sang trọng.",
        "size": "Chiều cao ~60cm, Đường kính tán ~45cm.",
        "is_same_day": True,
        "vendor_name": "Potico Love Garden",
        "stock": 35,
        "addons": DEFAULT_ADDONS,
    },
    {
        "name": "Bó Hoa Hồng Kem Dâu Lãng Mạn - Sweet Valentine",
        "slug": "bo-hoa-hong-kem-dau-lang-man",
        "category": "hoa-tinh-yeu",
        "price": 450000,
        "original_price": 520000,
        "images": [
            "/Images/Roses/400_TN1bT1YIy0H9KFObVEOf5no3M.webp",
            "/Images/Roses/400_UikanHVQxh90UM8wcbItNFaNI.webp",
            "/Images/Roses/400_WcUjbuCh7Ay9uuGfljQMCHk8Q.webp",
        ],
        "description": "Sự kết hợp tinh tế giữa hồng kem dâu và cúc họa mi trắng, nhẹ nhàng và say đắm như những ngày đầu mới yêu.",
        "composition": "Hoa hồng kem dâu 15 bông, Cúc họa mi, Lá đôla bạc thơm.",
        "size": "Chiều cao ~52cm, Đường kính tán ~38cm.",
        "is_same_day": True,
        "vendor_name": "Potico Love Garden",
        "stock": 28,
        "addons": DEFAULT_ADDONS,
    },

    # ==========================================
    # 3. HOA KHAI TRƯƠNG & HƯỚNG DƯƠNG (SunFlowers & Hoa Ly)
    # ==========================================
    {
        "name": "Bó Hoa Hướng Dương Mặt Trời Rực Rỡ - Sun Smile",
        "slug": "bo-hoa-huong-duong-mat-troi-ruc-ro",
        "category": "hoa-khai-truong",
        "price": 380000,
        "original_price": 450000,
        "images": [
            "/Images/SunFlowers/400_6DTvK9dPHPCTotgmPRLpb7sUv.webp",
            "/Images/SunFlowers/400_dpl60uVK5aDLZdMbdxzQwCON7.webp",
            "/Images/SunFlowers/400_HpOrZnh0gyEdlUfWTMIGH2dqx.webp",
        ],
        "description": "Hoa hướng dương luôn hướng về mặt trời, biểu trưng cho niềm tin, ý chí vươn lên và thành công rực rỡ trong ngày khai trương hoặc tốt nghiệp.",
        "composition": "Hoa hướng dương Đà Lạt 5 bông lớn, Cúc Calimero xanh, Lá trắc bách diệp.",
        "size": "Chiều cao ~55cm, Đường kính tán ~38cm.",
        "is_same_day": True,
        "vendor_name": "Potico Dalat Farm",
        "stock": 35,
        "addons": DEFAULT_ADDONS,
    },
    {
        "name": "Lẵng Hoa Khai Trương Khởi Sắc Hoàng Kim",
        "slug": "lang-hoa-khai-truong-khoi-sac-hoang-kim",
        "category": "hoa-khai-truong",
        "price": 680000,
        "original_price": 820000,
        "images": [
            "/Images/SunFlowers/400_hrCEuSwL6a1U7IWcscXXQacZb.webp",
            "/Images/SunFlowers/400_oQdOx3ITEhJfzbNM10onGSxp1.webp",
            "/Images/Hoa%20Ly/400_A2XLvaTWB3Z6BvtxqGfNAZp5c.jpg",
        ],
        "description": "Lẵng hoa khai trương kết hợp hoa hướng dương vàng kim và hoa ly quý phái, chúc cho gia chủ hồng phát, buôn may bán đắt.",
        "composition": "Hoa hướng dương, Hoa ly vàng thơm, Hoa hồng cam lửa, Kệ gỗ/giỏ mây để bàn sang trọng.",
        "size": "Chiều cao ~65cm, Rộng ~45cm.",
        "is_same_day": True,
        "vendor_name": "Potico Grand Opening",
        "stock": 20,
        "addons": DEFAULT_ADDONS,
    },
    {
        "name": "Bình Hoa Ly Trắng Hoàng Gia - Royal Lily",
        "slug": "binh-hoa-ly-trang-hoang-gia",
        "category": "hoa-khai-truong",
        "price": 520000,
        "original_price": 620000,
        "images": [
            "/Images/Hoa%20Ly/400_fnqOfUxqSE7cwMuc6wFV2RL3e.webp",
            "/Images/Hoa%20Ly/400_HbAwGAEMKzPI9WObfzBOCQUyF.webp",
            "/Images/Hoa%20Ly/400_PUoM41flRmEKHe2Z6FsW5OzzA.webp",
            "/Images/Hoa%20Ly/400_UsHaUzxsI237fanyvVWpQXgmI.webp",
        ],
        "description": "Hoa ly ù cánh dày ngát hương thơm quý phái, mang lại vẻ đẹp sang trọng, đẳng cấp cho không gian phòng khách và văn phòng.",
        "composition": "Hoa ly trắng Ù Đà Lạt 6 tai lớn, Lá đuôi chồn, Cúc phụ trang trí.",
        "size": "Chiều cao ~60cm, Đường kính ~40cm.",
        "is_same_day": False,
        "vendor_name": "Potico Dalat Farm",
        "stock": 18,
        "addons": DEFAULT_ADDONS,
    },

    # ==========================================
    # 4. HOA TULIP HÀ LAN (Tulips folder)
    # ==========================================
    {
        "name": "Bó Hoa Tulip Hà Lan Tinh Khôi - Pure Elegance",
        "slug": "bo-hoa-tulip-ha-lan-tinh-khoi",
        "category": "tulip",
        "price": 650000,
        "original_price": 780000,
        "images": [
            "/Images/Tulips/400_4p8u108CAD9H1SXzeRdfzJXVY.webp",
            "/Images/Tulips/400_4veciX8nrTCGzMQzfLsDfyc1H.jpg",
            "/Images/Tulips/400_6GUFCUYDxCDXq0EYcBXGgN3bn.webp",
        ],
        "description": "Hoa tulip nhập khẩu trực tiếp từ xứ sở cối xay gió Hà Lan, thân mập mạp, cánh hoa đều tăm tắp mang nét quý phái khó cưỡng.",
        "composition": "Hoa tulip trắng/hồng 10 cành nhập khẩu, Giấy lụa mờ Châu Âu.",
        "size": "Chiều cao ~45cm, Đường kính ~30cm.",
        "is_same_day": True,
        "vendor_name": "Potico Imported Studio",
        "stock": 22,
        "addons": DEFAULT_ADDONS,
    },
    {
        "name": "Bó Hoa Tulip Cam San Hô - Sunset Romance",
        "slug": "bo-hoa-tulip-cam-san-ho",
        "category": "tulip",
        "price": 690000,
        "original_price": 820000,
        "images": [
            "/Images/Tulips/400_EGCRGNd1s7Qmow1Wg0OyBv6iW.webp",
            "/Images/Tulips/400_GOvAHG9UpbMcG1JRKHH0HAYCA.webp",
            "/Images/Tulips/400_LHt62K37rawAZCG4SpyUUqAuT.webp",
        ],
        "description": "Sắc cam san hô ấm nồng như ánh hoàng hôn, là thiết kế được các bạn trẻ và người sành hoa yêu thích nhất mùa này.",
        "composition": "Hoa tulip cam san hô 12 cành, Lá phụ trang trí cao cấp.",
        "size": "Chiều cao ~46cm, Đường kính ~32cm.",
        "is_same_day": True,
        "vendor_name": "Potico Imported Studio",
        "stock": 19,
        "addons": DEFAULT_ADDONS,
    },

    # ==========================================
    # 5. HOA CẨM TÚ CẦU (Cẩm tú cầu folder)
    # ==========================================
    {
        "name": "Bó Hoa Cẩm Tú Cầu Xanh Biển - Ocean Dream",
        "slug": "bo-hoa-cam-tu-cau-xanh-bien",
        "category": "cam-tu-cau",
        "price": 360000,
        "original_price": 420000,
        "images": [
            "/Images/C%E1%BA%A9m%20t%C3%BA%20c%E1%BA%A7u/400_KAZnYdrlHbsyVPtJfQbXJm0ow.jpg",
            "/Images/C%E1%BA%A9m%20t%C3%BA%20c%E1%BA%A7u/400_Vd1zZJNTNMvJbz5Xz6VQAN4XS.jpg",
            "/Images/C%E1%BA%A9m%20t%C3%BA%20c%E1%BA%A7u/400_vSxFGzmFjahtvItzUaNkoSWYv.webp",
        ],
        "description": "Đóa cẩm tú cầu xanh biếc căng tròn như quả cầu pha lê, biểu trưng cho lòng biết ơn và những cảm xúc chân thành sâu lắng.",
        "composition": "Cẩm tú cầu xanh biển Đà Lạt loại 1, Hoa baby trắng, Lá trắc bách diệp.",
        "size": "Đường kính đóa hoa ~30cm, Chiều cao bó ~48cm.",
        "is_same_day": True,
        "vendor_name": "Potico Dalat Farm",
        "stock": 30,
        "addons": DEFAULT_ADDONS,
    },
    {
        "name": "Bó Hoa Cẩm Tú Cầu Tím Mộng Mơ - Purple Mist",
        "slug": "bo-hoa-cam-tu-cau-tim-mong-mo",
        "category": "cam-tu-cau",
        "price": 390000,
        "original_price": 460000,
        "images": [
            "/Images/C%E1%BA%A9m%20t%C3%BA%20c%E1%BA%A7u/400_WJZJrY0ukmhziefYPZfg3qfRL.jpg",
            "/Images/C%E1%BA%A9m%20t%C3%BA%20c%E1%BA%A7u/400_x3PEZbBggRkuTKuStTueswGzj.jpg",
        ],
        "description": "Màu tím pastel lãng mạn mang phong vị Đà Lạt thơ mộng, là lời ngỏ ngọt ngào gửi gắm tâm tư dịu dàng nhất.",
        "composition": "Cẩm tú cầu tím pastel, Hoa sao tím, Giấy gói lụa mờ.",
        "size": "Đường kính đóa hoa ~32cm, Chiều cao bó ~50cm.",
        "is_same_day": True,
        "vendor_name": "Potico Dalat Farm",
        "stock": 24,
        "addons": DEFAULT_ADDONS,
    },

    # ==========================================
    # 6. HOA BABY (Baby Flowers folder)
    # ==========================================
    {
        "name": "Bó Hoa Baby Trắng Tinh Khôi - White Cloud",
        "slug": "bo-hoa-baby-trang-tinh-khoi",
        "category": "baby-flower",
        "price": 350000,
        "original_price": 420000,
        "images": [
            "/Images/Baby%20Flowers/400_1mkIkhwskxSX8pkPFpTMzGgBq.webp",
            "/Images/Baby%20Flowers/400_al3hpfrO5QMenRbxmYb0k1SZm.webp",
            "/Images/Baby%20Flowers/400_LvIQz7AnTgzXzl8TXfMeiqhIx.webp",
        ],
        "description": "Bồng bềnh tựa mây trời, những bông hoa baby trắng li ti kết thành bó tròn xoe, tượng trưng cho tình cảm thuần khiết và ngây thơ.",
        "composition": "Hoa baby trắng nhập khẩu Hà Lan nguyên bó, Nơ voan trắng tinh tế.",
        "size": "Chiều cao ~50cm, Đường kính tán ~40cm.",
        "is_same_day": True,
        "vendor_name": "Potico Dalat Farm",
        "stock": 45,
        "addons": DEFAULT_ADDONS,
    },
    {
        "name": "Bó Hoa Baby Rainbow Cầu Vồng - Fairy Tale",
        "slug": "bo-hoa-baby-rainbow-cau-vong",
        "category": "baby-flower",
        "price": 420000,
        "original_price": 500000,
        "images": [
            "/Images/Baby%20Flowers/400_uwMXmhVRfOmIgvmX5N7Xnwdvi.webp",
            "/Images/Baby%20Flowers/400_weySB6fuodj8lfPx5wkdBdCa8.webp",
        ],
        "description": "Sắc màu cầu vồng lung linh nhiệm màu từ công nghệ nhuộm màu thảo mộc cao cấp, hoa giữ tươi lâu và khô tự nhiên đẹp mắt.",
        "composition": "Hoa baby nhuộm màu Pastel đa sắc (Hồng, Xanh, Tím, Vàng), Giấy holographic lấp lánh.",
        "size": "Chiều cao ~52cm, Đường kính tán ~42cm.",
        "is_same_day": True,
        "vendor_name": "Potico Dalat Farm",
        "stock": 35,
        "addons": DEFAULT_ADDONS,
    },

    # ==========================================
    # 7. CÂY MỌNG & HOA VĨNH CỬU (Cây mọng & Hoa Vĩnh cửu)
    # ==========================================
    {
        "name": "Chậu Sen Đá Cây Mọng Để Bàn Phong Thủy",
        "slug": "chau-sen-da-cay-mong-de-ban",
        "category": "qua-tang",
        "price": 280000,
        "original_price": 350000,
        "images": [
            "/Images/C%C3%A2y%20m%E1%BB%8Dng/400_7mxN85Eisi0ot5LZw20h0Ead8.webp",
            "/Images/C%C3%A2y%20m%E1%BB%8Dng/400_c0nAh8Zlw5N6RxXkDCE0hfgat.webp",
            "/Images/C%C3%A2y%20m%E1%BB%8Dng/400_E2RV3SnnB1JJfk3cbfkA9oHns.jpg",
        ],
        "description": "Chậu cây mọng nước và sen đá để bàn làm việc, dễ chăm sóc, mang lại sinh khí và tài lộc may mắn cho gia chủ.",
        "composition": "Tập hợp 3 loại sen đá tuyển chọn, Chậu gốm sứ Bát Tràng tráng men cao cấp, Sỏi trắng.",
        "size": "Đường kính chậu 14cm, Chiều cao ~18cm.",
        "is_same_day": True,
        "vendor_name": "Potico Green Living",
        "stock": 50,
        "addons": DEFAULT_ADDONS,
    },
    {
        "name": "Tiểu Cảnh Cây Mọng Mini Xanh Mát",
        "slug": "tieu-canh-cay-mong-mini-xanh-mat",
        "category": "qua-tang",
        "price": 320000,
        "original_price": 380000,
        "images": [
            "/Images/C%C3%A2y%20m%E1%BB%8Dng/400_qScg3V28Z1BQPNPz8ccXOtQxH.jpg",
            "/Images/C%C3%A2y%20m%E1%BB%8Dng/400_UZupKo2StlrAOa48FhU9rMxLu.jpg",
        ],
        "description": "Món quà xanh thư giãn tuyệt vời sau những giờ làm việc căng thẳng, thanh lọc không khí và hút bức xạ điện tử.",
        "composition": "Sen đá ngọc, Cây mọng kim ngân, Chậu xi măng vân đá nghệ thuật.",
        "size": "Đường kính chậu 16cm, Chiều cao ~20cm.",
        "is_same_day": True,
        "vendor_name": "Potico Green Living",
        "stock": 40,
        "addons": DEFAULT_ADDONS,
    },
    {
        "name": "Hộp Hoa Sáp Vĩnh Cửu Trái Tim - Forever Red",
        "slug": "hop-hoa-sap-vinh-cuu-trai-tim",
        "category": "qua-tang",
        "price": 460000,
        "original_price": 550000,
        "images": [
            "/Images/Hoa%20V%C4%A9nh%20c%E1%BB%ADu/400_AmVvJfi6qFzeFJa0PvpT2Tzw8.webp",
            "/Images/Hoa%20V%C4%A9nh%20c%E1%BB%ADu/400_FwA77uq3P9eBTtJEpNOBryWiz.webp",
            "/Images/Hoa%20V%C4%A9nh%20c%E1%BB%ADu/400_GUnNTbvKLoQqS1VHfFmZx48w8.webp",
        ],
        "description": "Hoa sáp thơm cao cấp giữ nguyên vẻ đẹp vẹn nguyên từ 3 - 5 năm, hương thơm nhẹ nhàng thư thái thay lời hứa yêu thương mãi mãi.",
        "composition": "Hồng sáp thơm 21 bông, Hộp quà trái tim cao cấp, Đèn led nhấp nháy đi kèm.",
        "size": "Kích thước hộp 25cm x 22cm x 10cm.",
        "is_same_day": True,
        "vendor_name": "Potico Forever Flowers",
        "stock": 30,
        "addons": DEFAULT_ADDONS,
    },
    {
        "name": "Bó Hoa Khô Vĩnh Cửu Vintage - Timeless Beauty",
        "slug": "bo-hoa-kho-vinh-cuu-vintage",
        "category": "qua-tang",
        "price": 490000,
        "original_price": 580000,
        "images": [
            "/Images/Hoa%20V%C4%A9nh%20c%E1%BB%ADu/400_u04bt9CQLQy3GQEglyliCv0q8.webp",
            "/Images/Hoa%20V%C4%A9nh%20c%E1%BB%ADu/400_vGWAXWT5cSpGjzbLJy2lGI1hk.webp",
        ],
        "description": "Phong cách hoa khô cổ điển Châu Âu, giữ màu sắc trang nhã bền bỉ theo thời gian, phù hợp decor phòng khách, quán cafe và bàn làm việc.",
        "composition": "Hoa bất tử, Hoa baby khô, Cỏ đuôi thỏ, Lá bạch đàn sấy khô.",
        "size": "Chiều cao ~50cm, Rộng ~35cm.",
        "is_same_day": True,
        "vendor_name": "Potico Forever Flowers",
        "stock": 25,
        "addons": DEFAULT_ADDONS,
    },
]

print(f"[*] Bắt đầu cập nhật {len(NEW_PRODUCTS)} sản phẩm với hình ảnh thực tế từ thư mục Images...")

# Xóa sản phẩm cũ và thêm mới
products_col.delete_many({})
result = products_col.insert_many(NEW_PRODUCTS)
print(f"🎉 Đã thêm thành công {len(result.inserted_ids)} sản phẩm mới vào MongoDB!")

# Hiển thị kiểm tra
for doc in products_col.find():
    print(f" - [{doc['category']}] {doc['name']} -> {doc['images'][0]}")
