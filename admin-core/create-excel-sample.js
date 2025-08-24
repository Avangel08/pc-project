import * as XLSX from 'xlsx';

// Dữ liệu mẫu nhập kho
const sampleImport = [
  ['SKU', 'Số lượng', 'Ghi chú'],
  ['KB-K2-001', 10, 'Nhập kho từ nhà cung cấp'],
  ['MS-G102-WH', 20, 'Nhập kho từ đơn hàng PO001'],
  ['HP-SS-7', 5, 'Nhập kho từ nhà cung cấp SteelSeries'],
  ['LED-RGB-01', 15, 'Nhập kho từ đơn hàng PO002']
];

// Dữ liệu mẫu xuất kho
const sampleExport = [
  ['SKU', 'Số lượng', 'Ghi chú'],
  ['KB-K2-001', 2, 'Xuất bán cho khách'],
  ['MS-G102-WH', 5, 'Xuất cho đơn hàng KH001'],
  ['HP-SS-7', 1, 'Xuất bảo hành'],
  ['LED-RGB-01', 3, 'Xuất cho dự án A']
];

// Tạo workbook nhập kho
const workbookImport = XLSX.utils.book_new();
const worksheetImport = XLSX.utils.aoa_to_sheet(sampleImport);
XLSX.utils.book_append_sheet(workbookImport, worksheetImport, 'Nhập kho hàng loạt');
XLSX.writeFile(workbookImport, 'public/bulk-import-sample.xlsx');

// Tạo workbook xuất kho
const workbookExport = XLSX.utils.book_new();
const worksheetExport = XLSX.utils.aoa_to_sheet(sampleExport);
XLSX.utils.book_append_sheet(workbookExport, worksheetExport, 'Xuất kho hàng loạt');
XLSX.writeFile(workbookExport, 'public/bulk-export-sample.xlsx');

console.log('Đã tạo file Excel mẫu: public/bulk-import-sample.xlsx, public/bulk-export-sample.xlsx'); 