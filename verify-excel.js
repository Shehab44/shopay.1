const xlsx = require('xlsx');
const fs = require('fs');

const filePath = 'data excel/new data.xlsx';

if (!fs.existsSync(filePath)) {
  console.error("File not found!");
  process.exit(1);
}

const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet);

console.log(`Total Rows: ${data.length}`);

let totalZeroPrice = 0;
let totalSevenDigitCodes = 0;
let startsWithOne = 0;
const uniqueCodes = new Set();
let headers = Object.keys(data[0] || {});
console.log(`Headers: ${headers.join(', ')}`);

data.forEach((row) => {
  const code = row['الرمز'] || row['Code'] || row['الكود'];
  const name = row['الاسم'] || row['Name'] || row['اسم المادة'];
  const price = row['السعر الإفرادي'] || row['Price'] || row['السعر'];

  if (code) {
    uniqueCodes.add(code);
    if (String(code).length === 7) {
      totalSevenDigitCodes++;
    }
    if (String(code).startsWith('1')) {
      startsWithOne++;
    }
  }

  if (Number(price) === 0) {
    totalZeroPrice++;
  }
});

console.log(`Unique Codes: ${uniqueCodes.size}`);
console.log(`Seven Digit Codes: ${totalSevenDigitCodes}`);
console.log(`Codes starting with 1: ${startsWithOne}`);
console.log(`Zero Price Products: ${totalZeroPrice}`);
