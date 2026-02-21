const XLSX = require('xlsx');
const path = require('path');

const filePath = process.argv[2] || path.resolve(process.cwd(), 'samples/xlsx/学生课表.xlsx');

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  // Get raw data including empty cells to see layout
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  console.log(JSON.stringify(data.slice(0, 20), null, 2));
} catch (error) {
  console.error("Error reading file:", error);
}
