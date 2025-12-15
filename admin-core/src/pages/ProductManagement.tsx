import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProductModal } from '@/components/modals/ProductModal';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  Package,
  Eye,
  Star,
  MoreVertical,
  TrendingUp,
  AlertTriangle,
  BarChart2,
  DollarSign,
  ShoppingCart,
  ThumbsUp,
  FileDown,
  Calendar
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '@/lib/api';
import { Product } from '@/types/product';

interface ProductStatsProps {
  products: Product[];
}

const ProductStats = ({ products }: ProductStatsProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = ['all', ...PRODUCT_CATEGORIES];
  
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const totalProducts = filteredProducts.length;
  const outOfStock = filteredProducts.filter(p => p.stock === 0).length;
  const activeProducts = filteredProducts.filter(p => p.stock > 0).length;
  const totalInventoryValue = filteredProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStock = filteredProducts.filter(p => p.stock > 0 && p.stock < 10);
  const lowRated: Product[] = []; // Rating not available in Product type

  const categoryStats = filteredProducts.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-white">Thống kê nhanh</h2>
        <div className="flex items-center gap-1.5">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={`text-xs px-2.5 py-1 h-7 ${
                selectedCategory === category 
                  ? 'bg-gaming-cyan/20 text-gaming-cyan border-[#00fff7]/40' 
                  : 'bg-transparent border-[#00fff7]/20 text-gaming-cyan/70 hover:bg-gaming-cyan/10 hover:text-gaming-cyan hover:border-[#00fff7]/30'
              }`}
            >
              {category === 'all' ? 'Tất cả' : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border border-gaming-cyan/20 hover:border-gaming-cyan transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gaming-cyan">Tổng sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {outOfStock} hết hàng • {activeProducts} đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border border-gaming-cyan/20 hover:border-gaming-cyan transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gaming-cyan">Giá trị tồn kho</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalInventoryValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Trung bình {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalInventoryValue / totalProducts)}/sản phẩm
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border border-gaming-cyan/20 hover:border-gaming-cyan transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gaming-cyan">Danh mục hàng đầu</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topCategory || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {categoryStats[topCategory || ''] || 0} sản phẩm
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border border-gaming-cyan/20 hover:border-gaming-cyan transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gaming-cyan">Cảnh báo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStock.length}</div>
            <p className="text-xs text-muted-foreground">
              {lowStock.length} sắp hết hàng
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Danh mục sản phẩm chuẩn hóa
const PRODUCT_CATEGORIES = [
  'Chuột',
  'Bàn phím',
  'Lót chuột',
  'Tai nghe',
  'Bàn',
  'Ghế',
  'Mô hình',
  'Decor'
];

export const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000000 });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const categories = PRODUCT_CATEGORIES;

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  // Log số lượng sản phẩm và danh sách filteredProducts để debug
  console.log('Tổng sản phẩm từ backend:', products.length);
  const filteredProducts = products.filter((p) => {
    // Lọc theo danh mục
    const matchCategory = !categoryFilter || p.category === categoryFilter;
    // Lọc theo trạng thái
    const matchStatus =
      !statusFilter ||
      (statusFilter === "active" && p.stock > 0 && (p.status === "con_hang" || !p.status)) ||
      (statusFilter === "out_of_stock" && p.stock === 0 && (p.status === "het_hang" || !p.status)) ||
      (statusFilter === "sap_het" && (p.status === "sap_het" || (p.stock > 0 && p.stock < 10))) ||
      (statusFilter === "sap_ve" && p.status === "sap_ve") ||
      (statusFilter === "ngung_kinh_doanh" && p.status === "ngung_kinh_doanh");
    // Lọc theo từ khóa tìm kiếm (tên hoặc mã sản phẩm)
    const matchSearch =
      !searchTerm ||
      (typeof p.name === 'string' && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof p.productCode === 'string' && p.productCode.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCategory && matchStatus && matchSearch;
  });
  console.log('filteredProducts:', filteredProducts.map(p => ({ id: p.id, name: p.name, productCode: p.productCode })));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleCreateProduct = async (productData: Product) => {
    try {
      const newProduct = await createProduct(productData);
      console.log('Created product:', newProduct);
      // Refresh danh sách sản phẩm thay vì chỉ thêm vào state
      const updatedProducts = await fetchProducts();
      setProducts(updatedProducts);
    } catch (error: any) {
      console.error('Error creating product:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error details:', error.response?.data?.details);
      
      let errorMessage = 'Không thể tạo sản phẩm. Vui lòng thử lại.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
          errorMessage = errorData.details.join(', ');
        } else if (errorData.error) {
          errorMessage = errorData.error;
          if (errorData.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
            errorMessage += ': ' + errorData.details.join(', ');
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Lỗi tạo sản phẩm",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = async (id: string, productData: Product) => {
    const updated = await updateProduct(id, productData);
    setProducts(prev => prev.map(p => p.id === id ? updated : p));
  };

  const handleViewProduct = (product: Product) => {
    setModalMode('view');
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const confirmDelete = () => {
    if (productToDelete) {
      handleDeleteProduct(productToDelete.id.toString());
      toast({
        title: "Xóa sản phẩm thành công",
        description: `Sản phẩm "${productToDelete.name}" đã được xóa.`,
      });
      setProductToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string, stock: number) => {
    let actualStatus = status;

    // Chỉ tự động đổi nếu status là con_hang, sap_het, het_hang hoặc undefined
    if (!status || status === 'con_hang' || status === 'sap_het' || status === 'het_hang') {
      if (stock === 0) {
        actualStatus = 'het_hang';
      } else if (stock < 10) {
        actualStatus = 'sap_het';
      } else if (stock >= 10) {
        actualStatus = 'con_hang';
      }
    }

    switch (actualStatus) {
      case 'sap_ve':
        return <Badge className="bg-blue-500 text-white">Sắp về</Badge>;
      case 'con_hang':
        return <Badge className="bg-green-500 text-white">Còn hàng</Badge>;
      case 'sap_het':
        return <Badge className="bg-yellow-500 text-black">Sắp hết</Badge>;
      case 'het_hang':
        return <Badge variant="destructive">Hết hàng</Badge>;
      case 'ngung_kinh_doanh':
        return <Badge className="bg-gray-500 text-white">Ngừng kinh doanh</Badge>;
      default:
        return <Badge className="bg-green-500 text-white">Còn hàng</Badge>;
    }
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Báo cáo sản phẩm');

    // Title row
    worksheet.mergeCells('A1:I1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'BÁO CÁO QUẢN LÝ SẢN PHẨM';
    titleCell.font = { size: 18, bold: true, color: { argb: 'FF22304A' } }; // navy/dark gray
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 32;

    // Exporter name row (row 2)
    worksheet.mergeCells('A2:I2');
    const nameCell = worksheet.getCell('A2');
    nameCell.value = 'Người xuất: Admin';
    nameCell.font = { size: 12, italic: true, color: { argb: 'FF888888' } };
    nameCell.alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getRow(2).height = 20;

    // Blank row (row 3)
    worksheet.getRow(3).height = 10;

    // Header row (row 4)
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Tên sản phẩm', key: 'name', width: 30 },
      { header: 'Danh mục', key: 'category', width: 20 },
      { header: 'Giá', key: 'price', width: 15 },
      { header: 'Số lượng', key: 'stock', width: 10 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Đánh giá', key: 'rating', width: 10 },
      { header: 'Số đánh giá', key: 'reviews', width: 10 },
      { header: 'Mô tả', key: 'description', width: 40 }
    ];
    const headerRow = worksheet.getRow(4);
    headerRow.font = { bold: true, color: { argb: 'FF22304A' }, size: 12 }; // dark navy
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F4F8' } // very light gray-blue
    };
    headerRow.border = {
      bottom: { style: 'thin', color: { argb: 'FFB0B8C1' } }
    };
    worksheet.getRow(4).height = 24;

    // Add product rows with spacing and group separation
    let excelRow = 5;
    // Sort products by category for grouping
    const sortedProducts = [...filteredProducts].sort((a, b) => (a.category || '').localeCompare(b.category || ''));
    let lastCategory = null;
    sortedProducts.forEach((product, idx) => {
      // Insert a blank row if category changes (except first group)
      if (lastCategory !== null && product.category !== lastCategory) {
        worksheet.insertRow(excelRow, []);
        worksheet.getRow(excelRow).height = 12;
        excelRow++;
      }
      worksheet.addRow({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        status: product.stock > 0 ? 'Còn hàng' : 'Hết hàng',
        // rating: product.rating, // Not in Product type
        // reviews: product.reviews, // Not in Product type
        description: product.description
      });
      // Style for product row
      const row = worksheet.getRow(excelRow);
      row.font = { size: 11, color: { argb: 'FF22304A' } };
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.border = {
        bottom: { style: 'hair', color: { argb: 'FFB0B8C1' } }
      };
      row.height = 20;
      row.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: idx % 2 === 0 ? 'FFFFFFFF' : 'FFF7F9FB' }
        };
      });
      // Add a blank row for spacing after each product
      excelRow++;
      worksheet.insertRow(excelRow, []);
      worksheet.getRow(excelRow).height = 8;
      excelRow++;
      lastCategory = product.category;
    });

    // Create and download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bao_cao_quan_ly_san_pham.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text('DANH SÁCH SẢN PHẨM', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

    autoTable(doc, {
      startY: 20,
      head: [[
        'ID', 'Tên sản phẩm', 'Danh mục', 'Giá', 'Số lượng', 'Trạng thái', 'Đánh giá', 'Số đánh giá'
      ]],
      body: filteredProducts.map(product => [
        product.id,
        product.name,
        product.category,
        product.price.toLocaleString('vi-VN'),
        product.stock,
        product.stock > 0 ? 'Còn hàng' : 'Hết hàng',
        // product.rating, // Not in Product type
        // product.reviews // Not in Product type
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 3,
        valign: 'middle',
        halign: 'center',
      },
      headStyles: {
        fillColor: [0, 255, 247], // cyan
        textColor: 20,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        textColor: 30,
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [240, 248, 255]
      },
      tableLineColor: [0, 255, 247],
      tableLineWidth: 0.2,
    });

    doc.save('danh_sach_san_pham.pdf');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#00fff7]">
              Quản lý Sản phẩm
            </h1>
            <p className="text-gray-400 mt-1">
              Quản lý toàn bộ sản phẩm trong cửa hàng
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={exportToExcel} variant="outline" className="bg-gaming-dark/50 border-gaming-cyan/20 hover:bg-gaming-cyan/10">
              <FileDown className="w-4 h-4 mr-2" />
              Xuất Excel
            </Button>
            <Button onClick={exportToPDF} variant="outline" className="bg-gaming-dark/50 border-gaming-cyan/20 hover:bg-gaming-cyan/10">
              <FileDown className="w-4 h-4 mr-2" />
              Xuất PDF
            </Button>
            <Button onClick={() => {
              setModalMode('create');
              setSelectedProduct(undefined);
              setIsModalOpen(true);
            }} variant="outline" className="bg-gaming-dark/50 border-gaming-cyan/20 hover:bg-gaming-cyan/10 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </Button>
          </div>
        </div>

        {/* Quick Stats Section */}
        <ProductStats products={products} />

        {/* Search and Filters Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search Bar */}
          <div className="lg:col-span-2">
            <Card className="bg-gaming-dark/50 border-gaming-cyan/20">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gaming-darker/50 border-gaming-cyan/30 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Filters */}
          <div className="lg:col-span-2">
            <Card className="bg-gaming-dark/50 border-gaming-cyan/20">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="flex-1 min-w-[150px] p-2 rounded bg-gaming-darker/50 border border-gaming-cyan/30 text-white focus:ring-2 focus:ring-gaming-cyan"
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 min-w-[150px] p-2 rounded bg-gaming-darker/50 border border-gaming-cyan/30 text-white focus:ring-2 focus:ring-gaming-cyan"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Còn hàng</option>
                    <option value="out_of_stock">Hết hàng</option>
                    <option value="sap_het">Sắp hết</option>
                    <option value="sap_ve">Sắp về</option>
                    <option value="ngung_kinh_doanh">Ngừng kinh doanh</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Products Table */}
        <Card className="bg-gaming-dark/50 border-gaming-cyan/20">
          <CardHeader className="border-b border-gaming-cyan/20">
            <CardTitle className="text-white">
              Danh sách sản phẩm [ {filteredProducts.length} ]
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                  <TableRow className="border-gaming-cyan/20 hover:bg-gaming-cyan/5">
                    <TableHead className="text-[#00fff7] w-[120px]">Mã SP</TableHead>
                    <TableHead className="text-[#00fff7] w-[80px]">Hình ảnh</TableHead>
                    <TableHead className="text-[#00fff7]">Tên sản phẩm</TableHead>
                    <TableHead className="text-[#00fff7] w-[120px]">Danh mục</TableHead>
                    <TableHead className="text-[#00fff7] w-[120px]">Nhà cung cấp</TableHead>
                    <TableHead className="text-[#00fff7] w-[120px]">Giá</TableHead>
                    <TableHead className="text-[#00fff7] w-[100px]">Tồn kho</TableHead>
                    <TableHead className="text-[#00fff7] w-[100px]">Trạng thái</TableHead>
                    <TableHead className="text-[#00fff7] w-[120px]">Giá trị tồn kho</TableHead>
                    <TableHead className="text-[#00fff7] w-[120px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {currentProducts.map((product) => (
                  <TableRow key={product.id} className="border-gaming-cyan/10 hover:bg-gaming-cyan/5">
                    <TableCell className="text-white text-sm font-mono">{product.productCode}</TableCell>
                    <TableCell>
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-gaming-darker/50 rounded flex items-center justify-center">
                          <Package className="w-6 h-6 text-gaming-cyan" />
                        </div>
                        )}
                    </TableCell>
                      <TableCell className="text-white font-medium">{product.name}</TableCell>
                      <TableCell className="text-white">{
                        PRODUCT_CATEGORIES.includes(product.category) ? product.category : 'Khác'
                      }</TableCell>
                    <TableCell className="text-white text-sm">{product.supplier || 'Chưa có'}</TableCell>
                      <TableCell className="text-white">{product.price.toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell className="text-white">{product.stock}</TableCell>
                      <TableCell>{getStatusBadge(product.status || 'con_hang', product.stock)}</TableCell>
                    <TableCell className="text-white">{(product.price * product.stock).toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="p-1 border-2 border-[#00fff7]/30 rounded-full hover:bg-gaming-cyan/10">
                              <MoreVertical className="h-4 w-4 text-gaming-cyan" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-32 p-1 bg-gaming-dark/90 border-gaming-cyan/20 backdrop-blur-sm">
                            <Button variant="ghost" size="sm" className="w-full justify-start text-gaming-cyan hover:bg-gaming-cyan/10" onClick={() => handleViewProduct(product)}>
                              <Eye className="h-4 w-4 mr-2" /> Xem
                        </Button>
                            <Button variant="ghost" size="sm" className="w-full justify-start text-gaming-purple hover:bg-gaming-purple/10" onClick={() => {
                              setModalMode('edit');
                              setSelectedProduct(product);
                              setIsModalOpen(true);
                            }}>
                              <Edit className="h-4 w-4 mr-2" /> Sửa
                        </Button>
                            <Button variant="ghost" size="sm" className="w-full justify-start text-gaming-red hover:bg-gaming-red/10" onClick={() => {
                              setProductToDelete(product);
                              setDeleteDialogOpen(true);
                            }}>
                              <Trash2 className="h-4 w-4 mr-2" /> Xóa
                        </Button>
                          </PopoverContent>
                        </Popover>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
          <CardFooter className="border-t border-gaming-cyan/20 p-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Hiển thị</span>
                <select
                  value={itemsPerPage}
                  onChange={e => handleItemsPerPageChange(e.target.value)}
                  className="p-2 rounded bg-gaming-darker/50 border border-gaming-cyan/30 text-white focus:ring-2 focus:ring-gaming-cyan"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-400">sản phẩm mỗi trang</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded border border-gaming-cyan/30 text-gaming-cyan hover:bg-gaming-cyan/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`px-3 py-1.5 rounded border ${
                      currentPage === page 
                        ? 'bg-gaming-cyan text-black border-gaming-cyan' 
                        : 'border-gaming-cyan/30 text-gaming-cyan hover:bg-gaming-cyan/10'
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="px-3 py-1.5 rounded border border-gaming-cyan/30 text-gaming-cyan hover:bg-gaming-cyan/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Product Modal */}
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProduct}
          mode={modalMode}
          onSave={modalMode === 'create' ? handleCreateProduct : (productData) => handleEditProduct(selectedProduct?.id?.toString() || '', productData)}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-gaming-dark/90 border-gaming-cyan/20 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Xác nhận xóa sản phẩm</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Bạn có chắc chắn muốn xóa sản phẩm "{productToDelete?.name}"? 
                Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gaming-cyan/30 text-gaming-cyan hover:bg-gaming-cyan/10">
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-gaming-red hover:bg-gaming-red/80"
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default ProductManagement;
