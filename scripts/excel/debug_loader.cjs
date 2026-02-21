const XLSX = require('xlsx');
const path = require('path');

const filePath = process.argv[2] || path.resolve(process.cwd(), 'samples/xlsx/学生课表 (1).xlsx');

console.log(`Reading file: ${filePath}`);

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  console.log(`Sheet Name: ${sheetName}`);
  const worksheet = workbook.Sheets[sheetName];
  
  // Use header:1 to get array of arrays
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  
  console.log("--- First 15 Rows ---");
  data.slice(0, 15).forEach((row, i) => {
      console.log(`Row ${i}:`, JSON.stringify(row));
  });
} catch (e) {
    console.error(e);
}
