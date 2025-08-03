# 🖨️ Zebra ZT411 Printer Test Application

Ứng dụng Node.js đơn giản để test hoạt động máy in nhiệt Zebra ZT411 và các máy in tương thích ZPL.

## 📋 Tính năng

- ✅ Test kết nối máy in qua TCP/IP
- 🔌 **HỖ TRỢ KẾT NỐI USB** (mới)
- 🔗 Hỗ trợ kết nối Serial
- 🔍 Kiểm tra trạng thái máy in  
- 📝 In các loại dữ liệu khác nhau:
  - Text đơn giản
  - Label với barcode
  - Receipt/Hóa đơn
- 🎛️ Giao diện menu tương tác
- ⚙️ Cấu hình linh hoạt
- 🔍 Tự động phát hiện USB devices
- 📊 Báo cáo kết quả chi tiết

## 🛠️ Cài đặt

1. **Clone hoặc tải về project**
```bash
git clone <repository-url>
cd printer-test
```

2. **Cài đặt dependencies**
```bash
npm install
```

**Lưu ý cho kết nối USB:**
- **Linux**: Có thể cần chạy với quyền sudo: `sudo npm test`
- **Windows**: Cần cài đặt WinUSB driver hoặc libusb-win32
- **macOS**: Có thể cần cài đặt libusb: `brew install libusb`

3. **Cấu hình máy in**
Chỉnh sửa file `printer-config.js`:
```javascript
const printerConfig = {
  connection: {
    host: '192.168.1.100', // Thay bằng IP của máy in
    port: 9100,
    timeout: 5000
  }
  // ...
}
```

## 🚀 Sử dụng

### Quick Test (Test nhanh)
```bash
npm start
# hoặc
node index.js
```

### Full Test Menu (Menu đầy đủ)
```bash
npm test
# hoặc
node test-printer.js
```

### USB Scanner (Quét USB devices)
```bash
npm run usb
# hoặc
node usb-scanner.js
```

## 📁 Cấu trúc file

```
printer-test/
├── package.json          # Dependencies và scripts
├── printer-config.js     # Cấu hình máy in và dữ liệu test
├── printer-utils.js      # Utils kết nối và gửi lệnh ZPL
├── test-printer.js       # Chương trình test với menu tương tác
├── index.js              # Quick test script
├── usb-scanner.js        # USB device scanner utility 🔌
└── README.md             # Hướng dẫn sử dụng
```

## ⚙️ Cấu hình

### Thông tin máy in
Trong file `printer-config.js`:

```javascript
const printerConfig = {
  connection: {
    type: 'tcp',                    // Loại kết nối
    host: '192.168.1.100',          // IP máy in
    port: 9100,                     // Port (mặc định 9100)
    timeout: 5000                   // Timeout (ms)
  },
  printer: {
    type: 'zebra',                  // Loại máy in
    model: 'ZT411',                 // Model
    width: 4,                       // Độ rộng (inches)
    dpi: 203                        // Độ phân giải
  }
}
```

### Dữ liệu test
Có sẵn 4 loại dữ liệu test:
1. **Simple Text** - Text đơn giản
2. **Product Label** - Label sản phẩm với barcode
3. **Receipt** - Hóa đơn bán hàng
4. **Custom Data** - Dữ liệu tùy chỉnh

## 🎯 Menu chức năng

```
🖨️  CHƯƠNG TRÌNH TEST MÁY IN ZEBRA ZT411
==================================================
1. Test kết nối máy in
2. Kiểm tra trạng thái máy in  
3. Xem danh sách dữ liệu test
4. In một item dữ liệu
5. In tất cả dữ liệu test
6. Cấu hình máy in
7. Tạo và in dữ liệu tùy chỉnh
8. Thay đổi loại kết nối (TCP/USB) 🔌
9. Quét USB devices 🔍
0. Thoát
==================================================
```

## 🔌 Kết nối USB

### Các phương pháp kết nối USB:

1. **Tự động phát hiện**: Tự động quét và hiển thị các printer USB
2. **Thủ công**: Nhập Vendor ID và Product ID
3. **Device path**: Sử dụng đường dẫn device (Linux: /dev/usb/lp0)

### Thông tin USB cho Zebra ZT411:
- **Vendor ID**: 0x0a5f (Zebra Technologies)  
- **Product ID**: 0x0193 (ZT411)
- **Device Path (Linux)**: /dev/usb/lp0 hoặc /dev/usb/lp1

## 🔧 Troubleshooting

### Lỗi kết nối TCP/IP
- Kiểm tra IP máy in có đúng không
- Đảm bảo máy in đã bật và kết nối mạng
- Kiểm tra port 9100 có mở không
- Ping thử địa chỉ IP máy in

### Lỗi kết nối USB
- **Linux**: Chạy với quyền sudo: `sudo npm test`
- **Windows**: Cài đặt driver USB (Zebra driver hoặc WinUSB)
- Kiểm tra cable USB và kết nối
- Sử dụng `lsusb` (Linux) hoặc Device Manager (Windows) để xác nhận device
- Thử các USB port khác nhau

### Lỗi in
- Kiểm tra giấy in có đủ không
- Đảm bảo máy in không bị lỗi (đèn báo)
- Kiểm tra cài đặt máy in (ZPL mode)

### Commands test thủ công

**TCP/IP:**
```bash
# Test ping máy in
ping 192.168.1.100

# Test kết nối port
telnet 192.168.1.100 9100

# Gửi lệnh ZPL test qua telnet
echo "^XA^CF0,30^FO50,50^FDTEST^FS^XZ" | nc 192.168.1.100 9100
```

**USB:**
```bash
# Linux: Liệt kê USB devices
lsusb

# Linux: Kiểm tra USB printer devices
ls -la /dev/usb/lp*

# Linux: Gửi test command trực tiếp
echo "^XA^CF0,30^FO50,50^FDTEST^FS^XZ" > /dev/usb/lp0

# Windows: Kiểm tra USB devices
wmic path win32_usbhub get caption,description
```

## 📝 ZPL Commands

Ứng dụng sử dụng ZPL (Zebra Programming Language) để giao tiếp với máy in:

- `^XA` - Bắt đầu label
- `^XZ` - Kết thúc label  
- `^CF` - Chọn font
- `^FO` - Vị trí field
- `^FD` - Dữ liệu field
- `^BC` - Barcode
- `^BY` - Cài đặt barcode

## 🤝 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra log console để xem lỗi chi tiết
2. Đảm bảo máy in tương thích ZPL
3. Kiểm tra cài đặt network của máy in
4. Thử test với ZPL viewer online trước

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa.
