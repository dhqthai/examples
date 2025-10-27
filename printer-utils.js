const net = require('net');
const fs = require('fs');
const { printerConfig, zplCommands } = require('./printer-config');

// USB dependencies (optional - will be loaded only if available)
let usb = null;
let SerialPort = null;

try {
  usb = require('usb');
} catch (err) {
  console.log('USB module not available. USB connection disabled.');
}

try {
  SerialPort = require('serialport').SerialPort;
} catch (err) {
  console.log('SerialPort module not available. Serial connection disabled.');
}

class PrinterUtils {
  constructor() {
    this.config = printerConfig;
    this.isConnected = false;
    this.client = null;
  }

  // Kết nối đến máy in
  async connectToPrinter() {
    const connectionType = this.config.connection.type;
    
    switch (connectionType) {
      case 'tcp':
        return this.connectTCP();
      case 'usb':
        return this.connectUSB();
      case 'serial':
        return this.connectSerial();
      default:
        throw new Error(`Loại kết nối không được hỗ trợ: ${connectionType}`);
    }
  }

  // Kết nối TCP/IP
  async connectTCP() {
    return new Promise((resolve, reject) => {
      try {
        this.client = new net.Socket();
        
        this.client.connect(this.config.connection.port, this.config.connection.host, () => {
          console.log(`✅ Đã kết nối TCP đến máy in ${this.config.connection.host}:${this.config.connection.port}`);
          this.isConnected = true;
          resolve(true);
        });

        this.client.on('error', (err) => {
          console.error('❌ Lỗi kết nối TCP:', err.message);
          this.isConnected = false;
          reject(err);
        });

        this.client.on('close', () => {
          console.log('🔌 Đã ngắt kết nối TCP');
          this.isConnected = false;
        });

        // Timeout
        setTimeout(() => {
          if (!this.isConnected) {
            this.client.destroy();
            reject(new Error('Timeout kết nối TCP'));
          }
        }, this.config.connection.timeout);

      } catch (error) {
        reject(error);
      }
    });
  }

  // Kết nối USB
  async connectUSB() {
    return new Promise((resolve, reject) => {
      try {
        if (!usb) {
          reject(new Error('USB module không có sẵn. Cần cài đặt: npm install usb'));
          return;
        }

        const usbConfig = this.config.connection.usb;
        
        // Tìm device USB theo vendor ID và product ID
        const device = usb.findByIds(usbConfig.vendorId, usbConfig.productId);
        
        if (!device) {
          reject(new Error(`Không tìm thấy USB device với VID: ${usbConfig.vendorId.toString(16)}, PID: ${usbConfig.productId.toString(16)}`));
          return;
        }

        device.open();
        
        // Claim interface
        const iface = device.interface(usbConfig.interface);
        if (iface.isKernelDriverActive()) {
          iface.detachKernelDriver();
        }
        iface.claim();

        // Tìm endpoint OUT để gửi dữ liệu
        let outEndpoint = null;
        for (const endpoint of iface.endpoints) {
          if (endpoint.direction === 'out') {
            outEndpoint = endpoint;
            break;
          }
        }

        if (!outEndpoint) {
          reject(new Error('Không tìm thấy USB OUT endpoint'));
          return;
        }

        this.client = {
          device: device,
          interface: iface,
          endpoint: outEndpoint,
          write: (data, callback) => {
            outEndpoint.transfer(Buffer.from(data), callback);
          },
          destroy: () => {
            try {
              iface.release();
              device.close();
            } catch (e) {
              console.warn('Lỗi khi đóng USB device:', e.message);
            }
          }
        };

        console.log(`✅ Đã kết nối USB đến máy in (VID: ${usbConfig.vendorId.toString(16)}, PID: ${usbConfig.productId.toString(16)})`);
        this.isConnected = true;
        resolve(true);

      } catch (error) {
        console.error('❌ Lỗi kết nối USB:', error.message);
        reject(error);
      }
    });
  }

  // Kết nối USB qua file device (Linux)
  async connectUSBDevice() {
    return new Promise((resolve, reject) => {
      try {
        const devicePath = this.config.connection.usb.device;
        
        // Kiểm tra device có tồn tại không
        if (!fs.existsSync(devicePath)) {
          reject(new Error(`USB device không tồn tại: ${devicePath}`));
          return;
        }

        // Mở file device để ghi
        this.client = {
          devicePath: devicePath,
          write: (data, callback) => {
            fs.writeFile(devicePath, data, (err) => {
              if (callback) callback(err);
            });
          },
          destroy: () => {
            // Nothing to do for file-based connection
          }
        };

        console.log(`✅ Đã kết nối USB device: ${devicePath}`);
        this.isConnected = true;
        resolve(true);

      } catch (error) {
        console.error('❌ Lỗi kết nối USB device:', error.message);
        reject(error);
      }
    });
  }

  // Kết nối Serial (dự phòng)
  async connectSerial() {
    return new Promise((resolve, reject) => {
      try {
        if (!SerialPort) {
          reject(new Error('SerialPort module không có sẵn. Cần cài đặt: npm install serialport'));
          return;
        }

        const devicePath = this.config.connection.usb.device;
        
        this.client = new SerialPort({
          path: devicePath,
          baudRate: 9600, // Tốc độ baud mặc định cho printer
          autoOpen: true
        });

        this.client.on('open', () => {
          console.log(`✅ Đã kết nối Serial đến máy in: ${devicePath}`);
          this.isConnected = true;
          resolve(true);
        });

        this.client.on('error', (err) => {
          console.error('❌ Lỗi kết nối Serial:', err.message);
          this.isConnected = false;
          reject(err);
        });

        this.client.on('close', () => {
          console.log('🔌 Đã ngắt kết nối Serial');
          this.isConnected = false;
        });

      } catch (error) {
        console.error('❌ Lỗi khởi tạo Serial:', error.message);
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

  // Liệt kê các USB device có sẵn
  listUSBDevices() {
    if (!usb) {
      return { error: 'USB module không có sẵn' };
    }

    try {
      const devices = usb.getDeviceList();
      const printerDevices = [];
      
      devices.forEach(device => {
        const descriptor = device.deviceDescriptor;
        
        // Kiểm tra các vendor ID phổ biến của máy in
        const printerVendors = {
          0x0a5f: 'Zebra Technologies',
          0x04b8: 'Seiko Epson',
          0x03f0: 'Hewlett-Packard',
          0x04a9: 'Canon',
          0x067b: 'Prolific Technology',
          0x0483: 'STMicroelectronics'
        };

        if (printerVendors[descriptor.idVendor]) {
          printerDevices.push({
            vendorId: descriptor.idVendor,
            productId: descriptor.idProduct,
            vendor: printerVendors[descriptor.idVendor],
            description: `${printerVendors[descriptor.idVendor]} (VID: ${descriptor.idVendor.toString(16)}, PID: ${descriptor.idProduct.toString(16)})`
          });
        }
      });

      return { devices: printerDevices };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Thay đổi loại kết nối
  setConnectionType(type, options = {}) {
    this.config.connection.type = type;
    
    if (type === 'usb' && options.vendorId && options.productId) {
      this.config.connection.usb.vendorId = options.vendorId;
      this.config.connection.usb.productId = options.productId;
    }
    
    if (type === 'tcp' && options.host && options.port) {
      this.config.connection.host = options.host;
      this.config.connection.port = options.port;
    }
    
    console.log(`✅ Đã thay đổi loại kết nối thành: ${type.toUpperCase()}`);
  }
}

module.exports = PrinterUtils;