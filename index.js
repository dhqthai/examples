const PrinterUtils = require('./printer-utils');
const { testData } = require('./printer-config');

// Script đơn giản để test máy in nhanh
async function quickTest() {
  console.log('🖨️  ZEBRA ZT411 PRINTER TEST - QUICK MODE');
  console.log('='.repeat(45));
  
  const printer = new PrinterUtils();
  
  try {
    // Test kết nối
    console.log('\n1️⃣  Testing connection...');
    await printer.connectToPrinter();
    console.log('✅ Kết nối thành công!');
    
    // In test label đơn giản
    console.log('\n2️⃣  Printing simple test label...');
    const testLabel = {
      id: 0,
      type: 'simple',
      title: 'Quick Test',
      content: {
        text: 'PRINTER TEST OK\nDate: ' + new Date().toLocaleString('vi-VN')
      }
    };
    
    const zplCommand = printer.generateZPLFromData(testLabel);
    await printer.sendZPLCommand(zplCommand);
    console.log('✅ Test label sent!');
    
    printer.disconnect();
    
    console.log('\n✨ Quick test completed successfully!');
    console.log('💡 For full testing features, run: npm test');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check printer IP in printer-config.js');
    console.log('2. Ensure printer is powered on');
    console.log('3. Verify network connection');
    console.log('4. Check if port 9100 is accessible');
    
    printer.disconnect();
  }
}

// Chạy test nhanh khi file được chạy trực tiếp
if (require.main === module) {
  quickTest();
}

module.exports = { quickTest };