# Flowers Websites - Kết nối MongoDB Atlas với Python

Dự án Python kết nối cơ sở dữ liệu đám mây **MongoDB Atlas** hỗ trợ cả hai phương thức:
- **PyMongo**: Driver chính thức, linh hoạt, thao tác trực tiếp dạng dictionary / BSON.
- **MongoEngine**: Thư viện ODM (Object Document Mapper), mô hình hóa dữ liệu dạng class/document (tương tự Mongoose bên Node.js hay Django ORM).

---

## 1. Cấu trúc thư mục

```text
├── .venv/                  # Môi trường ảo Python (Virtual Environment)
├── .env                    # Lưu thông tin nhạy cảm: chuỗi kết nối MONGODB_URI
├── .env.example            # Mẫu cấu hình môi trường
├── .gitignore              # Bỏ qua .venv, .env, __pycache__...
├── requirements.txt        # Danh sách thư viện cần thiết
├── database.py             # Module quản lý kết nối (MongoClient, MongoEngine, Ping test)
├── models.py               # Định nghĩa các Document Models (Category, Flower) cho MongoEngine
├── test_connection.py      # Script kiểm tra nhanh kết nối MongoDB Atlas
├── example_pymongo.py      # Demo CRUD sử dụng PyMongo
└── example_mongoengine.py  # Demo CRUD sử dụng MongoEngine
```

---

## 2. Các bước cấu hình MongoDB Atlas

Để kết nối được tới Atlas, bạn thực hiện 3 bước cơ bản trên [MongoDB Atlas Dashboard](https://cloud.mongodb.com/):

### Bước 2.1. Tạo Database User (Tài khoản truy cập DB)
1. Vào tab **Security** -> **Database Access**.
2. Nhấn **Add New Database User**.
3. Chọn Authentication Method là **Password**.
4. Đặt **Username** và **Password** (hãy nhớ mật khẩu này).
5. Phân quyền: **Read and write to any database** hoặc **Atlas Admin**.
6. Nhấn **Add User**.

### Bước 2.2. Mở quyền truy cập IP (Network Access)
*(Rất quan trọng - nếu quên bước này sẽ bị lỗi Timeout / ServerSelectionTimeoutError)*
1. Vào tab **Security** -> **Network Access**.
2. Nhấn **Add IP Address**.
3. Chọn **Add Current IP Address** (cho IP máy bạn) hoặc chọn **Allow Access from Anywhere** (`0.0.0.0/0`) khi đang phát triển/thử nghiệm.
4. Nhấn **Confirm**.

### Bước 2.3. Lấy Connection String
1. Vào tab **Deployment** -> **Database**.
2. Bấm nút **Connect** tại Cluster của bạn.
3. Chọn **Drivers** (Driver: **Python**, Version: **3.12 or later**).
4. Sao chép chuỗi kết nối, dạng:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```

---

## 3. Cập nhật file `.env`

Mở file [.env](file:///d:/Project%20Ex/Flowers%20Websites/.env) và dán chuỗi kết nối vào:

```env
MONGODB_URI=mongodb+srv://admin:MatKhauCuaBan123@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=flowers_db
```

> **Lưu ý**: Nếu mật khẩu chứa ký tự đặc biệt như `@`, `:`, `/`, hãy mã hóa URL (ví dụ `@` đổi thành `%40`).

---

## 4. Kích hoạt môi trường và chạy thử

Mở Terminal (PowerShell hoặc CMD) tại thư mục dự án:

### 4.1. Kích hoạt Virtual Environment (nếu chưa kích hoạt)
- **Windows PowerShell**:
  ```powershell
  .\.venv\Scripts\Activate.ps1
  ```
- **Windows Command Prompt (CMD)**:
  ```cmd
  .\.venv\Scripts\activate.bat
  ```

### 4.2. Kiểm tra kết nối tới Atlas
```bash
python test_connection.py
```
Nếu thành công, bạn sẽ nhận được thông báo:
```text
[✓] Kết nối MongoDB Atlas thành công!
[i] Các database hiện có trên cluster: ['admin', 'local', ...]
```

### 4.3. Chạy demo với PyMongo
```bash
python example_pymongo.py
```

### 4.4. Chạy demo với MongoEngine (ODM)
```bash
python example_mongoengine.py
```
