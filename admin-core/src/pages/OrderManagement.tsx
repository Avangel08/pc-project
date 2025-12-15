import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Eye,
  Edit,
  FileText,
  Download,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  CalendarIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Printer,
  Mail,
  History,
  Clock,
  User
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getOrders, updateOrderStatus, deleteOrder, fetchOrderHistory, createOrderHistory } from '@/lib/api';

// Thêm interface cho lịch sử đơn hàng
interface OrderHistory {
  id: string;
  orderId: string;
  action: 'status_change' | 'delete' | 'resend_email' | 'print_invoice' | 'create' | 'update';
  oldStatus?: string;
  newStatus?: string;
  timestamp: string;
  user: string;
}

export const OrderManagement = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResendEmailModal, setShowResendEmailModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
  const [orderToResendEmail, setOrderToResendEmail] = useState<any | null>(null);
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportDateRange, setExportDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [exportFields, setExportFields] = useState({
    id: true,
    customer: true,
    products: true,
    total: true,
    status: true,
    date: true,
    payment: true,
  });
  
  // Thêm state phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Thêm state cho bộ lọc nâng cao
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [priceRange, setPriceRange] = useState<{
    min: string;
    max: string;
  }>({
    min: '',
    max: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [orderHistories, setOrderHistories] = useState<OrderHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Thay thế mảng trạng thái bằng đúng enum
  const ORDER_STATUS_OPTIONS = [
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'processing', label: 'Đang xử lý' },
    { key: 'shipping', label: 'Đang giao' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Hủy' },
    { key: 'returned', label: 'Trả hàng' },
  ];

  // Fetch orders từ API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const ordersData = await getOrders();
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách đơn hàng",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Kiểm tra quyền của người dùng
  const permission = {
    canViewDetails: true, // Tất cả đều có quyền xem chi tiết
    canChangeStatus: user?.role === 'admin' || user?.role === 'warehouse',
    canDelete: user?.role === 'admin',
    canPrintInvoice: user?.role === 'admin' || user?.role === 'warehouse' || user?.role === 'sales',
    canResendEmail: user?.role === 'admin' || user?.role === 'sales',
    canExportReport: user?.role === 'admin' || user?.role === 'sales'
  };

  // Hàm lọc đơn hàng
  const filteredOrders = orders.filter((order) => {
    // Lọc theo từ khóa tìm kiếm
    const searchMatch = 
      order.orderId?.toString().includes(searchTerm) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some((item: any) => 
        item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.product?.productCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Lọc theo trạng thái
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;

    // Lọc theo phương thức thanh toán
    const paymentMatch = paymentFilter === 'all' || order.payment === paymentFilter;

    // Lọc theo khoảng thời gian
    let dateMatch = true;
    if (dateRange.from && dateRange.to) {
      const orderDate = new Date(order.createdAt);
      dateMatch = orderDate >= dateRange.from && orderDate <= dateRange.to;
    }

    // Lọc theo khoảng giá
    let priceMatch = true;
    if (priceRange.min || priceRange.max) {
      const min = priceRange.min ? parseInt(priceRange.min) : 0;
      const max = priceRange.max ? parseInt(priceRange.max) : Infinity;
      priceMatch = order.total >= min && order.total <= max;
    }

    return searchMatch && statusMatch && paymentMatch && dateMatch && priceMatch;
  });

  // Reset tất cả bộ lọc
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setDateRange({ from: undefined, to: undefined });
    setPriceRange({ min: '', max: '' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-gaming-gold text-black">Chờ xác nhận</Badge>;
      case 'confirmed':
        return <Badge className="bg-gaming-cyan text-black">Đã xác nhận</Badge>;
      case 'processing':
        return <Badge className="bg-gaming-blue text-white">Đang xử lý</Badge>;
      case 'shipping':
        return <Badge className="bg-gaming-cyan text-black">Đang giao</Badge>;
      case 'completed':
        return <Badge className="bg-gaming-green text-black">Hoàn thành</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Đã hủy</Badge>;
      case 'returned':
        return <Badge className="bg-gaming-red text-white">Trả hàng</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Package className="w-4 h-4 text-gaming-gold" />;
      case 'shipping':
        return <Truck className="w-4 h-4 text-gaming-cyan" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-gaming-green" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gaming-red" />;
      default:
        return <Package className="w-4 h-4 text-gray-400" />;
    }
  };

  // Tính toán đơn hàng hiển thị theo trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Hàm chuyển trang
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Hàm thay đổi số đơn hàng mỗi trang
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset về trang 1
  };

  // Hàm xóa đơn hàng
  const handleDeleteOrder = async () => {
    if (orderToDelete) {
      try {
        await deleteOrder(orderToDelete.orderId);
        
        // Thêm lịch sử hành động
        await addOrderHistory(orderToDelete.orderId, 'delete');
        
        // Cập nhật state orders sau khi xóa thành công
        setOrders(prevOrders => prevOrders.filter(order => order.orderId !== orderToDelete.orderId));
        
      setShowDeleteModal(false);
      setOrderToDelete(null);
        
        toast({
          title: "Thành công",
          description: "Đã xóa đơn hàng thành công",
        });
      } catch (error) {
        console.error('Error deleting order:', error);
        toast({
          title: "Lỗi",
          description: "Không thể xóa đơn hàng",
          variant: "destructive",
        });
      }
    }
  };

  // Hàm in hóa đơn
  const handlePrintInvoice = (order: any) => {
    addOrderHistory(order.orderId, 'print_invoice');
    const doc = new jsPDF();

    // Tiêu đề
    doc.setFontSize(20);
    doc.text('HÓA ĐƠN BÁN HÀNG', 105, 18, { align: 'center' });

    // Thông tin công ty
    doc.setFontSize(11);
    doc.text('PC SHOP - CỬA HÀNG MÁY TÍNH', 105, 26, { align: 'center' });
    doc.text('Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM', 105, 32, { align: 'center' });
    doc.text('Điện thoại: 0123-456-789 | Email: info@pcshop.com', 105, 38, { align: 'center' });

    // Thông tin đơn hàng & khách hàng
    let y = 48;
    doc.setFontSize(12);
    doc.text('Thông tin đơn hàng:', 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.text(`Mã đơn hàng: ${order.orderId}`, 14, y);
    doc.text(`Ngày đặt: ${new Date(order.createdAt).toLocaleDateString('vi-VN')}`, 80, y);
    y += 6;
    doc.text(`Trạng thái: ${getStatusText(order.status)}`, 14, y);

    y += 10;
    doc.setFontSize(12);
    doc.text('Thông tin khách hàng:', 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.text(`Họ tên: ${order.customer?.name || 'N/A'}`, 14, y);
    doc.text(`SĐT: ${order.customer?.phone || 'N/A'}`, 80, y);
    y += 6;
    doc.text(`Email: ${order.customer?.email || 'N/A'}`, 14, y);
    y += 6;
    doc.text(`Địa chỉ: ${order.customer?.address || 'N/A'}`, 14, y);

    // Bảng sản phẩm
    y += 10;
    doc.setFontSize(12);
    doc.text('Danh sách sản phẩm:', 14, y);

    const tableData = order.items?.map((item: any, idx: number) => [
      idx + 1,
      item.product?.name || '',
      item.product?.productCode || '',
      item.quantity,
      (item.product?.price || 0).toLocaleString('vi-VN'),
      ((item.product?.price || 0) * item.quantity).toLocaleString('vi-VN')
    ]) || [];

    autoTable(doc, {
      startY: y + 3,
      head: [['STT', 'Tên sản phẩm', 'SKU', 'SL', 'Đơn giá', 'Thành tiền']],
      body: tableData,
      styles: { font: 'helvetica', fontSize: 10 },
      headStyles: { fillColor: [0, 153, 255], textColor: 255 },
      theme: 'grid',
      margin: { left: 14, right: 14 }
    });

    // Tổng tiền & thanh toán
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`TỔNG CỘNG: ${order.total?.toLocaleString('vi-VN')} VNĐ`, 14, finalY);
    finalY += 7;
    doc.setFontSize(10);
    doc.text(`Phương thức thanh toán: ${order.payment === 'cod' ? 'Tiền mặt' : 
      order.payment === 'bank' ? 'Chuyển khoản' : 
      order.payment === 'momo' ? 'Momo' : 
      order.payment === 'zalopay' ? 'ZaloPay' : order.payment}`, 14, finalY);

    // Footer
    doc.setFontSize(10);
    doc.text('Cảm ơn quý khách đã mua hàng!', 105, finalY + 15, { align: 'center' });

    doc.save(`hoa-don-${order.orderId}.pdf`);
    toast({
      title: "Thành công",
      description: "Đã tạo hóa đơn PDF đẹp, chuẩn tiếng Việt!",
    });
  };

  // Hàm gửi lại email xác nhận
  const handleResendEmail = () => {
    if (orderToResendEmail) {
      console.log('Gửi lại email xác nhận:', orderToResendEmail.id);
      // Thêm lịch sử hành động
      addOrderHistory(orderToResendEmail.orderId, 'resend_email');
      setShowResendEmailModal(false);
      setOrderToResendEmail(null);
      
      toast({
        title: "Thành công",
        description: "Đã gửi lại email xác nhận",
      });
    }
  };

  // Khi mở modal chi tiết đơn hàng, lấy lịch sử từ API
  useEffect(() => {
    const fetchHistory = async () => {
      if (showModal && selectedOrder) {
        setLoadingHistory(true);
        try {
          const histories = await fetchOrderHistory(selectedOrder.orderId);
          setOrderHistories(histories);
        } catch (err) {
          setOrderHistories([]);
        } finally {
          setLoadingHistory(false);
        }
      }
    };
    fetchHistory();
  }, [showModal, selectedOrder]);

  // Hàm lấy lịch sử đơn hàng từ state
  const getOrderHistory = (orderId: string) => {
    return orderHistories.filter(history => history.orderId === orderId);
  };

  // Hàm thêm lịch sử hành động qua API
  const addOrderHistory = async (orderId: string, action: string, oldStatus?: string, newStatus?: string) => {
    const newHistory = {
      orderId,
      action,
      oldStatus,
      newStatus,
      user: user?.name || user?.email || 'Admin',
    };
    try {
      await createOrderHistory(newHistory);
      // Sau khi tạo mới, reload lại lịch sử
      if (selectedOrder) {
        const histories = await fetchOrderHistory(selectedOrder.orderId);
        setOrderHistories(histories);
      }
    } catch (err) {
      // Có thể toast lỗi nếu muốn
    }
  };

  // Hàm xuất báo cáo
  const handleExportReport = () => {
    if (!exportDateRange.from || !exportDateRange.to) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn khoảng thời gian xuất báo cáo",
        variant: "destructive",
      });
      return;
    }

    // Lọc đơn hàng theo khoảng thời gian
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= exportDateRange.from! && orderDate <= exportDateRange.to!;
    });

    // Lọc các trường được chọn
    const selectedFields = Object.entries(exportFields)
      .filter(([_, selected]) => selected)
      .map(([field]) => field);

    // Tạo dữ liệu xuất
    const exportData = filteredOrders.map(order => {
      const data: any = {};
      selectedFields.forEach(field => {
        if (field === 'total') {
          data[field] = order[field].toLocaleString();
        } else {
          data[field] = order[field];
        }
      });
      return data;
    });

    if (exportFormat === 'excel') {
      // Tạo nội dung Excel
      const headers = selectedFields.map(field => {
        switch (field) {
          case 'id': return 'Mã đơn hàng';
          case 'customer': return 'Khách hàng';
          case 'products': return 'Sản phẩm';
          case 'total': return 'Tổng tiền';
          case 'status': return 'Trạng thái';
          case 'date': return 'Ngày đặt';
          case 'payment': return 'Thanh toán';
          default: return field;
        }
      });

      // Tạo XML cho Excel
      const xml = `<?xml version="1.0"?>
        <?mso-application progid="Excel.Sheet"?>
        <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:html="http://www.w3.org/TR/REC-html40">
          <Worksheet ss:Name="Orders">
            <Table>
              <Row>
                ${headers.map(header => `<Cell><Data ss:Type="String">${header}</Data></Cell>`).join('')}
              </Row>
              ${exportData.map(order => `
                <Row>
                  ${selectedFields.map(field => `<Cell><Data ss:Type="String">${order[field]}</Data></Cell>`).join('')}
                </Row>
              `).join('')}
            </Table>
          </Worksheet>
        </Workbook>`;

      // Tạo và tải file
      const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_report_${format(exportDateRange.from, 'yyyy-MM-dd')}_${format(exportDateRange.to, 'yyyy-MM-dd')}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      // Tạo nội dung HTML cho PDF
      const content = `
        <html>
          <head>
            <title>Báo cáo đơn hàng</title>
            <style>
              body { font-family: inherit; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              h1 { color: #333; }
              .date-range { color: #666; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <h1>Báo cáo đơn hàng</h1>
            <div class="date-range">
              Từ ${format(exportDateRange.from, 'dd/MM/yyyy')} đến ${format(exportDateRange.to, 'dd/MM/yyyy')}
            </div>
            <table>
              <thead>
                <tr>
                  ${selectedFields.map(field => {
                    switch (field) {
                      case 'id': return '<th>Mã đơn hàng</th>';
                      case 'customer': return '<th>Khách hàng</th>';
                      case 'products': return '<th>Sản phẩm</th>';
                      case 'total': return '<th>Tổng tiền</th>';
                      case 'status': return '<th>Trạng thái</th>';
                      case 'date': return '<th>Ngày đặt</th>';
                      case 'payment': return '<th>Thanh toán</th>';
                      default: return `<th>${field}</th>`;
                    }
                  }).join('')}
                </tr>
              </thead>
              <tbody>
                ${exportData.map(order => `
                  <tr>
                    ${selectedFields.map(field => `<td>${order[field]}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      // Tạo và tải file
      const blob = new Blob([content], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_report_${format(exportDateRange.from, 'yyyy-MM-dd')}_${format(exportDateRange.to, 'yyyy-MM-dd')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }

    setShowExportModal(false);
    toast({
      title: "Xuất báo cáo thành công",
      description: `Đã xuất báo cáo ${exportFormat.toUpperCase()} thành công`,
    });
  };

  // Hàm dịch trạng thái đơn hàng sang tiếng Việt
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'shipping': return 'Đang giao';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      case 'returned': return 'Trả hàng';
      default: return status;
    }
  };

  // Hàm trả về mô tả tiếng Việt cho các action trong lịch sử đơn hàng
  const getActionText = (action: string) => {
    switch (action) {
      case 'status_change':
        return 'Thay đổi trạng thái';
      case 'delete':
        return 'Xóa đơn hàng';
      case 'resend_email':
        return 'Gửi lại email xác nhận';
      case 'print_invoice':
        return 'In hóa đơn';
      case 'create':
        return 'Tạo đơn hàng';
      case 'update':
        return 'Cập nhật đơn hàng';
      default:
        return 'Hành động không xác định';
    }
  };

  // Sửa hàm mở modal chi tiết đơn hàng
  const openOrderModal = async (orderId: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/orders/${orderId}`);
      const data = await res.json();
      setSelectedOrder(data);
      setShowModal(true);
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể lấy chi tiết đơn hàng', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (showModal && selectedOrder) {
      console.log('selectedOrder:', selectedOrder);
    }
  }, [showModal, selectedOrder]);

  return (
    <AdminLayout>
      <div className="font-sans space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl" style={{ color: '#00FFFF', fontWeight: 'bold' }}>
              Quản lý Đơn hàng
            </h1>
            <p className="text-gray-400 mt-1">
              Theo dõi và xử lý tất cả đơn hàng
            </p>
          </div>
          <div className="flex gap-2">
            {permission.canExportReport && (
              <Button 
                variant="outline" 
                className="border-gaming-cyan/30 text-gaming-cyan"
                onClick={() => setShowExportModal(true)}
              >
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <Card
            className="bg-gaming-dark border-gaming-cyan/20 cursor-pointer hover:border-gaming-cyan/60 transition"
            onClick={() => { setStatusFilter('all'); setDateRange({ from: undefined, to: undefined }); }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-gaming-cyan">Tổng đơn</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-white">{orders.length}</CardContent>
          </Card>
          <Card
            className="bg-gaming-dark border-gaming-cyan/20 cursor-pointer hover:border-gaming-cyan/60 transition"
            onClick={() => {
              setStatusFilter('all');
              const today = new Date();
              setDateRange({ from: today, to: today });
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-gaming-green">Đơn mới hôm nay</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-white">
              {orders.filter(o => {
                const orderDate = new Date(o.createdAt);
                const today = new Date();
                return orderDate.toDateString() === today.toDateString();
              }).length}
            </CardContent>
          </Card>
          <Card
            className="bg-gaming-dark border-gaming-cyan/20 cursor-pointer hover:border-gaming-cyan/60 transition"
            onClick={() => { setStatusFilter('pending'); setDateRange({ from: undefined, to: undefined }); }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-gaming-gold">Đang xử lý</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-white">
              {orders.filter(o => o.status === 'pending' || o.status === 'shipping').length}
            </CardContent>
          </Card>
          <Card
            className="bg-gaming-dark border-gaming-cyan/20 cursor-pointer hover:border-gaming-cyan/60 transition"
            onClick={() => { setStatusFilter('completed'); setDateRange({ from: undefined, to: undefined }); }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-gaming-green">Hoàn thành</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-white">
              {orders.filter(o => o.status === 'completed').length}
            </CardContent>
          </Card>
          <Card
            className="bg-gaming-dark border-gaming-cyan/20 cursor-pointer hover:border-gaming-cyan/60 transition"
            onClick={() => { setStatusFilter('cancelled'); setDateRange({ from: undefined, to: undefined }); }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-gaming-red">Đã hủy</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-white">
              {orders.filter(o => o.status === 'cancelled').length}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gaming-dark border-gaming-cyan/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm đơn hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gaming-darker border-gaming-cyan/30 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 bg-gaming-darker border-gaming-cyan/30 text-white">
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="bg-gaming-darker border-gaming-cyan/30">
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    {ORDER_STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" className="border-gaming-cyan/30 text-gaming-cyan"
                  onClick={() => setShowFilters((prev) => !prev)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Bộ lọc
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bộ lọc nâng cao */}
        {showFilters && (
          <Card className="bg-gaming-dark border-gaming-cyan/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Lọc theo khoảng thời gian */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Khoảng thời gian</label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                                {format(dateRange.to, "dd/MM/yyyy")}
                              </>
                            ) : (
                              format(dateRange.from, "dd/MM/yyyy")
                            )
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange.from}
                          selected={dateRange}
                          onSelect={(range: any) => setDateRange(range)}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Lọc theo trạng thái */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Trạng thái</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-gaming-darker border-gaming-cyan/20">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {ORDER_STATUS_OPTIONS.map(opt => (
                        <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lọc theo phương thức thanh toán */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Thanh toán</label>
                  <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger className="bg-gaming-darker border-gaming-cyan/20">
                      <SelectValue placeholder="Chọn phương thức" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="COD">Tiền mặt</SelectItem>
                      <SelectItem value="BANKING">Chuyển khoản</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lọc theo khoảng giá */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Khoảng giá</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Từ"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="bg-gaming-darker border-gaming-cyan/20"
                    />
                    <Input
                      type="number"
                      placeholder="Đến"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="bg-gaming-darker border-gaming-cyan/20"
                    />
                  </div>
                </div>
              </div>

              {/* Nút áp dụng và reset */}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  className="border-gaming-cyan/40 text-gaming-cyan"
                  onClick={resetFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  className="bg-gaming-cyan text-white"
                  onClick={() => setShowFilters(false)}
                >
                  Áp dụng
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders Table */}
        <Card className="bg-gaming-dark border-gaming-cyan/20">
          <CardHeader>
            <CardTitle className="text-2xl" style={{ color: '#fff', fontWeight: 'bold' }}>
              {`Danh sách đơn hàng [${orders.length}]`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gaming-cyan/20 border-t">
                  <TableHead className="text-gaming-cyan">Mã đơn hàng</TableHead>
                  <TableHead className="text-gaming-cyan">Khách hàng</TableHead>
                  <TableHead className="text-gaming-cyan">Sản phẩm</TableHead>
                  <TableHead className="text-gaming-cyan">Tổng tiền</TableHead>
                  <TableHead className="text-gaming-cyan">Trạng thái</TableHead>
                  <TableHead className="text-gaming-cyan">Ngày đặt</TableHead>
                  <TableHead className="text-gaming-cyan">Thanh toán</TableHead>
                  <TableHead className="text-gaming-cyan">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gaming-cyan"></div>
                        <span className="ml-2 text-gray-400">Đang tải...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                      Không có đơn hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((order) => (
                    <TableRow key={order.orderId} className="border-gaming-cyan/10 hover:bg-gaming-cyan/5">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                          <span className="font-medium text-gaming-cyan">#{order.orderId}</span>
                      </div>
                    </TableCell>
                      <TableCell className="text-white font-medium">{order.customer?.name || 'N/A'}</TableCell>
                    <TableCell className="text-gray-300 max-w-xs truncate">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={item.product?.productCode || idx}>
                            {item.product?.name || 'N/A'} - {item.product?.productCode || 'N/A'} (x{item.quantity})
                          </div>
                      ))}
                    </TableCell>
                    <TableCell className="text-white font-medium">
                        ₫{order.total?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-white">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-white">
                        {order.payment === 'cod' ? 'Tiền mặt' : 
                         order.payment === 'bank' ? 'Chuyển khoản' : 
                         order.payment === 'momo' ? 'Momo' : 
                         order.payment === 'zalopay' ? 'ZaloPay' : order.payment}
                      </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {permission.canViewDetails && (
                          <Button size="sm" variant="outline" className="border-gaming-cyan/40 text-gaming-cyan" onClick={() => openOrderModal(order.orderId)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {permission.canPrintInvoice && (
                          <Button size="sm" variant="outline" className="border-gaming-cyan/40 text-gaming-cyan" onClick={() => handlePrintInvoice(order)}>
                            <Printer className="h-4 w-4" />
                        </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  ))
                )}
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
                <span className="text-sm text-gray-400">đơn hàng mỗi trang</span>
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

        {/* Modal chi tiết đơn hàng */}
        {showModal && selectedOrder && (
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent style={{ maxWidth: 1000, width: '100%' }} className="bg-gaming-darker border-gaming-cyan/30 px-8 py-8 max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl" style={{ color: '#fff', fontWeight: 'bold' }}>
                  {`Chi tiết đơn hàng #${selectedOrder.orderId}`}
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gaming-dark border-gaming-cyan/20">
                  <TabsTrigger value="details" className="text-gaming-cyan data-[state=active]:bg-gaming-cyan data-[state=active]:text-black">
                    Thông tin đơn hàng
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-gaming-cyan data-[state=active]:bg-gaming-cyan data-[state=active]:text-black">
                    <History className="w-4 h-4 mr-2" />
                    Lịch sử hành động
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="mt-6">
                  <div className="space-y-4">
                    <div className="mb-2 text-white">Khách hàng: <span className="font-medium">{selectedOrder.customer?.name || 'N/A'}</span></div>
                    <div className="mb-2 text-white">Email: <span className="font-medium">{selectedOrder.customer?.email || 'N/A'}</span></div>
                    <div className="mb-2 text-white">Số điện thoại: <span className="font-medium">{selectedOrder.customer?.phone || 'N/A'}</span></div>
                    <div className="mb-2 text-white">Địa chỉ: <span className="font-medium">{selectedOrder.shippingAddress || 'N/A'}</span></div>
                <div className="mb-2 text-white">Sản phẩm:</div>
                    <div className="mb-4 overflow-x-auto w-full rounded-lg bg-gaming-dark shadow-lg">
                      <table className="min-w-[700px] w-full text-left">
                        <thead>
                          <tr className="bg-gaming-darker/80">
                            <th className="text-gaming-cyan text-left px-4 py-2 rounded-tl-lg whitespace-nowrap">Tên sản phẩm</th>
                            <th className="text-gaming-cyan text-left px-4 py-2 whitespace-nowrap">SKU</th>
                            <th className="text-gaming-cyan text-right px-4 py-2 whitespace-nowrap">Giá sản phẩm</th>
                            <th className="text-gaming-cyan text-center px-4 py-2 rounded-tr-lg whitespace-nowrap">Số lượng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items?.map((item: any, idx: number) => (
                            <tr key={item.product?.productCode || idx}>
                              <td className="text-white px-4 py-2 whitespace-nowrap">{item.product?.name || 'N/A'}</td>
                              <td className="text-white px-4 py-2 whitespace-nowrap">{item.product?.productCode || 'N/A'}</td>
                              <td className="text-white px-4 py-2 whitespace-nowrap text-right">{(item.product?.price && item.quantity) ? (item.product.price * item.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'N/A'}</td>
                              <td className="text-white text-center px-4 py-2 whitespace-nowrap">{item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                </div>
                    <div className="mb-2 text-white">Tổng tiền: <span className="font-medium">₫{selectedOrder.total?.toLocaleString() || '0'}</span></div>
                    <div className="mb-2 text-white">Trạng thái đơn hàng: <span className="font-medium">{getStatusBadge(selectedOrder.status || 'N/A')}</span></div>
                    <div className="mb-2 text-white">Ngày đặt: <span className="font-medium">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span></div>
                    <div className="mb-2 text-white">Thanh toán: <span className="font-medium">{selectedOrder.payment === 'cod' ? 'Tiền mặt' : 
                                                                                      selectedOrder.payment === 'bank' ? 'Chuyển khoản' : 
                                                                                      selectedOrder.payment === 'momo' ? 'Momo' : 
                                                                                      selectedOrder.payment === 'zalopay' ? 'ZaloPay' : selectedOrder.payment || 'N/A'}</span></div>
              </div>
                  
                  <div className="flex justify-center gap-3 w-full mt-8 overflow-x-auto pb-2">
                {permission.canChangeStatus && (
                      <>
                        {ORDER_STATUS_OPTIONS.map(st => (
                          <Button
                            key={st.key}
                            size="sm"
                            variant={selectedOrder.status === st.key ? 'default' : 'outline'}
                            className={selectedOrder.status === st.key ? 'bg-gaming-cyan text-white' : 'border-gaming-cyan/40 text-gaming-cyan'}
                            onClick={async () => {
                              try {
                                const oldStatus = selectedOrder.status;
                                await updateOrderStatus(selectedOrder.orderId, st.key, user?.name || user?.email || 'Admin');
                                setSelectedOrder({ ...selectedOrder, status: st.key });
                                // Thêm lịch sử hành động
                                await addOrderHistory(selectedOrder.orderId, 'status_change', oldStatus, st.key);
                                // Reload lại danh sách đơn hàng
                                const ordersData = await getOrders();
                                setOrders(ordersData);
                                toast({ title: 'Thành công', description: 'Đã cập nhật trạng thái đơn hàng!' });
                              } catch (err) {
                                toast({ title: 'Lỗi', description: 'Không thể cập nhật trạng thái!', variant: 'destructive' });
                              }
                            }}
                          >
                            {st.label}
                      </Button>
                    ))}
                      </>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="history" className="mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <History className="w-5 h-5 text-gaming-cyan" />
                      <h3 className="text-lg font-semibold text-white">Lịch sử hành động</h3>
                    </div>
                    
                    {getOrderHistory(selectedOrder.orderId).length > 0 ? (
                      <div className="space-y-3">
                        {getOrderHistory(selectedOrder.orderId).map((history, idx) => (
                          <div key={history.id || idx} className="flex items-start gap-3 p-3 bg-gaming-dark/50 rounded-lg border border-gaming-cyan/20">
                            <div className="flex-shrink-0 w-8 h-8 bg-gaming-cyan/20 rounded-full flex items-center justify-center">
                              {history.action === 'status_change' && <Package className="w-4 h-4 text-gaming-cyan" />}
                              {history.action === 'delete' && <Trash2 className="w-4 h-4 text-gaming-red" />}
                              {history.action === 'resend_email' && <Mail className="w-4 h-4 text-gaming-cyan" />}
                              {history.action === 'print_invoice' && <Printer className="w-4 h-4 text-gaming-cyan" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-medium">{getActionText(history.action)}</span>
                                {history.action === 'status_change' && history.oldStatus && history.newStatus && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Badge variant="outline" className="text-xs border-gaming-cyan/30 text-gaming-cyan">
                                      {getStatusText(history.oldStatus)}
                                    </Badge>
                                    <span className="text-gray-400">→</span>
                                    <Badge variant="outline" className="text-xs border-gaming-cyan/30 text-gaming-cyan">
                                      {getStatusText(history.newStatus)}
                                    </Badge>
                  </div>
                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date(history.timestamp).toLocaleString('vi-VN')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span>{history.user}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <History className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400">Chưa có lịch sử hành động cho đơn hàng này</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-center mt-8">
                <Button variant="outline" className="bg-red-500 text-white hover:bg-red-600 w-40" onClick={() => setShowModal(false)}>Đóng</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal xác nhận xóa đơn hàng */}
        {showDeleteModal && orderToDelete && (
          <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent className="bg-gaming-darker border-gaming-cyan/30 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-gaming-cyan">Xác nhận xóa đơn hàng</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Bạn có chắc chắn muốn xóa đơn hàng #{orderToDelete.orderId}? Hành động này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" className="ml-2" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
                <Button variant="destructive" onClick={handleDeleteOrder}>Xóa</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal xác nhận gửi lại email */}
        {showResendEmailModal && orderToResendEmail && (
          <Dialog open={showResendEmailModal} onOpenChange={setShowResendEmailModal}>
            <DialogContent className="bg-gaming-darker border-gaming-cyan/30 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-gaming-cyan">Gửi lại email xác nhận</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Bạn có chắc chắn muốn gửi lại email xác nhận cho đơn hàng #{orderToResendEmail.orderId}?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" className="ml-2" onClick={() => setShowResendEmailModal(false)}>Hủy</Button>
                <Button className="bg-gaming-cyan text-white" onClick={handleResendEmail}>Gửi</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal xuất báo cáo */}
        {showExportModal && (
          <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
            <DialogContent className="bg-gaming-darker border-gaming-cyan/30 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-gaming-cyan">Xuất báo cáo đơn hàng</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Chọn định dạng và khoảng thời gian xuất báo cáo
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Chọn định dạng xuất */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Định dạng xuất</label>
                  <div className="flex gap-4">
                    <Button
                      variant={exportFormat === 'excel' ? 'default' : 'outline'}
                      className={exportFormat === 'excel' ? 'bg-gaming-cyan text-white' : 'border-gaming-cyan/40 text-gaming-cyan'}
                      onClick={() => setExportFormat('excel')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                    <Button
                      variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                      className={exportFormat === 'pdf' ? 'bg-gaming-cyan text-white' : 'border-gaming-cyan/40 text-gaming-cyan'}
                      onClick={() => setExportFormat('pdf')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>

                {/* Chọn khoảng thời gian */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Khoảng thời gian</label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !exportDateRange.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {exportDateRange.from ? (
                            exportDateRange.to ? (
                              <>
                                {format(exportDateRange.from, "dd/MM/yyyy")} -{" "}
                                {format(exportDateRange.to, "dd/MM/yyyy")}
                              </>
                            ) : (
                              format(exportDateRange.from, "dd/MM/yyyy")
                            )
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={exportDateRange.from}
                          selected={exportDateRange}
                          onSelect={(range: any) => setExportDateRange(range)}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Chọn trường xuất */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Trường xuất</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(exportFields).map(([field, selected]) => (
                      <div key={field} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={field}
                          checked={selected}
                          onChange={(e) => setExportFields({ ...exportFields, [field]: e.target.checked })}
                          className="rounded border-gaming-cyan/30 text-gaming-cyan focus:ring-gaming-cyan"
                        />
                        <label htmlFor={field} className="text-sm text-gray-300">
                          {field === 'id' ? 'Mã đơn hàng' :
                           field === 'customer' ? 'Khách hàng' :
                           field === 'products' ? 'Sản phẩm' :
                           field === 'total' ? 'Tổng tiền' :
                           field === 'status' ? 'Trạng thái' :
                           field === 'date' ? 'Ngày đặt' :
                           field === 'payment' ? 'Thanh toán' : field}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="ml-2" onClick={() => setShowExportModal(false)}>Hủy</Button>
                <Button 
                  style={{
                    background: 'linear-gradient(90deg, #1A1A2E 0%, #121212 100%)',
                    border: '0.5px solid #00fff7',
                    color: '#fff',
                  }}
                  className="hover:bg-[#121212] focus:bg-[#121212]"
                  onClick={handleExportReport}
                >
                  Xuất báo cáo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrderManagement;
