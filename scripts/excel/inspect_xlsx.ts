import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = process.argv[2] || path.resolve(process.cwd(), 'samples/xlsx/学生课表.xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log(JSON.stringify(data.slice(0, 20), null, 2));
