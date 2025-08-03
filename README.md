# 🖨️ Zebra ZT411 Printer Test Application

Ứng dụng Node.js đơn giản để test hoạt động máy in nhiệt Zebra ZT411 và các máy in tương thích ZPL.

## 📋 Tính năng

- ✅ Test kết nối máy in qua TCP/IP
- 🔍 Kiểm tra trạng thái máy in  
- 📝 In các loại dữ liệu khác nhau:
  - Text đơn giản
  - Label với barcode
  - Receipt/Hóa đơn
- 🎛️ Giao diện menu tương tác
- ⚙️ Cấu hình linh hoạt
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

## 📁 Cấu trúc file

```
printer-test/
├── package.json          # Dependencies và scripts
├── printer-config.js     # Cấu hình máy in và dữ liệu test
├── printer-utils.js      # Utils kết nối và gửi lệnh ZPL
├── test-printer.js       # Chương trình test với menu tương tác
├── index.js              # Quick test script
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
0. Thoát
==================================================
```

## 🔧 Troubleshooting

### Lỗi kết nối
- Kiểm tra IP máy in có đúng không
- Đảm bảo máy in đã bật và kết nối mạng
- Kiểm tra port 9100 có mở không
- Ping thử địa chỉ IP máy in

### Lỗi in
- Kiểm tra giấy in có đủ không
- Đảm bảo máy in không bị lỗi (đèn báo)
- Kiểm tra cài đặt máy in (ZPL mode)

### Commands test thủ công
```bash
# Test ping máy in
ping 192.168.1.100

# Test kết nối port
telnet 192.168.1.100 9100

# Gửi lệnh ZPL test qua telnet
echo "^XA^CF0,30^FO50,50^FDTEST^FS^XZ" | nc 192.168.1.100 9100
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
