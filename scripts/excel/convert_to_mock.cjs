const XLSX = require('xlsx');
const path = require('path');

// Color Palette (Morandi) to map
const COURSE_COLOR_PALETTE = [
  '#8FA3AD', '#7D8B96', '#A4B0BE', '#778CA3', '#6F869A', '#899E96', '#6B7C85', '#9FB6C9',
  '#D4A5A5', '#CC998D', '#C49292', '#EAC7C7', '#BC8F8F', '#BF8679', '#D1B3B3', '#D4A094',
  '#9CAF88', '#8F9E8B', '#A7B6A3', '#88A6A8', '#7C8B74', '#99B7B9', '#93A69A', '#727C70',
  '#C7B299', '#D4C4A8', '#B9AFA1', '#C2B280', '#DBC3A3', '#A89F91', '#D2B48C', '#E0C097',
  '#A89FB1', '#978D9E', '#B5A8BE', '#8E8296', '#AAA0B0', '#958DA5', '#B8A6C0', '#A394B0'
];

const filePath = process.argv[2] || path.resolve(process.cwd(), 'samples/xlsx/学生课表 (1).xlsx');

function parseExcel() {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    const newCourses = [];
    const courseColorMap = new Map();

    let currentSlot = -1;

    for (let r = 2; r < jsonData.length; r++) {
        const rowData = jsonData[r];
        if (!rowData || rowData.length === 0) continue;
 
        const col0 = (rowData[0] || '').toString();
 
        // Update current slot based on first column text
        if (col0.includes('第1节')) currentSlot = 0;
        else if (col0.includes('第2节')) currentSlot = 1;
        else if (col0.includes('第3节')) currentSlot = 2;
        else if (col0.includes('第4节')) currentSlot = 3;
        else if (col0.includes('第5节')) currentSlot = 4;
        else if (col0.includes('第6节')) currentSlot = 5;
        else if (col0.trim().length > 0) currentSlot = -1;
        
        if (currentSlot !== -1 && currentSlot <= 5) {
            for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
               const cellContent = rowData[dayIdx + 1]; 
               if (!cellContent || typeof cellContent !== 'string' || !cellContent.trim()) continue;
 
               const lines = cellContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
               if (lines.length === 0) continue;
 
               const name = lines[0];
               const weeksLine = lines.find(l => l.includes('周'));
               const locationLine = lines.find(l => 
                   (l.startsWith('【') || l.includes('楼') || l.includes('室')) && 
                   l !== name && 
                   l !== weeksLine
               ); 
 
               let weeks = [];
               if (weeksLine) {
                  const cleanWeeks = weeksLine.replace(/周.*$/, '').replace(/\[.*\]/, '');
                  const parts = cleanWeeks.split(/,|，/); 
                  
                  parts.forEach(part => {
                     let rangeWeeks = [];
                     let isOdd = false;
                     let isEven = false;
  
                     if (part.includes('单')) isOdd = true;
                     if (part.includes('双')) isEven = true;
                     
                     const cleanPart = part.replace(/单|双|节/g, '');
  
                     if (cleanPart.includes('-')) {
                        const [start, end] = cleanPart.split('-').map(Number);
                        for (let i = start; i <= end; i++) rangeWeeks.push(i);
                     } else {
                        const w = parseInt(cleanPart);
                        if (!isNaN(w)) rangeWeeks.push(w);
                     }
  
                     if (isOdd) rangeWeeks = rangeWeeks.filter(w => w % 2 !== 0);
                     if (isEven) rangeWeeks = rangeWeeks.filter(w => w % 2 === 0);
                     
                     weeks.push(...rangeWeeks);
                  });
               } else {
                  weeks = Array.from({length: 16}, (_, i) => i + 1);
               }
 
               // Remove duplicates and sort
               weeks = [...new Set(weeks)].sort((a,b) => a-b);
 
               // Assign Color consistently by course name
               let color = courseColorMap.get(name);
               if (!color) {
                   color = COURSE_COLOR_PALETTE[courseColorMap.size % COURSE_COLOR_PALETTE.length];
                   courseColorMap.set(name, color);
               }
 
               newCourses.push({
                 id: (newCourses.length + 1).toString(), // Simple IDs
                 name: name,
                 day: dayIdx,
                 row: currentSlot,
                 weeks: weeks,
                 type: 'normal', // CourseType.NORMAL
                 color: color, 
                 location: locationLine || '未知地点'
               });
            }
        }
    }

    return newCourses;
}

const courses = parseExcel();

// Format output to look like a TS array
console.log("export const COURSES_DATA: Course[] = [");
courses.forEach(c => {
    // Basic pretty print
    console.log(`  { id: '${c.id}', name: "${c.name}", day: ${c.day}, row: ${c.row}, weeks: [${c.weeks.join(',')}], type: CourseType.NORMAL, color: "${c.color}", location: "${c.location}" },`);
});
console.log("];");
