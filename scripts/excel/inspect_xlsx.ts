import * as XLSX from 'xlsx';
import * as fs from 'fs';

const filePath = "/Users/zcan/Downloads/master's-schedule---zcanic-pro/exp_xlsx/学生课表.xlsx";
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log(JSON.stringify(data.slice(0, 20), null, 2));
