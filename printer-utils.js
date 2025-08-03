const net = require('net');
const { printerConfig, zplCommands } = require('./printer-config');

class PrinterUtils {
  constructor() {
    this.config = printerConfig;
    this.isConnected = false;
    this.client = null;
  }

  // Kết nối đến máy in
  async connectToPrinter() {
    return new Promise((resolve, reject) => {
      try {
        this.client = new net.Socket();
        
        this.client.connect(this.config.connection.port, this.config.connection.host, () => {
          console.log(`✅ Đã kết nối đến máy in ${this.config.connection.host}:${this.config.connection.port}`);
          this.isConnected = true;
          resolve(true);
        });

        this.client.on('error', (err) => {
          console.error('❌ Lỗi kết nối máy in:', err.message);
          this.isConnected = false;
          reject(err);
        });

        this.client.on('close', () => {
          console.log('🔌 Đã ngắt kết nối máy in');
          this.isConnected = false;
        });

        // Timeout
        setTimeout(() => {
          if (!this.isConnected) {
            this.client.destroy();
            reject(new Error('Timeout kết nối máy in'));
          }
        }, this.config.connection.timeout);

      } catch (error) {
        reject(error);
      }
    });
  }

  // Ngắt kết nối máy in
  disconnect() {
    if (this.client) {
      this.client.destroy();
      this.isConnected = false;
      console.log('🔌 Đã ngắt kết nối máy in');
    }
  }

  // Gửi lệnh ZPL đến máy in
  async sendZPLCommand(zplCommand) {
    if (!this.isConnected) {
      throw new Error('Chưa kết nối đến máy in');
    }

    return new Promise((resolve, reject) => {
      try {
        console.log('📤 Đang gửi lệnh ZPL...');
        console.log('ZPL Command:', zplCommand);
        
        this.client.write(zplCommand, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('✅ Đã gửi lệnh in thành công');
            resolve(true);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Test kết nối máy in
  async testConnection() {
    try {
      await this.connectToPrinter();
      
      // Gửi lệnh test đơn giản
      const testCommand = zplCommands.simpleLabel('TEST CONNECTION OK');
      await this.sendZPLCommand(testCommand);
      
      this.disconnect();
      return true;
    } catch (error) {
      console.error('❌ Test kết nối thất bại:', error.message);
      return false;
    }
  }

  // Tạo ZPL command từ dữ liệu
  generateZPLFromData(data) {
    switch (data.type) {
      case 'simple':
        return zplCommands.simpleLabel(data.content.text);
      
      case 'label':
        return zplCommands.barcodeLabel(
          data.content.productName,
          data.content.barcode,
          data.content.price,
          data.content.date
        );
      
      case 'receipt':
        return zplCommands.receipt(
          data.content.storeName,
          data.content.items,
          data.content.total,
          data.content.date
        );
      
      default:
        throw new Error(`Không hỗ trợ loại dữ liệu: ${data.type}`);
    }
  }

  // In một item dữ liệu
  async printData(data) {
    try {
      await this.connectToPrinter();
      
      const zplCommand = this.generateZPLFromData(data);
      await this.sendZPLCommand(zplCommand);
      
      this.disconnect();
      return true;
    } catch (error) {
      console.error(`❌ Lỗi in dữ liệu ${data.title}:`, error.message);
      this.disconnect();
      return false;
    }
  }

  // In nhiều items
  async printMultipleData(dataArray) {
    const results = [];
    
    try {
      await this.connectToPrinter();
      
      for (const data of dataArray) {
        try {
          console.log(`\n📝 Đang in: ${data.title}`);
          const zplCommand = this.generateZPLFromData(data);
          await this.sendZPLCommand(zplCommand);
          
          // Delay giữa các lệnh in
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          results.push({ id: data.id, title: data.title, success: true });
        } catch (error) {
          console.error(`❌ Lỗi in ${data.title}:`, error.message);
          results.push({ id: data.id, title: data.title, success: false, error: error.message });
        }
      }
      
      this.disconnect();
    } catch (error) {
      console.error('❌ Lỗi kết nối máy in:', error.message);
      this.disconnect();
    }
    
    return results;
  }

  // Lấy thông tin trạng thái máy in
  async getPrinterStatus() {
    try {
      await this.connectToPrinter();
      
      // Gửi lệnh kiểm tra trạng thái (ZPL)
      const statusCommand = '^XA^HH^XZ'; // Host status command
      await this.sendZPLCommand(statusCommand);
      
      this.disconnect();
      return { status: 'online', message: 'Máy in hoạt động bình thường' };
    } catch (error) {
      return { status: 'offline', message: error.message };
    }
  }
}

module.exports = PrinterUtils;