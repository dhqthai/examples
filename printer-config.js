// Cấu hình máy in
const printerConfig = {
  // Cấu hình kết nối máy in
  connection: {
    type: 'tcp', // tcp, usb, serial
    host: '192.168.1.100', // IP của máy in (thay đổi theo máy in thực tế)
    port: 9100, // Port mặc định cho Zebra printer
    timeout: 5000,
    
    // Cấu hình USB (cho Linux/Windows)
    usb: {
      // Linux: thường là /dev/usb/lp0, /dev/usb/lp1
      // Windows: thường là LPT1, LPT2 hoặc USB001, USB002
      device: '/dev/usb/lp0', // Đường dẫn device USB
      vendorId: 0x0a5f, // Vendor ID của Zebra (0x0a5f)
      productId: 0x0193, // Product ID của ZT411
      interface: 0, // USB interface number
      endpoint: 0x01 // USB endpoint
    }
  },
  
  // Cấu hình máy in Zebra
  printer: {
    type: 'zebra',
    model: 'ZT411',
    width: 4, // inches
    dpi: 203 // dots per inch
  }
};

// Dữ liệu test để in
const testData = [
  {
    id: 1,
    type: 'label',
    title: 'Test Label 1',
    content: {
      productName: 'Sản phẩm A',
      barcode: '123456789012',
      price: '250,000 VND',
      date: new Date().toLocaleDateString('vi-VN')
    }
  },
  {
    id: 2,
    type: 'label',
    title: 'Test Label 2',
    content: {
      productName: 'Sản phẩm B',
      barcode: '987654321098',
      price: '150,000 VND',
      date: new Date().toLocaleDateString('vi-VN')
    }
  },
  {
    id: 3,
    type: 'receipt',
    title: 'Test Receipt',
    content: {
      storeName: 'Cửa hàng ABC',
      items: [
        { name: 'Sản phẩm 1', qty: 2, price: 100000 },
        { name: 'Sản phẩm 2', qty: 1, price: 50000 }
      ],
      total: 250000,
      date: new Date().toLocaleString('vi-VN')
    }
  },
  {
    id: 4,
    type: 'simple',
    title: 'Simple Text Test',
    content: {
      text: 'Đây là test đơn giản\nMáy in hoạt động bình thường\nZebra ZT411 Test'
    }
  }
];

// ZPL Commands cho Zebra printer
const zplCommands = {
  // Lệnh khởi tạo
  start: '^XA',
  end: '^XZ',
  
  // Template cho label đơn giản
  simpleLabel: (text) => `
^XA
^CF0,30
^FO50,50^FD${text}^FS
^XZ`,

  // Template cho barcode label
  barcodeLabel: (productName, barcode, price, date) => `
^XA
^CF0,25
^FO50,30^FD${productName}^FS
^BY2,3,50
^FO50,80^BC^FD${barcode}^FS
^CF0,20
^FO50,160^FD${price}^FS
^FO50,190^FD${date}^FS
^XZ`,

  // Template cho receipt
  receipt: (storeName, items, total, date) => {
    let itemsText = '';
    items.forEach(item => {
      itemsText += `^FO50,${120 + items.indexOf(item) * 25}^FD${item.name} x${item.qty} = ${item.price.toLocaleString()}^FS\n`;
    });
    
    return `
^XA
^CF0,25
^FO50,30^FD${storeName}^FS
^FO50,60^FD${date}^FS
^FO50,90^FD--------------------------^FS
${itemsText}
^FO50,${150 + items.length * 25}^FD--------------------------^FS
^FO50,${180 + items.length * 25}^FDTong: ${total.toLocaleString()} VND^FS
^XZ`;
  }
};

module.exports = {
  printerConfig,
  testData,
  zplCommands
};