import ExcelJS from 'exceljs';

async function createTestFile() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Test Sheet');
  
  worksheet.columns = [
    { header: 'الرمز', key: 'matCode' },
    { header: 'الاسم', key: 'name' },
    { header: 'السعر الإفرادي', key: 'price' }
  ];
  
  worksheet.addRow({ matCode: '1010001', name: 'منتج تجريبي معدل', price: 99.5 });
  worksheet.addRow({ matCode: '1010002', name: 'منتج تجريبي ثاني', price: 50.0 });
  
  await workbook.xlsx.writeFile('test-upload.xlsx');
  console.log('✅ Created test-upload.xlsx');
}
createTestFile();

