import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Download, Plus, Search, ArrowUp, ArrowDown, History, Package, TrendingUp, TrendingDown, BarChart3, PieChart, ChevronLeft, ChevronRight, Eye, Upload, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { AdminLayout } from "@/components/AdminLayout";
import { ProductModal } from '@/components/modals/ProductModal';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

// Dữ liệu mẫu sản phẩm trong kho
const initialInventory = [
  { name: 'Bàn phím cơ Keychron K2', sku: 'KB-K2-001', category: 'Bàn phím', quantity: 20 },
  { name: 'Chuột Gaming Logitech G102', sku: 'MS-G102-WH', category: 'Chuột', quantity: 35 },
  { name: 'Tai nghe SteelSeries Arctis 7', sku: 'HP-SS-7', category: 'Tai nghe', quantity: 12 },
  { name: 'Đèn LED RGB', sku: 'LED-RGB-01', category: 'Phụ kiện', quantity: 50 },
];

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [stockHistory, setStockHistory] = useState<any[]>([]);
  const [importData, setImportData] = useState({ 
    productId: '', 
    productName: '',
    stock: 0, 
    note: '' 
  });
  
  // State cho nhập kho hàng loạt
  const [bulkImportData, setBulkImportData] = useState({
    tab: 'upload',
    file: null as File | null,
    tableData: '',
    note: '',
    previewData: [] as any[],
    validationErrors: [] as string[],
    isProcessing: false,
    isDragOver: false
  });
  
  const [editIndex, setEditIndex] = useState<number|null>(null);
  const [editStock, setEditStock] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [stockReport, setStockReport] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showBulkExportModal, setShowBulkExportModal] = useState(false);
  const [bulkExportData, setBulkExportData] = useState({
    tab: 'upload',
    file: null as File | null,
    tableData: '',
    note: '',
    previewData: [] as any[],
    validationErrors: [] as string[],
    isProcessing: false,
    isDragOver: false
  });
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Lấy danh sách sản phẩm từ backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        console.log('DATA FROM API:', data);
        setInventory(data);
      } catch (err) {
        setInventory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Lấy danh sách danh mục từ backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setAllCategories(data);
      } catch (err) {
        setAllCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Lấy thống kê theo danh mục
  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const res = await fetch('/api/stock/category-stats');
        const data = await res.json();
        setCategoryStats(data);
      } catch (err) {
        setCategoryStats([]);
      }
    };
    fetchCategoryStats();
  }, []);

  // Lấy báo cáo tồn kho
  const fetchStockReport = async () => {
    try {
      const res = await fetch('/api/stock/report');
      const data = await res.json();
      setStockReport(data);
    } catch (err) {
      setStockReport(null);
    }
  };

  // Lọc và sắp xếp tồn kho
  const filteredAndSortedInventory = inventory
    .filter(item => {
    const name = item.name || '';
    const code = item.productCode || item.sku || item.id || '';
    const category = item.category || '';
      const stock = item.stock || 0;
      
      // Lọc theo search
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      code.toLowerCase().includes(search.toLowerCase()) ||
        category.toLowerCase().includes(search.toLowerCase());
      
      // Lọc theo trạng thái
      let matchesStatus = true;
      switch (filterStatus) {
        case 'in-stock':
          matchesStatus = stock > 0;
          break;
        case 'low-stock':
          matchesStatus = stock > 0 && stock < 10;
          break;
        case 'out-of-stock':
          matchesStatus = stock === 0;
          break;
        case 'overstock':
          matchesStatus = stock > 50;
          break;
      }
      // Lọc theo danh mục
      let matchesCategory = categoryFilter === 'all' || category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'stock':
          aValue = a.stock || 0;
          bValue = b.stock || 0;
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Tính toán phân trang
  const totalItems = filteredAndSortedInventory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredAndSortedInventory.slice(startIndex, endIndex);

  // Reset về trang 1 khi thay đổi filter hoặc search
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, sortBy, sortOrder, categoryFilter]);

  // Lấy lịch sử kho
  const fetchStockHistory = async (productId: string) => {
    try {
      const res = await fetch(`/api/stock/history/${productId}`);
      const data = await res.json();
      setStockHistory(data);
    } catch (err) {
      setStockHistory([]);
    }
  };

  // Nhập kho
  const handleImport = async () => {
    if (!importData.productId || importData.stock <= 0) {
      alert('Vui lòng chọn sản phẩm và nhập số lượng hợp lệ');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/stock/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: importData.productId, 
          stock: importData.stock, 
          note: importData.note,
          user: 'Admin' // Có thể lấy từ context user sau này
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
      // Reload sản phẩm
      const res = await fetch('/api/products');
      const data = await res.json();
      setInventory(data);
      setShowImportModal(false);
        setImportData({ productId: '', productName: '', stock: 0, note: '' });
        
        // Hiển thị thông báo thành công
        alert(`Nhập kho thành công! Sản phẩm ${importData.productName} đã được nhập thêm ${importData.stock} đơn vị.`);
      } else {
        alert(`Lỗi: ${result.error}`);
      }
    } catch (err) {
      console.error('Error importing stock:', err);
      alert('Có lỗi xảy ra khi nhập kho. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Xuất kho (giảm số lượng)
  const handleExport = async (sku: string, stock: number) => {
    if (!sku || stock <= 0) return;
    setLoading(true);
    try {
      await fetch('/api/stock/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: sku, stock })
      });
      // Reload sản phẩm
      const res = await fetch('/api/products');
      const data = await res.json();
      setInventory(data);
    } catch (err) {
      // Xử lý lỗi nếu cần
    } finally {
      setLoading(false);
    }
  };

  // Sửa số lượng trực tiếp (cập nhật tồn kho thủ công)
  const handleEditStock = async () => {
    if (editIndex === null) return;
    const item = filteredAndSortedInventory[editIndex];
    if (!item) return;
    const delta = editStock - item.stock;
    if (delta === 0) { setEditIndex(null); setEditStock(0); return; }
    if (delta > 0) {
      await handleImport({ productId: item.productCode, stock: delta, note: 'Cập nhật thủ công' });
    } else {
      await handleExport(item.productCode, -delta); // truyền số dương
    }
    setEditIndex(null);
    setEditStock(0);
  };

  // Xuất báo cáo kiểm kho (Excel fake)
  const handleExportReport = async () => {
    // Tính toán số liệu tổng hợp
    const totalProducts = filteredAndSortedInventory.length;
    const totalStock = filteredAndSortedInventory.reduce((sum, item) => sum + (item.stock || 0), 0);
    const outOfStock = filteredAndSortedInventory.filter(item => (item.stock || 0) === 0).length;
    const lowStock = filteredAndSortedInventory.filter(item => (item.stock || 0) > 0 && (item.stock || 0) <= 5).length;

    // Tạo workbook và worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Báo cáo tồn kho');

    // Style sang trọng, thanh lịch
    const colorNavy = 'FF1A2233'; // xanh navy đậm
    const colorSilver = 'FFE5E7EB'; // xám bạc
    const colorGray = 'FF22232B'; // xám đậm
    const colorBorder = 'FFB0B4C1'; // border bạc
    const colorText = 'FF22232B'; // chữ xám đậm
    const colorHeader = 'FF22304A'; // header xanh navy
    const colorOutOfStock = 'FFF2B5B5'; // đỏ nhạt
    const colorLowStock = 'FFFFF3CD'; // vàng nhạt
    const colorOverStock = 'FFD1F2EB'; // xanh mint nhạt
    const colorInStock = 'FFE5F6FD'; // xanh bạc nhạt
    const colorWhite = 'FFFFFFFF'; // trắng

    // Thêm tên cửa hàng (ARENA SHOP) - dòng 1
    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = 'ARENA SHOP - BÁO CÁO TỒN KHO';
    worksheet.getCell('A1').style = {
      font: { bold: true, size: 18, color: { argb: colorHeader } },
      alignment: { vertical: 'middle', horizontal: 'center' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: colorWhite } },
    };
    worksheet.getRow(1).height = 30;

    // Thêm ngày xuất báo cáo (dòng 2)
    const today = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const dateStr = `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`;
    worksheet.mergeCells('A2:E2');
    worksheet.getCell('A2').value = `Ngày xuất báo cáo: ${dateStr}`;
    worksheet.getCell('A2').style = {
      font: { italic: true, size: 12, color: { argb: colorGray } },
      alignment: { vertical: 'middle', horizontal: 'right' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: colorSilver } },
    };
    worksheet.getRow(2).height = 20;

    // Dữ liệu tổng hợp bắt đầu từ dòng 4
    const summaryStartRow = 4;
    const summary = [
      ["Tổng sản phẩm", totalProducts],
      ["Tổng tồn kho", totalStock],
      ["Số sản phẩm hết hàng", outOfStock],
      ["Số sản phẩm sắp hết (≤5)", lowStock],
    ];

    // Style cho header tổng hợp
    const summaryHeaderStyle = {
      font: { bold: true, size: 13, color: { argb: colorText } },
      alignment: { vertical: 'middle', horizontal: 'left', indent: 1 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: colorSilver } },
      border: {
        top: { style: 'thin', color: { argb: colorBorder } },
        left: { style: 'thin', color: { argb: colorBorder } },
        bottom: { style: 'thin', color: { argb: colorBorder } },
        right: { style: 'thin', color: { argb: colorBorder } },
      },
    };
    // Style cho giá trị tổng hợp
    const summaryValueStyle = {
      font: { bold: true, size: 13, color: { argb: colorHeader } },
      alignment: { vertical: 'middle', horizontal: 'center' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: colorSilver } },
      border: {
        top: { style: 'thin', color: { argb: colorBorder } },
        left: { style: 'thin', color: { argb: colorBorder } },
        bottom: { style: 'thin', color: { argb: colorBorder } },
        right: { style: 'thin', color: { argb: colorBorder } },
      },
    };
    // Style cho header bảng
    const tableHeaderStyle = {
      font: { bold: true, size: 12, color: { argb: colorSilver } },
      alignment: { vertical: 'middle', horizontal: 'center' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: colorHeader } },
      border: {
        top: { style: 'thin', color: { argb: colorBorder } },
        left: { style: 'thin', color: { argb: colorBorder } },
        bottom: { style: 'thin', color: { argb: colorBorder } },
        right: { style: 'thin', color: { argb: colorBorder } },
      },
    };
    // Style cho dòng dữ liệu
    const tableRowStyle = {
      font: { size: 11, color: { argb: colorText } },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin', color: { argb: colorBorder } },
        left: { style: 'thin', color: { argb: colorBorder } },
        bottom: { style: 'thin', color: { argb: colorBorder } },
        right: { style: 'thin', color: { argb: colorBorder } },
      },
    };
    // Style cho tên sản phẩm (căn trái, padding)
    const nameCellStyle = {
      font: { size: 11, color: { argb: colorText } },
      alignment: { vertical: 'middle', horizontal: 'left', indent: 1 },
      border: tableRowStyle.border,
    };

    // Ghi tổng hợp
    summary.forEach((row, idx) => {
      const excelRow = worksheet.getRow(summaryStartRow + idx);
      worksheet.mergeCells(`A${summaryStartRow + idx}:C${summaryStartRow + idx}`);
      worksheet.getCell(`A${summaryStartRow + idx}`).value = row[0];
      worksheet.getCell(`A${summaryStartRow + idx}`).style = summaryHeaderStyle;
      worksheet.getCell(`D${summaryStartRow + idx}`).value = row[1];
      worksheet.getCell(`D${summaryStartRow + idx}`).style = summaryValueStyle;
    });

    // Dòng trống phân cách
    worksheet.addRow([]);

    // Header bảng chi tiết
    const tableHeader = ["Tên sản phẩm", "SKU", "Danh mục", "Số lượng", "Trạng thái"];
    const headerRow = worksheet.addRow(tableHeader);
    headerRow.height = 24;
    headerRow.eachCell(cell => {
      cell.style = tableHeaderStyle;
    });

    // Dữ liệu chi tiết
    // Sắp xếp theo danh mục trước khi xuất
    const sortedInventory = [...filteredAndSortedInventory].sort((a, b) => {
      const catA = (a.category || '').toLowerCase();
      const catB = (b.category || '').toLowerCase();
      if (catA < catB) return -1;
      if (catA > catB) return 1;
      return 0;
    });
    let lastCategory = null;
    sortedInventory.forEach(item => {
      const stock = item.stock || 0;
      let status = "Còn hàng";
      if (stock === 0) status = "Hết hàng";
      else if (stock < 10) status = "Sắp hết";
      else if (stock > 50) status = "Tồn nhiều";
      // Nếu sang danh mục mới thì chèn 1 dòng trống
      if (lastCategory !== null && item.category !== lastCategory) {
        worksheet.addRow([]);
      }
      lastCategory = item.category;
      const row = worksheet.addRow([
        item.name,
        item.productCode,
        item.category,
        stock,
        status
      ]);
      row.height = 20;
      row.getCell(1).style = nameCellStyle;
      for (let i = 2; i <= 5; i++) {
        row.getCell(i).style = tableRowStyle;
      }
      // Tô màu trạng thái thanh lịch
      if (status === "Hết hàng") row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorOutOfStock } };
      else if (status === "Sắp hết") row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorLowStock } };
      else if (status === "Tồn nhiều") row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorOverStock } };
      else row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorInStock } };
    });

    // Set width cho các cột
    worksheet.columns = [
      { width: 32 },
      { width: 18 },
      { width: 18 },
      { width: 12 },
      { width: 16 },
    ];

    // Xuất file
    const fileName = `bao_cao_ton_kho_${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}_${pad(today.getHours())}-${pad(today.getMinutes())}-${pad(today.getSeconds())}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Hiển thị trạng thái stock
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Hết hàng', color: 'destructive' };
    if (stock < 5) return { label: 'Sắp hết', color: 'destructive' };
    if (stock < 10) return { label: 'Thấp', color: 'secondary' };
    if (stock > 50) return { label: 'Tồn nhiều', color: 'default' };
    return { label: 'Bình thường', color: 'default' };
  };

  // Hàm chuyển trang
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Hàm thay đổi số sản phẩm mỗi trang
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset về trang 1
  };

  // Hàm xử lý file upload cho nhập kho hàng loạt
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  // Hàm xử lý drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setBulkImportData(prev => ({ ...prev, isDragOver: true }));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setBulkImportData(prev => ({ ...prev, isDragOver: false }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setBulkImportData(prev => ({ ...prev, isDragOver: false }));
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      processFile(file);
    }
  };

  // Hàm xử lý file chung
  const processFile = (file: File) => {
    // Kiểm tra định dạng file
    if (!file.name.match(/\.(csv|xlsx?)$/i)) {
      alert('Chỉ chấp nhận file CSV hoặc Excel (.csv, .xlsx, .xls)');
      return;
    }

    setBulkImportData(prev => ({ ...prev, file }));
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (file.name.endsWith('.csv')) {
          // Đọc file CSV
          const text = e.target?.result as string;
          parseCSVData(text);
        } else {
          // Đọc file Excel (.xlsx, .xls)
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Lấy sheet đầu tiên
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Chuyển đổi thành JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            alert('File Excel phải có ít nhất 1 dòng header và 1 dòng dữ liệu');
            return;
          }
          
          parseExcelData(jsonData);
        }
      } catch (error) {
        console.error('Error reading file:', error);
        alert('Có lỗi khi đọc file. Vui lòng kiểm tra định dạng file.');
      }
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  // Hàm parse dữ liệu CSV
  const parseCSVData = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      alert('File CSV phải có ít nhất 1 dòng header và 1 dòng dữ liệu');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      
      return {
        ...row,
        _rowIndex: index + 2, // +2 vì bắt đầu từ dòng 2 (sau header)
        _errors: [] as string[]
      };
    });

    validateBulkData(data);
  };

  // Hàm parse dữ liệu Excel
  const parseExcelData = (jsonData: any[]) => {
    if (jsonData.length < 2) {
      alert('File Excel phải có ít nhất 1 dòng header và 1 dòng dữ liệu');
      return;
    }

    const headers = jsonData[0].map((h: any) => String(h).trim().toLowerCase());
    const data = jsonData.slice(1).map((row, index) => {
      const rowData: any = {};
      
      headers.forEach((header: string, i: number) => {
        rowData[header] = row[i] ? String(row[i]).trim() : '';
      });
      
      return {
        ...rowData,
        _rowIndex: index + 2, // +2 vì bắt đầu từ dòng 2 (sau header)
        _errors: [] as string[]
      };
    });

    validateBulkData(data);
  };

  // Hàm parse dữ liệu từ bảng dán
  const parseTableData = (tableText: string) => {
    if (!tableText.trim()) {
      setBulkImportData(prev => ({ ...prev, previewData: [], validationErrors: [] }));
      return;
    }

    const lines = tableText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      alert('Dữ liệu bảng phải có ít nhất 1 dòng header và 1 dòng dữ liệu');
      return;
    }

    // Thử detect separator (tab hoặc multiple spaces)
    const firstLine = lines[0];
    let separator = '\t';
    
    // Nếu không có tab, thử dùng multiple spaces
    if (!firstLine.includes('\t')) {
      separator = /\s{2,}/;
    }

    const headers = firstLine.split(separator).map(h => h.trim().toLowerCase());
    const data = lines.slice(1).map((line, index) => {
      const values = line.split(separator).map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      
      return {
        ...row,
        _rowIndex: index + 2,
        _errors: [] as string[]
      };
    });

    console.log('Parsed data:', data); // Debug log
    validateBulkData(data);
  };

  // Hàm validate dữ liệu nhập kho hàng loạt
  const validateBulkData = (data: any[]) => {
    console.log('Validating data:', data); // Debug log
    console.log('Available inventory:', inventory); // Debug log
    
    const errors: string[] = [];
    const validatedData = data.map(row => {
      const rowErrors: string[] = [];
      
      // Kiểm tra mã sản phẩm
      const productId = row.sku || row.productcode || row['mã sản phẩm'] || row['product code'] || '';
      console.log('Checking product ID:', productId); // Debug log
      
      if (!productId) {
        rowErrors.push('Thiếu mã sản phẩm');
      } else {
        // Kiểm tra sản phẩm có tồn tại không
        const product = inventory.find(p => 
          p.productCode === productId || 
          p.sku === productId || 
          p.id === productId
        );
        console.log('Found product:', product); // Debug log
        
        if (!product) {
          rowErrors.push('Sản phẩm không tồn tại');
        } else {
          row.productName = product.name;
          row.productId = productId;
        }
      }
      
      // Kiểm tra số lượng
      const quantity = row.quantity || row.sốlượng || row['số lượng'] || row.stock || '';
      const quantityNum = parseInt(quantity);
      console.log('Checking quantity:', quantity, '->', quantityNum); // Debug log
      
      if (!quantity || isNaN(quantityNum) || quantityNum <= 0) {
        rowErrors.push('Số lượng phải là số dương');
      } else {
        row.quantity = quantityNum;
      }
      
      row._errors = rowErrors;
      if (rowErrors.length > 0) {
        errors.push(`Dòng ${row._rowIndex}: ${rowErrors.join(', ')}`);
      }
      
      return row;
    });

    console.log('Validation result:', { validatedData, errors }); // Debug log

    setBulkImportData(prev => ({ 
      ...prev, 
      previewData: validatedData,
      validationErrors: errors
    }));
  };

  // Hàm xử lý nhập kho hàng loạt
  const handleBulkImport = async () => {
    if (bulkImportData.previewData.length === 0) {
      alert('Không có dữ liệu để nhập kho');
      return;
    }

    if (bulkImportData.validationErrors.length > 0) {
      alert('Có lỗi trong dữ liệu. Vui lòng kiểm tra và sửa lỗi trước khi nhập kho.');
      return;
    }

    setBulkImportData(prev => ({ ...prev, isProcessing: true }));

    try {
      const importPromises = bulkImportData.previewData.map(row => 
        fetch('/api/stock/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: row.productId,
            stock: row.quantity,
            note: `${bulkImportData.note ? bulkImportData.note + ' - ' : ''}Nhập kho hàng loạt`,
            user: 'Admin'
          })
        })
      );

      const results = await Promise.all(importPromises);
      const failedImports = results.filter((res, index) => !res.ok);
      
      if (failedImports.length > 0) {
        alert(`Có ${failedImports.length} sản phẩm nhập kho thất bại. Vui lòng kiểm tra lại.`);
      } else {
        alert(`Nhập kho hàng loạt thành công! Đã nhập ${bulkImportData.previewData.length} sản phẩm.`);
        
        // Reload danh sách sản phẩm
        const res = await fetch('/api/products');
        const data = await res.json();
        setInventory(data);
        
        // Đóng modal và reset form
        setShowBulkImportModal(false);
        setBulkImportData({
          tab: 'upload',
          file: null,
          tableData: '',
          note: '',
          previewData: [],
          validationErrors: [],
          isProcessing: false,
          isDragOver: false
        });
      }
    } catch (error) {
      console.error('Error bulk importing:', error);
      alert('Có lỗi xảy ra khi nhập kho hàng loạt. Vui lòng thử lại.');
    } finally {
      setBulkImportData(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // Hàm xử lý file upload cho xuất kho hàng loạt
  const handleBulkExportFile = (file: File) => {
    setBulkExportData(prev => ({ ...prev, file }));
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (file.name.endsWith('.csv')) {
          const text = e.target?.result as string;
          parseBulkExportCSVData(text);
        } else {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (jsonData.length < 2) {
            alert('File Excel phải có ít nhất 1 dòng header và 1 dòng dữ liệu');
            return;
          }
          parseBulkExportExcelData(jsonData);
        }
      } catch (error) {
        console.error('Error reading file:', error);
        alert('Có lỗi khi đọc file. Vui lòng kiểm tra định dạng file.');
      }
    };
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  // Hàm parse dữ liệu CSV cho xuất kho
  const parseBulkExportCSVData = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      alert('File CSV phải có ít nhất 1 dòng header và 1 dòng dữ liệu');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      
      return {
        ...row,
        _rowIndex: index + 2, // +2 vì bắt đầu từ dòng 2 (sau header)
        _errors: [] as string[]
      };
    });

    validateBulkExportData(data);
  };

  // Hàm parse dữ liệu Excel cho xuất kho
  const parseBulkExportExcelData = (jsonData: any[]) => {
    if (jsonData.length < 2) {
      alert('File Excel phải có ít nhất 1 dòng header và 1 dòng dữ liệu');
      return;
    }

    const headers = jsonData[0].map((h: any) => String(h).trim().toLowerCase());
    const data = jsonData.slice(1).map((row, index) => {
      const rowData: any = {};
      
      headers.forEach((header: string, i: number) => {
        rowData[header] = row[i] ? String(row[i]).trim() : '';
      });
      
      return {
        ...rowData,
        _rowIndex: index + 2, // +2 vì bắt đầu từ dòng 2 (sau header)
        _errors: [] as string[]
      };
    });

    validateBulkExportData(data);
  };

  // Hàm parse dữ liệu từ bảng dán cho xuất kho
  const parseBulkExportTableData = (tableText: string) => {
    if (!tableText.trim()) {
      setBulkExportData(prev => ({ ...prev, previewData: [], validationErrors: [] }));
      return;
    }

    const lines = tableText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      alert('Dữ liệu bảng phải có ít nhất 1 dòng header và 1 dòng dữ liệu');
      return;
    }

    // Thử detect separator (tab hoặc multiple spaces)
    const firstLine = lines[0];
    let separator = '\t';
    
    // Nếu không có tab, thử dùng multiple spaces
    if (!firstLine.includes('\t')) {
      separator = /\s{2,}/;
    }

    const headers = firstLine.split(separator).map(h => h.trim().toLowerCase());
    const data = lines.slice(1).map((line, index) => {
      const values = line.split(separator).map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      
      return {
        ...row,
        _rowIndex: index + 2,
        _errors: [] as string[]
      };
    });

    console.log('Parsed data:', data); // Debug log
    validateBulkExportData(data);
  };

  // Hàm validate dữ liệu nhập kho hàng loạt
  const validateBulkExportData = (data: any[]) => {
    console.log('Validating export data:', data); // Debug log
    console.log('Available inventory:', inventory); // Debug log
    
    const errors: string[] = [];
    const validatedData = data.map(row => {
      const rowErrors: string[] = [];
      
      // Kiểm tra mã sản phẩm
      const productId = row.sku || row.productcode || row['mã sản phẩm'] || row['product code'] || '';
      console.log('Checking product ID for export:', productId); // Debug log
      
      if (!productId) {
        rowErrors.push('Thiếu mã sản phẩm');
      } else {
        // Kiểm tra sản phẩm có tồn tại không
        const product = inventory.find(p => 
          p.productCode === productId || 
          p.sku === productId || 
          p.id === productId
        );
        console.log('Found product for export:', product); // Debug log
        
        if (!product) {
          rowErrors.push('Sản phẩm không tồn tại');
        } else {
          row.productName = product.name;
          row.productId = productId;
        }
      }
      
      // Kiểm tra số lượng
      const quantity = row.quantity || row.sốlượng || row['số lượng'] || row.stock || '';
      const quantityNum = parseInt(quantity);
      console.log('Checking quantity for export:', quantity, '->', quantityNum); // Debug log
      
      if (!quantity || isNaN(quantityNum) || quantityNum <= 0) {
        rowErrors.push('Số lượng phải là số dương');
      } else {
        row.quantity = quantityNum;
      }
      
      row._errors = rowErrors;
      if (rowErrors.length > 0) {
        errors.push(`Dòng ${row._rowIndex}: ${rowErrors.join(', ')}`);
      }
      
      return row;
    });

    console.log('Validation result for export:', { validatedData, errors }); // Debug log

    setBulkExportData(prev => ({ 
      ...prev, 
      previewData: validatedData,
      validationErrors: errors
    }));
  };

  // Hàm xử lý xuất kho hàng loạt
  const handleBulkExport = async () => {
    if (bulkExportData.previewData.length === 0) {
      alert('Không có dữ liệu để xuất kho');
      return;
    }

    if (bulkExportData.validationErrors.length > 0) {
      alert('Có lỗi trong dữ liệu. Vui lòng kiểm tra và sửa lỗi trước khi xuất kho.');
      return;
    }

    setBulkExportData(prev => ({ ...prev, isProcessing: true }));

    try {
      const exportPromises = bulkExportData.previewData.map(row => 
        fetch('/api/stock/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: row.productId,
            stock: row.quantity,
            note: `${bulkExportData.note ? bulkExportData.note + ' - ' : ''}Xuất kho hàng loạt`,
            user: 'Admin'
          })
        })
      );

      const results = await Promise.all(exportPromises);
      const failedExports = results.filter((res, index) => !res.ok);
      
      if (failedExports.length > 0) {
        alert(`Có ${failedExports.length} sản phẩm xuất kho thất bại. Vui lòng kiểm tra lại.`);
      } else {
        alert(`Xuất kho hàng loạt thành công! Đã xuất ${bulkExportData.previewData.length} sản phẩm.`);
        
        // Reload danh sách sản phẩm
        const res = await fetch('/api/products');
        const data = await res.json();
        setInventory(data);
        
        // Đóng modal và reset form
        setShowBulkExportModal(false);
        setBulkExportData({
          tab: 'upload',
          file: null,
          tableData: '',
          note: '',
          previewData: [],
          validationErrors: [],
          isProcessing: false,
          isDragOver: false
        });
      }
    } catch (error) {
      console.error('Error bulk exporting:', error);
      alert('Có lỗi xảy ra khi xuất kho hàng loạt. Vui lòng thử lại.');
    } finally {
      setBulkExportData(prev => ({ ...prev, isProcessing: false }));
    }
  };

  return (
    <AdminLayout>


      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gaming-dark border-gaming-cyan/20 cursor-pointer" onClick={() => setFilterStatus('all')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gaming-cyan flex items-center gap-2">
              <Package className="w-4 h-4" />
              Tổng sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-white">{inventory.length}</CardContent>
        </Card>
        <Card className="bg-gaming-dark border-gaming-cyan/20 cursor-pointer" onClick={() => setFilterStatus('all')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gaming-green flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Tổng số lượng tồn
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-white">{inventory.reduce((sum, item) => sum + (item.stock || 0), 0)}</CardContent>
        </Card>
        <Card className="bg-gaming-dark border-gaming-cyan/20 cursor-pointer" onClick={() => setFilterStatus('low-stock')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gaming-gold flex items-center gap-2">
              <Package className="w-4 h-4" />
              Sắp hết hàng (&lt;10)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-white">{inventory.filter(item => item.stock < 10 && item.stock > 0).length}</CardContent>
        </Card>
        <Card className="bg-gaming-dark border-gaming-cyan/20 cursor-pointer" onClick={() => setFilterStatus('out-of-stock')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gaming-red flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Hết hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-white">{inventory.filter(item => item.stock === 0).length}</CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: '#00fff7' }}>Quản lý kho hàng</h1>
            <p className="text-gray-400 mt-1">Theo dõi, kiểm kê và cập nhật tồn kho sản phẩm</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-gaming-cyan/30 text-gaming-cyan" onClick={handleExportReport}>
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
            <Button variant="outline" className="border-gaming-green/30 text-gaming-green" onClick={() => setShowBulkImportModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Nhập kho hàng loạt
            </Button>
            <Button variant="outline" className="border-gaming-red/30 text-gaming-red" onClick={() => setShowBulkExportModal(true)}>
              <Upload className="w-4 h-4 mr-2 rotate-180" />
              Xuất kho hàng loạt
            </Button>
            <Button className="bg-gaming-cyan text-black" onClick={() => setShowImportModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nhập hàng
            </Button>
          </div>
        </div>

        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gaming-darker border-gaming-cyan/30">
            <TabsTrigger value="inventory" className="text-gaming-cyan">Danh sách kho</TabsTrigger>
            <TabsTrigger value="reports" className="text-gaming-cyan">Báo cáo</TabsTrigger>
            <TabsTrigger value="analytics" className="text-gaming-cyan">Thống kê</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-6">
            {/* Form tìm kiếm và bộ lọc */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
              <Input
                placeholder="Tìm kiếm theo tên, SKU, danh mục..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-gaming-darker border-gaming-cyan/30 text-white"
              />
            </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48 bg-gaming-darker border-gaming-cyan/30 text-white">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent className="bg-gaming-darker border-gaming-cyan/30">
                  <SelectItem value="all">Danh mục</SelectItem>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48 bg-gaming-darker border-gaming-cyan/30 text-white">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-gaming-darker border-gaming-cyan/30">
                  <SelectItem value="all">Trạng thái</SelectItem>
                  <SelectItem value="in-stock">Còn hàng</SelectItem>
                  <SelectItem value="low-stock">Sắp hết hàng</SelectItem>
                  <SelectItem value="out-of-stock">Hết hàng</SelectItem>
                  <SelectItem value="overstock">Tồn nhiều</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="border-gaming-cyan/30 text-gaming-cyan"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
            {/* Danh sách sản phẩm trong kho hàng */}
            <Card className="bg-gaming-dark border-gaming-cyan/20">
              <CardHeader className="pb-2 border-b border-gaming-cyan/20">
                <CardTitle className="text-2xl" style={{ color: '#fff', fontWeight: 'bold' }}>
                  {`Danh sách sản phẩm trong kho hàng [${filteredAndSortedInventory.length}]`}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gaming-cyan">Tên sản phẩm</TableHead>
                  <TableHead className="text-gaming-cyan">SKU</TableHead>
                  <TableHead className="text-gaming-cyan">Danh mục</TableHead>
                  <TableHead className="text-gaming-cyan">Số lượng tồn</TableHead>
                      <TableHead className="text-gaming-cyan">Trạng thái</TableHead>
                  <TableHead className="text-gaming-cyan">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                    {currentItems.map((item, idx) => {
                      const stockStatus = getStockStatus(item.stock || 0);
                      const globalIndex = startIndex + idx;
                      return (
                  <TableRow key={item.productCode || item.sku || item.id}>
                    <TableCell className="text-white font-medium">{item.name}</TableCell>
                    <TableCell className="text-white">{item.productCode || item.sku || item.id}</TableCell>
                    <TableCell className="text-white">{item.category}</TableCell>
                          <TableCell className="text-white font-bold">{item.stock || 0}</TableCell>
                    <TableCell>
                            <Badge variant={stockStatus.color as any}>{stockStatus.label}</Badge>
                          </TableCell>
                    <TableCell>
                            {editIndex === globalIndex ? (
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            value={editStock}
                            onChange={e => setEditStock(Number(e.target.value))}
                            className="w-20 bg-gaming-darker border-gaming-cyan/30 text-white"
                          />
                          <Button size="sm" onClick={handleEditStock} className="bg-gaming-cyan text-black">Lưu</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditIndex(null)}>Hủy</Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => {
                                    setSelectedProduct(item);
                                    fetchStockHistory(item.productCode);
                                    setShowHistoryModal(true);
                                  }}
                                  className="hover:bg-gaming-cyan/20"
                                >
                                  <History className="w-4 h-4 text-gaming-cyan" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => {
                                    setSelectedProduct(item);
                                    setShowProductModal(true);
                                  }}
                                  className="hover:bg-gaming-cyan/20"
                                >
                                  <Eye className="w-4 h-4 text-gaming-cyan" />
                                </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                      );
                    })}
              </TableBody>
            </Table>

                {/* Phân trang */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Hiển thị</span>
                    <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                      <SelectTrigger className="w-20 bg-gaming-darker border-gaming-cyan/20">
                        <SelectValue placeholder="10" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-400">sản phẩm mỗi trang</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gaming-cyan/20 text-gaming-cyan"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className={currentPage === page ? "bg-gaming-cyan text-white" : "border-gaming-cyan/20 text-gaming-cyan"}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gaming-cyan/20 text-gaming-cyan"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gaming-dark border-gaming-cyan/20">
                <CardHeader>
                  <CardTitle className="text-gaming-cyan flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Báo cáo tồn kho
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={fetchStockReport} className="w-full bg-gaming-cyan text-black mb-4">
                    Tạo báo cáo
                  </Button>
                  {stockReport && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-gaming-darker p-2 rounded">
                          <div className="text-gaming-cyan">Tổng sản phẩm</div>
                          <div className="text-white font-bold">{stockReport.stats.totalProducts}</div>
                        </div>
                        <div className="bg-gaming-darker p-2 rounded">
                          <div className="text-gaming-cyan">Tổng tồn kho</div>
                          <div className="text-white font-bold">{stockReport.stats.totalStock}</div>
                        </div>
                        <div className="bg-gaming-darker p-2 rounded">
                          <div className="text-gaming-cyan">Hết hàng</div>
                          <div className="text-white font-bold">{stockReport.stats.outOfStock}</div>
                        </div>
                        <div className="bg-gaming-darker p-2 rounded">
                          <div className="text-gaming-cyan">Sắp hết</div>
                          <div className="text-white font-bold">{stockReport.stats.lowStock}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Tạo lúc: {new Date(stockReport.generatedAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  )}
          </CardContent>
        </Card>

              <Card className="bg-gaming-dark border-gaming-cyan/20">
                <CardHeader>
                  <CardTitle className="text-gaming-cyan flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Thống kê theo danh mục
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryStats.map((stat, idx) => (
                      <div key={idx} className="bg-gaming-darker p-3 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium">{stat._id}</span>
                          <Badge variant="outline">{stat.totalProducts} sản phẩm</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-gaming-cyan">Tổng tồn</div>
                            <div className="text-white font-bold">{stat.totalStock}</div>
                          </div>
                          <div>
                            <div className="text-gaming-cyan">TB/sản phẩm</div>
                            <div className="text-white font-bold">{Math.round(stat.avgStock)}</div>
                          </div>
                          <div>
                            <div className="text-gaming-cyan">Hết hàng</div>
                            <div className="text-white font-bold">{stat.outOfStock}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-gaming-dark border-gaming-cyan/20">
              <CardHeader>
                <CardTitle className="text-gaming-cyan">Phân tích tồn kho</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gaming-darker p-4 rounded">
                    <h3 className="text-gaming-cyan font-semibold mb-2">Phân bố tồn kho</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white">Hết hàng</span>
                        <span className="text-red-400 font-bold">
                          {inventory.filter(item => (item.stock || 0) === 0).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white">Sắp hết (&lt;10)</span>
                        <span className="text-yellow-400 font-bold">
                          {inventory.filter(item => (item.stock || 0) > 0 && (item.stock || 0) < 10).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white">Bình thường (10-50)</span>
                        <span className="text-green-400 font-bold">
                          {inventory.filter(item => (item.stock || 0) >= 10 && (item.stock || 0) <= 50).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white">Tồn nhiều (&gt;50)</span>
                        <span className="text-blue-400 font-bold">
                          {inventory.filter(item => (item.stock || 0) > 50).length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gaming-darker p-4 rounded">
                    <h3 className="text-gaming-cyan font-semibold mb-2">Top danh mục</h3>
                    <div className="space-y-2">
                      {categoryStats.slice(0, 5).map((stat, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-white">{stat._id}</span>
                          <span className="text-gaming-cyan font-bold">{stat.totalStock}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gaming-darker p-4 rounded">
                    <h3 className="text-gaming-cyan font-semibold mb-2">Chỉ số tồn kho</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white">Tỷ lệ hết hàng</span>
                        <span className="text-red-400 font-bold">
                          {inventory.length > 0 ? Math.round((inventory.filter(item => (item.stock || 0) === 0).length / inventory.length) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white">Tỷ lệ sắp hết</span>
                        <span className="text-yellow-400 font-bold">
                          {inventory.length > 0 ? Math.round((inventory.filter(item => (item.stock || 0) > 0 && (item.stock || 0) < 10).length / inventory.length) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white">Tỷ lệ tồn nhiều</span>
                        <span className="text-blue-400 font-bold">
                          {inventory.length > 0 ? Math.round((inventory.filter(item => (item.stock || 0) > 50).length / inventory.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal nhập hàng */}
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className="bg-gaming-dark border-gaming-cyan/20">
            <DialogHeader>
              <DialogTitle>Nhập hàng</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Nhập mã sản phẩm hoặc tìm kiếm theo tên..."
                  value={importData.productId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setImportData(prev => ({ ...prev, productId: value, productName: '' }));
                  }}
                  className="bg-gaming-darker border-gaming-cyan/30 text-white"
                />
                
                {/* Dropdown suggestions */}
                {importData.productId && !importData.productName && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gaming-darker border border-gaming-cyan/30 rounded-md max-h-48 overflow-y-auto z-50">
                    {inventory
                      .filter(product => 
                        (product.productCode && product.productCode.toLowerCase().includes(importData.productId.toLowerCase())) ||
                        (product.sku && product.sku.toLowerCase().includes(importData.productId.toLowerCase())) ||
                        (product.id && product.id.toLowerCase().includes(importData.productId.toLowerCase())) ||
                        (product.name && product.name.toLowerCase().includes(importData.productId.toLowerCase()))
                      )
                      .slice(0, 10) // Giới hạn 10 kết quả
                      .map(product => (
                        <div
                          key={product.productCode || product.sku || product.id}
                          className="p-2 hover:bg-gaming-cyan/10 cursor-pointer text-white border-b border-gaming-cyan/10 last:border-b-0"
                          onClick={() => {
                            setImportData({
                              productId: product.productCode || product.sku || product.id,
                              productName: product.name,
                              stock: importData.stock,
                              note: importData.note
                            });
                          }}
                        >
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gaming-cyan">
                            SKU: {product.productCode || product.sku || product.id}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              
              {/* Hiển thị thông tin sản phẩm khi có kết quả tìm kiếm */}
              {importData.productId && (
                <div className="bg-gaming-darker/50 p-3 rounded border border-gaming-cyan/20">
                  {importData.productName ? (
                    <>
                      <p className="text-gaming-cyan text-sm font-medium">Sản phẩm đã chọn:</p>
                      <p className="text-white">{importData.productName}</p>
                      <p className="text-gray-400 text-xs">Tồn kho hiện tại: {inventory.find(p => p.productCode === importData.productId || p.sku === importData.productId || p.id === importData.productId)?.stock || 0}</p>
                    </>
                  ) : (
                    <p className="text-yellow-400 text-sm">Đang tìm kiếm sản phẩm...</p>
                  )}
                </div>
              )}
              
              <Input 
                placeholder="Số lượng nhập thêm" 
                type="number" 
                value={importData.stock} 
                min={1}
                onChange={e => {
                  const value = Number(e.target.value);
                  setImportData({ ...importData, stock: value });
                }} 
                className="bg-gaming-darker border-gaming-cyan/30 text-white"
              />
              {importData.stock < 1 && (
                <div className="text-red-500 text-sm mt-1">Số lượng phải lớn hơn 0</div>
              )}
              <Input 
                placeholder="Ghi chú (tùy chọn)" 
                value={importData.note} 
                onChange={e => setImportData({ ...importData, note: e.target.value })} 
                className="bg-gaming-darker border-gaming-cyan/30 text-white"
              />
            </div>
            <DialogFooter>
              <Button 
                onClick={handleImport} 
                className="bg-gaming-cyan text-black"
                disabled={loading || !importData.productId || importData.stock <= 0}
              >
                {loading ? 'Đang xử lý...' : 'Nhập kho'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowImportModal(false)}
                disabled={loading}
              >
                Hủy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal nhập kho hàng loạt */}
        <Dialog open={showBulkImportModal} onOpenChange={setShowBulkImportModal}>
          <DialogContent className="bg-gaming-dark border-gaming-cyan/20 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl text-gaming-cyan">Nhập kho hàng loạt</DialogTitle>
            </DialogHeader>
            
            <Tabs value={bulkImportData.tab} onValueChange={(value) => setBulkImportData(prev => ({ ...prev, tab: value }))}>
              <TabsList className="grid w-full grid-cols-2 bg-gaming-darker border-gaming-cyan/30">
                <TabsTrigger value="upload" className="text-gaming-cyan">Upload File</TabsTrigger>
                <TabsTrigger value="paste" className="text-gaming-cyan">Dán bảng</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    bulkImportData.isDragOver 
                      ? 'border-gaming-green bg-gaming-green/10' 
                      : 'border-gaming-cyan/30'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 mx-auto text-gaming-cyan mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Upload file Excel 2016 hoặc CSV</h3>
                  <p className="text-gray-400 mb-4">
                    Hỗ trợ file Excel (.xlsx, .xls) với định dạng: SKU, Số lượng, Ghi chú (tùy chọn)
                  </p>
                  <p className="text-gaming-cyan text-sm mb-4">
                    Kéo thả file vào đây hoặc click nút bên dưới
                  </p>
                  <div className="mb-4">
                    <a 
                      href="/bulk-import-sample.xlsx" 
                      download
                      className="text-gaming-cyan hover:text-gaming-green text-sm underline block"
                    >
                      📥 Download file mẫu Excel (.xlsx)
                    </a>
                  </div>
                  <div className="relative inline-block">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="bulk-import-file"
                    />
                    <Button variant="outline" className="border-gaming-cyan/30 text-gaming-cyan cursor-pointer">
                      <FileText className="w-4 h-4 mr-2" />
                      Chọn file
                    </Button>
                  </div>
                  {bulkImportData.file && (
                    <p className="text-gaming-green mt-2 text-sm">
                      Đã chọn: {bulkImportData.file.name}
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="paste" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Dán dữ liệu từ Excel/Google Sheets</label>
                  <Textarea
                    placeholder="Dán dữ liệu bảng vào đây (định dạng: SKU [Tab] Số lượng [Tab] Ghi chú)"
                    value={bulkImportData.tableData}
                    onChange={(e) => {
                      setBulkImportData(prev => ({ ...prev, tableData: e.target.value }));
                      parseTableData(e.target.value);
                    }}
                    className="bg-gaming-darker border-gaming-cyan/30 text-white min-h-[200px]"
                  />
                  <p className="text-xs text-gray-400">
                    Tip: Copy từ Excel/Google Sheets và paste trực tiếp vào ô trên
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Ghi chú chung */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Ghi chú chung (tùy chọn)</label>
              <Input
                placeholder="Ghi chú cho toàn bộ lần nhập kho này..."
                value={bulkImportData.note}
                onChange={(e) => setBulkImportData(prev => ({ ...prev, note: e.target.value }))}
                className="bg-gaming-darker border-gaming-cyan/30 text-white"
              />
            </div>

            {/* Hiển thị lỗi validation */}
            {bulkImportData.validationErrors.length > 0 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <h4 className="text-red-400 font-semibold">Lỗi validation ({bulkImportData.validationErrors.length})</h4>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {bulkImportData.validationErrors.map((error, index) => (
                    <p key={index} className="text-red-300 text-sm">{error}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Preview dữ liệu */}
            {bulkImportData.previewData.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-semibold">
                    Preview dữ liệu ({bulkImportData.previewData.length} sản phẩm)
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      Hợp lệ: {bulkImportData.previewData.filter(row => row._errors.length === 0).length}
                    </span>
                    <span className="text-sm text-red-400">
                      Lỗi: {bulkImportData.previewData.filter(row => row._errors.length > 0).length}
                    </span>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto border border-gaming-cyan/20 rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gaming-cyan">Dòng</TableHead>
                        <TableHead className="text-gaming-cyan">Mã SP</TableHead>
                        <TableHead className="text-gaming-cyan">Tên SP</TableHead>
                        <TableHead className="text-gaming-cyan">Số lượng</TableHead>
                        <TableHead className="text-gaming-cyan">Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bulkImportData.previewData.map((row, index) => (
                        <TableRow key={index} className={row._errors.length > 0 ? 'bg-red-900/10' : ''}>
                          <TableCell className="text-white">{row._rowIndex}</TableCell>
                          <TableCell className="text-white">{row.productId || row.sku || row.productcode}</TableCell>
                          <TableCell className="text-white">{row.productName || '-'}</TableCell>
                          <TableCell className="text-white font-bold">{row.quantity}</TableCell>
                          <TableCell>
                            {row._errors.length > 0 ? (
                              <div className="flex items-center gap-1">
                                <XCircle className="w-4 h-4 text-red-400" />
                                <span className="text-red-400 text-xs">Lỗi</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 text-xs">OK</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                onClick={handleBulkImport}
                className="bg-gaming-green text-black"
                disabled={bulkImportData.isProcessing || bulkImportData.previewData.length === 0 || bulkImportData.validationErrors.length > 0}
              >
                {bulkImportData.isProcessing ? 'Đang xử lý...' : 'Nhập kho hàng loạt'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowBulkImportModal(false);
                  setBulkImportData({
                    tab: 'upload',
                    file: null,
                    tableData: '',
                    note: '',
                    previewData: [],
                    validationErrors: [],
                    isProcessing: false,
                    isDragOver: false
                  });
                }}
                disabled={bulkImportData.isProcessing}
              >
                Hủy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal lịch sử kho */}
        <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
          <DialogContent className="bg-gaming-dark border-gaming-cyan/20 max-w-4xl">
            <DialogHeader>
              <DialogTitle>Lịch sử kho - {selectedProduct?.name}</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gaming-cyan">Thời gian</TableHead>
                    <TableHead className="text-gaming-cyan">Loại</TableHead>
                    <TableHead className="text-gaming-cyan">Số lượng</TableHead>
                    <TableHead className="text-gaming-cyan">Người thực hiện</TableHead>
                    <TableHead className="text-gaming-cyan">Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockHistory.map((record, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-white">
                        {new Date(record.createdAt).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={record.type === 'import' ? 'default' : 'secondary'}>
                          {record.type === 'import' ? 'Nhập kho' : 'Xuất kho'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white font-bold">{record.quantity}</TableCell>
                      <TableCell className="text-white">{record.user || 'Admin'}</TableCell>
                      <TableCell className="text-white">{record.note || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal xem chi tiết sản phẩm */}
        <ProductModal 
          isOpen={showProductModal} 
          onClose={() => setShowProductModal(false)} 
          product={selectedProduct} 
          mode="view"
          onSave={() => {}} 
        />

        {/* Modal xuất kho hàng loạt */}
        <Dialog open={showBulkExportModal} onOpenChange={setShowBulkExportModal}>
          <DialogContent className="bg-gaming-dark border-gaming-cyan/20 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl text-gaming-red">Xuất kho hàng loạt</DialogTitle>
            </DialogHeader>
            <Tabs value={bulkExportData.tab} onValueChange={(value) => setBulkExportData(prev => ({ ...prev, tab: value }))}>
              <TabsList className="grid w-full grid-cols-2 bg-gaming-darker border-gaming-cyan/30">
                <TabsTrigger value="upload" className="text-gaming-red">Upload File</TabsTrigger>
                <TabsTrigger value="paste" className="text-gaming-red">Dán bảng</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="space-y-4">
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    bulkExportData.isDragOver 
                      ? 'border-gaming-red bg-gaming-red/10' 
                      : 'border-gaming-cyan/30'
                  }`}
                  onDragOver={e => { e.preventDefault(); setBulkExportData(prev => ({ ...prev, isDragOver: true })); }}
                  onDragLeave={e => { e.preventDefault(); setBulkExportData(prev => ({ ...prev, isDragOver: false })); }}
                  onDrop={e => {
                    e.preventDefault();
                    setBulkExportData(prev => ({ ...prev, isDragOver: false }));
                    const files = e.dataTransfer.files;
                    if (files.length > 0) handleBulkExportFile(files[0]);
                  }}
                >
                  <Upload className="w-12 h-12 mx-auto text-gaming-red mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Upload file Excel 2016 hoặc CSV</h3>
                  <p className="text-gray-400 mb-4">
                    Hỗ trợ file Excel (.xlsx, .xls) với định dạng: SKU, Số lượng, Ghi chú (tùy chọn)
                  </p>
                  <p className="text-gaming-red text-sm mb-4">
                    Kéo thả file vào đây hoặc click nút bên dưới
                  </p>
                  <div className="mb-4">
                    <a 
                      href="/bulk-export-sample.xlsx" 
                      download
                      className="text-gaming-red hover:text-gaming-cyan text-sm underline block"
                    >
                      📥 Download file mẫu Excel (.xlsx)
                    </a>
                  </div>
                  <div className="relative inline-block">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={e => { if (e.target.files?.[0]) handleBulkExportFile(e.target.files[0]); }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="bulk-export-file"
                    />
                    <Button variant="outline" className="border-gaming-red/30 text-gaming-red cursor-pointer">
                      <FileText className="w-4 h-4 mr-2" />
                      Chọn file
                    </Button>
                  </div>
                  {bulkExportData.file && (
                    <p className="text-gaming-green mt-2 text-sm">
                      Đã chọn: {bulkExportData.file.name}
                    </p>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="paste" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Dán dữ liệu từ Excel/Google Sheets</label>
                  <Textarea
                    placeholder="Dán dữ liệu bảng vào đây (định dạng: SKU [Tab] Số lượng [Tab] Ghi chú)"
                    value={bulkExportData.tableData}
                    onChange={e => {
                      setBulkExportData(prev => ({ ...prev, tableData: e.target.value }));
                      parseBulkExportTableData(e.target.value);
                    }}
                    className="bg-gaming-darker border-gaming-red/30 text-white min-h-[200px]"
                  />
                  <p className="text-xs text-gray-400">
                    Tip: Copy từ Excel/Google Sheets và paste trực tiếp vào ô trên
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            {/* Ghi chú chung */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Ghi chú chung (tùy chọn)</label>
              <Input
                placeholder="Ghi chú cho toàn bộ lần xuất kho này..."
                value={bulkExportData.note}
                onChange={e => setBulkExportData(prev => ({ ...prev, note: e.target.value }))}
                className="bg-gaming-darker border-gaming-red/30 text-white"
              />
            </div>
            {/* Hiển thị lỗi validation */}
            {bulkExportData.validationErrors.length > 0 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <h4 className="text-red-400 font-semibold">Lỗi validation ({bulkExportData.validationErrors.length})</h4>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {bulkExportData.validationErrors.map((error, index) => (
                    <p key={index} className="text-red-300 text-sm">{error}</p>
                  ))}
                </div>
              </div>
            )}
            {/* Preview dữ liệu */}
            {bulkExportData.previewData.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-semibold">
                    Preview dữ liệu ({bulkExportData.previewData.length} sản phẩm)
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      Hợp lệ: {bulkExportData.previewData.filter(row => row._errors.length === 0).length}
                    </span>
                    <span className="text-sm text-red-400">
                      Lỗi: {bulkExportData.previewData.filter(row => row._errors.length > 0).length}
                    </span>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto border border-gaming-red/20 rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gaming-red">Dòng</TableHead>
                        <TableHead className="text-gaming-red">Mã SP</TableHead>
                        <TableHead className="text-gaming-red">Tên SP</TableHead>
                        <TableHead className="text-gaming-red">Số lượng</TableHead>
                        <TableHead className="text-gaming-red">Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bulkExportData.previewData.map((row, index) => (
                        <TableRow key={index} className={row._errors.length > 0 ? 'bg-red-900/10' : ''}>
                          <TableCell className="text-white">{row._rowIndex}</TableCell>
                          <TableCell className="text-white">{row.productId || row.sku || row.productcode}</TableCell>
                          <TableCell className="text-white">{row.productName || '-'}</TableCell>
                          <TableCell className="text-white font-bold">{row.quantity}</TableCell>
                          <TableCell>
                            {row._errors.length > 0 ? (
                              <div className="flex items-center gap-1">
                                <XCircle className="w-4 h-4 text-red-400" />
                                <span className="text-red-400 text-xs">Lỗi</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 text-xs">OK</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={handleBulkExport}
                className="bg-gaming-red text-white"
                disabled={bulkExportData.isProcessing || bulkExportData.previewData.length === 0 || bulkExportData.validationErrors.length > 0}
              >
                {bulkExportData.isProcessing ? 'Đang xử lý...' : 'Xuất kho hàng loạt'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowBulkExportModal(false);
                  setBulkExportData({
                    tab: 'upload',
                    file: null,
                    tableData: '',
                    note: '',
                    previewData: [],
                    validationErrors: [],
                    isProcessing: false,
                    isDragOver: false
                  });
                }}
                disabled={bulkExportData.isProcessing}
              >
                Hủy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
} 