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
    console.log(`🏠 IP Address: ${config.connection.host}`);
    console.log(`🔌 Port: ${config.connection.port}`);
    console.log(`⏱️  Timeout: ${config.connection.timeout}ms`);
    console.log(`🖨️  Loại máy in: ${config.printer.type} ${config.printer.model}`);
    console.log(`📏 Độ rộng: ${config.printer.width} inches`);
    console.log(`🔍 DPI: ${config.printer.dpi}`);
    console.log('-'.repeat(40));
    console.log('💡 Để thay đổi cấu hình, chỉnh sửa file printer-config.js');
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
      
      const choice = await this.askQuestion('\nChọn chức năng (0-7): ');
      
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