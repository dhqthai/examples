const readline = require('readline');
const PrinterUtils = require('./printer-utils');
const { testData } = require('./printer-config');

// Tạo interface cho input từ console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class PrinterTester {
  constructor() {
    this.printerUtils = new PrinterUtils();
  }

  // Hiển thị menu chính
  showMainMenu() {
    console.log('\n' + '='.repeat(50));
    console.log('🖨️  CHƯƠNG TRÌNH TEST MÁY IN ZEBRA ZT411');
    console.log('='.repeat(50));
    console.log('1. Test kết nối máy in');
    console.log('2. Kiểm tra trạng thái máy in');
    console.log('3. Xem danh sách dữ liệu test');
    console.log('4. In một item dữ liệu');
    console.log('5. In tất cả dữ liệu test');
    console.log('6. Cấu hình máy in');
    console.log('7. Tạo và in dữ liệu tùy chỉnh');
    console.log('8. Thay đổi loại kết nối (TCP/USB)');
    console.log('9. Quét USB devices');
    console.log('0. Thoát');
    console.log('='.repeat(50));
  }

  // Test kết nối
  async testConnection() {
    console.log('\n🔍 Đang test kết nối máy in...');
    const result = await this.printerUtils.testConnection();
    
    if (result) {
      console.log('✅ Kết nối máy in thành công!');
    } else {
      console.log('❌ Không thể kết nối đến máy in. Vui lòng kiểm tra:');
      console.log('   - IP address máy in');
      console.log('   - Kết nối mạng');
      console.log('   - Máy in đã bật chưa');
    }
  }

  // Kiểm tra trạng thái
  async checkStatus() {
    console.log('\n🔍 Đang kiểm tra trạng thái máy in...');
    const status = await this.printerUtils.getPrinterStatus();
    
    console.log(`📊 Trạng thái: ${status.status.toUpperCase()}`);
    console.log(`📝 Thông báo: ${status.message}`);
  }

  // Hiển thị danh sách dữ liệu test
  showTestData() {
    console.log('\n📋 DANH SÁCH DỮ LIỆU TEST:');
    console.log('-'.repeat(50));
    
    testData.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title} (${item.type})`);
      
      if (item.type === 'simple') {
        console.log(`   Text: ${item.content.text.replace(/\n/g, ' | ')}`);
      } else if (item.type === 'label') {
        console.log(`   Sản phẩm: ${item.content.productName}`);
        console.log(`   Barcode: ${item.content.barcode}`);
        console.log(`   Giá: ${item.content.price}`);
      } else if (item.type === 'receipt') {
        console.log(`   Cửa hàng: ${item.content.storeName}`);
        console.log(`   Số items: ${item.content.items.length}`);
        console.log(`   Tổng tiền: ${item.content.total.toLocaleString()} VND`);
      }
      console.log();
    });
  }

  // In một item dữ liệu
  async printSingleItem() {
    this.showTestData();
    
    const choice = await this.askQuestion('\nChọn item để in (1-' + testData.length + '): ');
    const index = parseInt(choice) - 1;
    
    if (index >= 0 && index < testData.length) {
      const item = testData[index];
      console.log(`\n🖨️  Đang in: ${item.title}`);
      
      const result = await this.printerUtils.printData(item);
      
      if (result) {
        console.log('✅ In thành công!');
      } else {
        console.log('❌ In thất bại!');
      }
    } else {
      console.log('❌ Lựa chọn không hợp lệ!');
    }
  }

  // In tất cả dữ liệu
  async printAllData() {
    console.log('\n🖨️  Đang in tất cả dữ liệu test...');
    console.log('⏳ Vui lòng đợi...\n');
    
    const results = await this.printerUtils.printMultipleData(testData);
    
    console.log('\n📊 KẾT QUẢ IN:');
    console.log('-'.repeat(40));
    
    let successCount = 0;
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.title}`);
      if (!result.success && result.error) {
        console.log(`    Lỗi: ${result.error}`);
      }
      if (result.success) successCount++;
    });
    
    console.log('-'.repeat(40));
    console.log(`📈 Thống kê: ${successCount}/${results.length} thành công`);
  }

  // Hiển thị cấu hình
  showConfiguration() {
    const config = this.printerUtils.config;
    
    console.log('\n⚙️  CÁU HÌNH MÁY IN HIỆN TẠI:');
    console.log('-'.repeat(40));
    console.log(`🌐 Kiểu kết nối: ${config.connection.type.toUpperCase()}`);
    
    if (config.connection.type === 'tcp') {
      console.log(`🏠 IP Address: ${config.connection.host}`);
      console.log(`🔌 Port: ${config.connection.port}`);
    } else if (config.connection.type === 'usb') {
      console.log(`🔌 USB Device: ${config.connection.usb.device}`);
      console.log(`🏭 Vendor ID: 0x${config.connection.usb.vendorId.toString(16)}`);
      console.log(`📦 Product ID: 0x${config.connection.usb.productId.toString(16)}`);
      console.log(`🔗 Interface: ${config.connection.usb.interface}`);
    }
    
    console.log(`⏱️  Timeout: ${config.connection.timeout}ms`);
    console.log(`🖨️  Loại máy in: ${config.printer.type} ${config.printer.model}`);
    console.log(`📏 Độ rộng: ${config.printer.width} inches`);
    console.log(`🔍 DPI: ${config.printer.dpi}`);
    console.log('-'.repeat(40));
    console.log('💡 Để thay đổi cấu hình, sử dụng menu hoặc chỉnh sửa file printer-config.js');
  }

  // Tạo dữ liệu tùy chỉnh
  async createCustomData() {
    console.log('\n✏️  TẠO DỮ LIỆU TÙY CHỈNH:');
    
    const type = await this.askQuestion('Chọn loại (simple/label/receipt): ');
    
    let customData = {
      id: 999,
      type: type,
      title: 'Custom Data'
    };

    switch (type) {
      case 'simple':
        const text = await this.askQuestion('Nhập text cần in: ');
        customData.content = { text: text };
        break;
        
      case 'label':
        const productName = await this.askQuestion('Tên sản phẩm: ');
        const barcode = await this.askQuestion('Mã barcode: ');
        const price = await this.askQuestion('Giá: ');
        customData.content = {
          productName: productName,
          barcode: barcode,
          price: price,
          date: new Date().toLocaleDateString('vi-VN')
        };
        break;
        
      case 'receipt':
        const storeName = await this.askQuestion('Tên cửa hàng: ');
        // Simplified receipt for demo
        customData.content = {
          storeName: storeName,
          items: [{ name: 'Sản phẩm demo', qty: 1, price: 100000 }],
          total: 100000,
          date: new Date().toLocaleString('vi-VN')
        };
        break;
        
      default:
        console.log('❌ Loại không hợp lệ!');
        return;
    }

    console.log(`\n🖨️  Đang in dữ liệu tùy chỉnh...`);
    const result = await this.printerUtils.printData(customData);
    
    if (result) {
      console.log('✅ In dữ liệu tùy chỉnh thành công!');
    } else {
      console.log('❌ In dữ liệu tùy chỉnh thất bại!');
    }
  }

  // Thay đổi loại kết nối
  async changeConnectionType() {
    console.log('\n🔄 THAY ĐỔI LOẠI KẾT NỐI:');
    console.log('1. TCP/IP (Ethernet/WiFi)');
    console.log('2. USB');
    console.log('3. Serial');
    
    const choice = await this.askQuestion('\nChọn loại kết nối (1-3): ');
    
    switch (choice) {
      case '1':
        await this.setupTCPConnection();
        break;
      case '2':
        await this.setupUSBConnection();
        break;
      case '3':
        await this.setupSerialConnection();
        break;
      default:
        console.log('❌ Lựa chọn không hợp lệ!');
    }
  }

  // Cài đặt kết nối TCP
  async setupTCPConnection() {
    console.log('\n🌐 CÀI ĐẶT KẾT NỐI TCP/IP:');
    
    const host = await this.askQuestion(`IP Address (hiện tại: ${this.printerUtils.config.connection.host}): `);
    const port = await this.askQuestion(`Port (hiện tại: ${this.printerUtils.config.connection.port}): `);
    
    const newHost = host || this.printerUtils.config.connection.host;
    const newPort = port ? parseInt(port) : this.printerUtils.config.connection.port;
    
    this.printerUtils.setConnectionType('tcp', { host: newHost, port: newPort });
    console.log(`✅ Đã cài đặt TCP connection: ${newHost}:${newPort}`);
  }

  // Cài đặt kết nối USB
  async setupUSBConnection() {
    console.log('\n🔌 CÀI ĐẶT KẾT NỐI USB:');
    console.log('1. Tự động phát hiện Zebra printer');
    console.log('2. Nhập thủ công Vendor ID và Product ID');
    console.log('3. Sử dụng USB device path (Linux)');
    
    const choice = await this.askQuestion('\nChọn phương pháp (1-3): ');
    
    switch (choice) {
      case '1':
        await this.autoDetectUSB();
        break;
      case '2':
        await this.manualUSBSetup();
        break;
      case '3':
        await this.devicePathSetup();
        break;
      default:
        console.log('❌ Lựa chọn không hợp lệ!');
    }
  }

  // Tự động phát hiện USB printer
  async autoDetectUSB() {
    console.log('\n🔍 Đang quét USB devices...');
    const result = this.printerUtils.listUSBDevices();
    
    if (result.error) {
      console.log(`❌ Lỗi: ${result.error}`);
      return;
    }
    
    if (result.devices.length === 0) {
      console.log('❌ Không tìm thấy printer nào qua USB');
      return;
    }
    
    console.log('\n📋 CÁC PRINTER ĐƯỢC PHÁT HIỆN:');
    result.devices.forEach((device, index) => {
      console.log(`${index + 1}. ${device.description}`);
    });
    
    const choice = await this.askQuestion(`\nChọn printer (1-${result.devices.length}): `);
    const index = parseInt(choice) - 1;
    
    if (index >= 0 && index < result.devices.length) {
      const selectedDevice = result.devices[index];
      this.printerUtils.setConnectionType('usb', {
        vendorId: selectedDevice.vendorId,
        productId: selectedDevice.productId
      });
      console.log(`✅ Đã chọn: ${selectedDevice.description}`);
    } else {
      console.log('❌ Lựa chọn không hợp lệ!');
    }
  }

  // Nhập thủ công USB IDs
  async manualUSBSetup() {
    console.log('\n✏️  NHẬP THÔNG TIN USB:');
    console.log('💡 Zebra ZT411: VID=0x0a5f, PID=0x0193');
    
    const vendorId = await this.askQuestion('Vendor ID (hex, ví dụ: 0a5f): ');
    const productId = await this.askQuestion('Product ID (hex, ví dụ: 0193): ');
    
    if (vendorId && productId) {
      try {
        const vid = parseInt(vendorId, 16);
        const pid = parseInt(productId, 16);
        
        this.printerUtils.setConnectionType('usb', {
          vendorId: vid,
          productId: pid
        });
        console.log(`✅ Đã cài đặt USB: VID=0x${vid.toString(16)}, PID=0x${pid.toString(16)}`);
      } catch (error) {
        console.log('❌ Định dạng ID không hợp lệ!');
      }
    } else {
      console.log('❌ Cần nhập đầy đủ Vendor ID và Product ID!');
    }
  }

  // Cài đặt USB device path
  async devicePathSetup() {
    console.log('\n📁 CÀI ĐẶT USB DEVICE PATH:');
    console.log('💡 Linux: /dev/usb/lp0, /dev/usb/lp1');
    console.log('💡 Windows: LPT1, USB001');
    
    const currentPath = this.printerUtils.config.connection.usb.device;
    const devicePath = await this.askQuestion(`Device path (hiện tại: ${currentPath}): `);
    
    if (devicePath) {
      this.printerUtils.config.connection.usb.device = devicePath;
      this.printerUtils.setConnectionType('usb');
      console.log(`✅ Đã cài đặt USB device: ${devicePath}`);
    } else {
      this.printerUtils.setConnectionType('usb');
      console.log(`✅ Sử dụng device path hiện tại: ${currentPath}`);
    }
  }

  // Cài đặt kết nối Serial
  async setupSerialConnection() {
    console.log('\n🔗 CÀI ĐẶT KẾT NỐI SERIAL:');
    console.log('💡 Thường sử dụng cho các port COM hoặc TTY');
    
    const devicePath = await this.askQuestion('Serial port (ví dụ: COM1, /dev/ttyUSB0): ');
    
    if (devicePath) {
      this.printerUtils.config.connection.usb.device = devicePath;
      this.printerUtils.setConnectionType('serial');
      console.log(`✅ Đã cài đặt Serial connection: ${devicePath}`);
    } else {
      console.log('❌ Cần nhập đường dẫn serial port!');
    }
  }

  // Quét USB devices
  async scanUSBDevices() {
    console.log('\n🔍 QUÉT USB DEVICES...');
    
    const result = this.printerUtils.listUSBDevices();
    
    if (result.error) {
      console.log(`❌ Lỗi: ${result.error}`);
      console.log('💡 Để sử dụng USB, cần cài đặt: npm install usb');
      return;
    }
    
    if (result.devices.length === 0) {
      console.log('❌ Không tìm thấy printer nào qua USB');
      console.log('💡 Kiểm tra:');
      console.log('   - Máy in đã kết nối USB chưa');
      console.log('   - Driver USB đã cài đặt chưa');
      console.log('   - Quyền truy cập USB (Linux cần sudo)');
      return;
    }
    
    console.log('\n📋 CÁC PRINTER USB ĐƯỢC PHÁT HIỆN:');
    console.log('-'.repeat(60));
    result.devices.forEach((device, index) => {
      console.log(`${index + 1}. ${device.vendor}`);
      console.log(`   VID: 0x${device.vendorId.toString(16).padStart(4, '0')}`);
      console.log(`   PID: 0x${device.productId.toString(16).padStart(4, '0')}`);
      console.log(`   Description: ${device.description}`);
      console.log();
    });
    
    const useDevice = await this.askQuestion('Bạn có muốn sử dụng một trong các device này? (y/n): ');
    
    if (useDevice.toLowerCase() === 'y' || useDevice.toLowerCase() === 'yes') {
      const choice = await this.askQuestion(`Chọn device (1-${result.devices.length}): `);
      const index = parseInt(choice) - 1;
      
      if (index >= 0 && index < result.devices.length) {
        const selectedDevice = result.devices[index];
        this.printerUtils.setConnectionType('usb', {
          vendorId: selectedDevice.vendorId,
          productId: selectedDevice.productId
        });
        console.log(`✅ Đã chọn: ${selectedDevice.description}`);
      } else {
        console.log('❌ Lựa chọn không hợp lệ!');
      }
    }
  }

  // Hàm helper để nhận input
  askQuestion(question) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  // Chạy chương trình chính
  async run() {
    console.log('🚀 Khởi động chương trình test máy in...');
    
    while (true) {
      this.showMainMenu();
      
      const choice = await this.askQuestion('\nChọn chức năng (0-9): ');
      
      try {
        switch (choice) {
          case '1':
            await this.testConnection();
            break;
          case '2':
            await this.checkStatus();
            break;
          case '3':
            this.showTestData();
            break;
          case '4':
            await this.printSingleItem();
            break;
          case '5':
            await this.printAllData();
            break;
          case '6':
            this.showConfiguration();
            break;
          case '7':
            await this.createCustomData();
            break;
          case '8':
            await this.changeConnectionType();
            break;
          case '9':
            await this.scanUSBDevices();
            break;
          case '0':
            console.log('\n👋 Cảm ơn bạn đã sử dụng chương trình!');
            rl.close();
            process.exit(0);
            break;
          default:
            console.log('❌ Lựa chọn không hợp lệ!');
        }
      } catch (error) {
        console.error('❌ Có lỗi xảy ra:', error.message);
      }
      
      // Pause để user xem kết quả
      await this.askQuestion('\nNhấn Enter để tiếp tục...');
    }
  }
}

// Chạy chương trình
if (require.main === module) {
  const tester = new PrinterTester();
  tester.run().catch(console.error);
}

module.exports = PrinterTester;