#!/usr/bin/env node

/**
 * USB Scanner Utility
 * Standalone tool để quét và hiển thị thông tin các USB devices
 * Đặc biệt hữu ích để tìm printer USB
 */

let usb = null;

try {
  usb = require('usb');
} catch (err) {
  console.error('❌ USB module không có sẵn!');
  console.error('💡 Cài đặt: npm install usb');
  console.error('🔧 Hoặc chạy: npm install');
  process.exit(1);
}

// Danh sách các vendor ID phổ biến của máy in
const PRINTER_VENDORS = {
  0x0a5f: 'Zebra Technologies',
  0x04b8: 'Seiko Epson Corporation',
  0x03f0: 'Hewlett-Packard',
  0x04a9: 'Canon Inc.',
  0x067b: 'Prolific Technology Inc.',
  0x0483: 'STMicroelectronics',
  0x04e8: 'Samsung Electronics',
  0x04da: 'Panasonic (Matsushita)',
  0x0924: 'Xerox',
  0x1504: 'Konica Minolta',
  0x04f9: 'Brother Industries'
};

// Danh sách product ID của Zebra
const ZEBRA_PRODUCTS = {
  0x0193: 'ZT411 Industrial Printer',
  0x0194: 'ZT421 Industrial Printer', 
  0x0182: 'ZT410 Industrial Printer',
  0x0061: 'GX420d/GX430t',
  0x0084: 'ZM400',
  0x0025: 'LP2844',
  0x002a: 'TLP2844',
  0x0035: 'GK420d',
  0x0036: 'GK420t'
};

function scanUSBDevices() {
  console.log('🔍 USB DEVICE SCANNER');
  console.log('='.repeat(50));
  
  try {
    const devices = usb.getDeviceList();
    
    if (devices.length === 0) {
      console.log('❌ Không tìm thấy USB device nào');
      return;
    }
    
    console.log(`📊 Tìm thấy ${devices.length} USB device(s)\n`);
    
    let printerCount = 0;
    let zebraCount = 0;
    
    devices.forEach((device, index) => {
      const descriptor = device.deviceDescriptor;
      const vendorId = descriptor.idVendor;
      const productId = descriptor.idProduct;
      
      const vendorName = PRINTER_VENDORS[vendorId];
      const isZebra = vendorId === 0x0a5f;
      const zebraProduct = isZebra ? ZEBRA_PRODUCTS[productId] : null;
      
      if (vendorName || isZebra) {
        printerCount++;
        if (isZebra) zebraCount++;
        
        console.log(`${printerCount === 1 ? '🖨️' : '   '} PRINTER #${printerCount}:`);
        console.log(`   Vendor: ${vendorName || 'Unknown Zebra'}`);
        console.log(`   VID: 0x${vendorId.toString(16).padStart(4, '0')}`);
        console.log(`   PID: 0x${productId.toString(16).padStart(4, '0')}`);
        
        if (zebraProduct) {
          console.log(`   Model: ${zebraProduct}`);
        }
        
        if (isZebra) {
          console.log(`   ✅ Zebra printer - Tương thích với ứng dụng`);
        }
        
        console.log();
      } else {
        // Hiển thị device khác với ít thông tin hơn
        if (index < 10) { // Chỉ hiển thị 10 device đầu tiên
          console.log(`📱 Device ${index + 1}: VID=0x${vendorId.toString(16)}, PID=0x${productId.toString(16)}`);
        }
      }
    });
    
    if (printerCount === 0) {
      console.log('❌ Không tìm thấy printer nào');
      console.log('💡 Kiểm tra:');
      console.log('   - Máy in đã kết nối USB chưa');
      console.log('   - Cable USB hoạt động tốt');
      console.log('   - Driver USB đã cài đặt');
    } else {
      console.log(`📈 THỐNG KÊ:`);
      console.log(`   Tổng printers: ${printerCount}`);
      console.log(`   Zebra printers: ${zebraCount}`);
    }
    
    if (zebraCount > 0) {
      console.log('\n🎯 HƯỚNG DẪN SỬ DỤNG:');
      console.log('1. Chạy ứng dụng test: npm test');
      console.log('2. Chọn menu "8. Thay đổi loại kết nối"');
      console.log('3. Chọn "2. USB"');
      console.log('4. Chọn "1. Tự động phát hiện Zebra printer"');
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi quét USB devices:', error.message);
    
    if (error.message.includes('Permission denied') || error.message.includes('LIBUSB_ERROR_ACCESS')) {
      console.log('\n🔧 GIẢI PHÁP:');
      console.log('Linux: Chạy với quyền sudo:');
      console.log('   sudo node usb-scanner.js');
      console.log('Hoặc thêm user vào group:');
      console.log('   sudo usermod -a -G dialout $USER');
    }
  }
}

function showHelp() {
  console.log('USB Scanner - Công cụ quét USB printers');
  console.log('');
  console.log('Cách sử dụng:');
  console.log('  node usb-scanner.js        Quét USB devices');
  console.log('  node usb-scanner.js -h     Hiển thị help');
  console.log('');
  console.log('Lưu ý:');
  console.log('  - Linux: Có thể cần quyền sudo');
  console.log('  - Windows: Cần cài đặt WinUSB driver');
  console.log('  - macOS: Có thể cần cài đặt libusb');
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
  } else {
    scanUSBDevices();
  }
}

module.exports = { scanUSBDevices };