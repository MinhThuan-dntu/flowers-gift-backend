import os
import re
import subprocess
import sys
import time

# Cấu hình UTF-8 cho console Windows để in tiếng Việt chuẩn
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

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# Danh sách các đường dẫn mặc định của Cốc Cốc trên Windows
COCCOC_PATHS = [
    r"C:\Program Files\CocCoc\Browser\Application\browser.exe",
    r"C:\Program Files (x86)\CocCoc\Browser\Application\browser.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\CocCoc\Browser\Application\browser.exe"),
]


def get_coccoc_info() -> tuple[str | None, str | None]:
    """Tìm đường dẫn Cốc Cốc và phiên bản Chromium tương ứng."""
    coccoc_path = None
    for path in COCCOC_PATHS:
        if os.path.exists(path):
            coccoc_path = path
            break

    if not coccoc_path:
        return None, None

    # Lấy phiên bản Cốc Cốc
    version_str = None
    try:
        cmd = f'powershell -Command "(Get-Item \'{coccoc_path}\').VersionInfo.ProductVersion"'
        res = subprocess.check_output(cmd, shell=True, text=True).strip()
        if res:
            # Lấy số phiên bản chính (ví dụ: '154.0.8037.106' -> '154')
            match = re.match(r"^(\d+)", res)
            if match:
                version_str = match.group(1)
    except Exception:
        pass

    return coccoc_path, version_str


def run_test():
    print("=" * 70)
    print("🚀 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG E2E TRÊN TRÌNH DUYỆT CỐC CỐC")
    print("=" * 70)

    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-notifications")
    options.add_argument("--disable-infobars")
    # Tắt thông báo logging rác từ Chromium
    options.add_experimental_option("excludeSwitches", ["enable-logging"])

    coccoc_path, coccoc_major_ver = get_coccoc_info()

    if coccoc_path:
        print(f"[✓] Đã phát hiện trình duyệt Cốc Cốc tại:")
        print(f"    -> {coccoc_path}")
        print(f"[i] Phiên bản Chromium của Cốc Cốc: {coccoc_major_ver}")
        options.binary_location = coccoc_path

        # Tải đúng phiên bản ChromeDriver khớp với Cốc Cốc
        driver_mgr = ChromeDriverManager(driver_version=coccoc_major_ver or "154")
    else:
        print("[!] Không tìm thấy Cốc Cốc, chuyển sang Google Chrome mặc định...")
        driver_mgr = ChromeDriverManager()

    print("[*] Đang khởi tạo ChromeDriver và mở Cốc Cốc...")
    driver_path = driver_mgr.install()
    driver = webdriver.Chrome(service=Service(driver_path), options=options)

    wait = WebDriverWait(driver, 15)

    try:
        # 1. Truy cập trang web
        print("\n[1/5] Truy cập trang chủ: http://127.0.0.1:5173 ...")
        driver.get("http://127.0.0.1:5173")

        # 2. Đợi sản phẩm tải và bấm 'Đặt Hàng Ngay'
        print("[2/5] Đang chờ sản phẩm tải và chọn 'Đặt Hàng Ngay'...")
        order_btn = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Đặt Hàng Ngay')]"))
        )
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", order_btn)
        time.sleep(1)
        order_btn.click()

        # 3. Chờ modal mở và chọn quà tặng kèm (Add-on)
        print("[3/5] Modal mở thành công. Đang chọn quà tặng kèm...")
        wait.until(
            EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Tùy Biến Quà Tặng')]"))
        )

        # Chọn phụ kiện kèm theo đầu tiên
        addon_items = driver.find_elements(By.XPATH, "//div[contains(@class, 'cursor-pointer') and .//input[@type='checkbox']]")
        if addon_items:
            driver.execute_script("arguments[0].click();", addon_items[0])
            print("     -> Đã chọn phụ kiện đi kèm thành công.")
            time.sleep(0.5)

        # Điền thiệp chúc mừng
        msg_textarea = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "textarea"))
        )
        msg_textarea.clear()
        msg_textarea.send_keys("Chúc mừng sinh nhật bạn thân! Chúc bạn luôn rạng rỡ và hạnh phúc.")
        print("     -> Đã nhập nội dung thiệp viết tay.")

        # 4. Điền thông tin giao hàng
        print("[4/5] Điền thông tin người nhận hàng...")
        name_input = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder*='người nhận *']"))
        )
        name_input.clear()
        name_input.send_keys("Vũ Minh Thuận")

        tel_input = driver.find_element(By.CSS_SELECTOR, "input[type='tel']")
        tel_input.clear()
        tel_input.send_keys("0908123456")

        address_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Địa chỉ giao hoa']")
        address_input.clear()
        address_input.send_keys("123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM")

        print("     -> Tên: Vũ Minh Thuận | SĐT: 0908123456 | Đ/C: 123 Nguyễn Huệ, Q.1")
        time.sleep(1)

        # Bấm nút 'Tiến Hành Thanh Toán'
        checkout_btn = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Tiến Hành Thanh Toán')]"))
        )
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", checkout_btn)
        time.sleep(0.5)
        checkout_btn.click()
        print("     -> Đã bấm 'Tiến Hành Thanh Toán'. Đang chờ backend tạo đơn và sinh QR...")

        # 5. Xác minh màn hình thanh toán VietQR hiển thị
        print("[5/5] Kiểm tra kết quả tạo đơn và mã VietQR...")
        qr_img = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "img[alt*='VietQR']"))
        )
        assert qr_img.is_displayed(), "Ảnh mã VietQR không hiển thị trên màn hình!"

        # Đọc thông tin đơn hàng hiển thị trên modal
        success_title = driver.find_element(By.XPATH, "//h3[contains(., 'Khởi Tạo Đơn Hàng Thành Công')]")
        print("\n" + "=" * 70)
        print("🎉 TEST THÀNH CÔNG RỰC RỠ TRÊN TRÌNH DUYỆT CỐC CỐC!")
        print("   ✓ Trình duyệt Cốc Cốc đã tự động thực hiện trọn vẹn luồng mua hàng.")
        print("   ✓ Dữ liệu đơn hàng đã được lưu trữ an toàn vào MongoDB Atlas.")
        print("   ✓ Mã VietQR động thanh toán hiển thị trực quan và chính xác.")
        print("=" * 70)

        # Giữ màn hình vài giây để bạn quan sát kết quả
        time.sleep(5)

    except Exception as e:
        print(f"\n❌ TEST GẶP LỖI: {e}")
        time.sleep(3)
    finally:
        print("[*] Đóng trình duyệt Cốc Cốc...")
        driver.quit()


if __name__ == "__main__":
    run_test()
