import React, { useState, useEffect, useCallback } from 'react';
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
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Lock,
  Unlock
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from 'xlsx';

// Định nghĩa type cho customer
interface Customer {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  orders?: number;
  totalSpent?: number;
  lastOrder?: string;
  status?: string;
  isActive?: boolean; // Thêm trường isActive
  joinDate?: string;
  createdAt?: string;
}

// Thêm type cho đơn hàng
interface CustomerOrder {
  id: string;
  createdAt: string;
  total: number;
  status: string;
}

// const customers = [
//   {
//     id: 'KH001',
//     name: 'Nguyễn Văn A',
//     email: 'nguyenvana@email.com',
//     phone: '0901234567',
//     orders: 15,
//     totalSpent: 12500000,
//     lastOrder: '2024-05-24',
//     status: 'active',
//     joinDate: '2023-12-15',
//     address: '123 Đường ABC, Quận 1, TP.HCM'
//   },
//   {
//     id: 'KH002',
//     name: 'Trần Thị B',
//     email: 'tranthib@email.com',
//     phone: '0912345678',
//     orders: 8,
//     totalSpent: 5600000,
//     lastOrder: '2024-05-20',
//     status: 'active',
//     joinDate: '2024-01-10',
//     address: '456 Đường XYZ, Quận 3, TP.HCM'
//   },
//   {
//     id: 'KH003',
//     name: 'Lê Văn C',
//     email: 'levanc@email.com',
//     phone: '0923456789',
//     orders: 3,
//     totalSpent: 2100000,
//     lastOrder: '2024-05-18',
//     status: 'inactive',
//     joinDate: '2024-03-05',
//     address: '789 Đường DEF, Quận 5, TP.HCM'
//   },
//   {
//     id: 'KH004',
//     name: 'Phạm Thị D',
//     email: 'phamthid@email.com',
//     phone: '0934567890',
//     orders: 22,
//     totalSpent: 18900000,
//     lastOrder: '2024-05-23',
//     status: 'vip',
//     joinDate: '2023-08-20',
//     address: '12 Đường GHI, Quận 7, TP.HCM'
//   }
// ]; // XÓA hoặc COMMENT toàn bộ array này

export const CustomerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isChatbotModalOpen, setIsChatbotModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [lockCustomer, setLockCustomer] = useState<Customer | null>(null);
  const [unlockCustomer, setUnlockCustomer] = useState<Customer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    level: 'Bronze'
  });
  const [filterData, setFilterData] = useState({
    level: '',
    status: '',
    startDate: '',
    endDate: '',
    minSpent: '',
    maxSpent: ''
  });
  const [emailData, setEmailData] = useState({
    subject: '',
    message: ''
  });
  const [chatbotData, setChatbotData] = useState({
    message: ''
  });
  const [noteData, setNoteData] = useState({
    note: ''
  });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [cachedCustomers, setCachedCustomers] = useState<Customer[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Tính toán dữ liệu động từ customerOrders
  const orderCount = customerOrders.length;
  const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  // Sắp xếp đơn hàng theo ngày tạo mới nhất
  const sortedOrders = [...customerOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const lastOrder = sortedOrders[0];
  // Ngày tham gia: ưu tiên lấy từ customer, nếu không có thì lấy ngày đơn đầu tiên
  const joinDate = selectedCustomer?.createdAt || (sortedOrders.length > 0 ? sortedOrders[sortedOrders.length - 1].createdAt : '');

  // Thống kê động
  const vipCount = cachedCustomers.filter(c => (c.totalSpent ?? 0) >= 15000000).length;
  const activeCount = cachedCustomers.filter(c => c.isActive !== false).length; // Sử dụng isActive thay vì status
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const newThisMonthCount = cachedCustomers.filter(c => {
    if (!c.joinDate) return false;
    const [year, month] = c.joinDate.split('-');
    return Number(year) === currentYear && Number(month) === currentMonth;
  }).length;

  // Fetch dữ liệu thực tế từ API khi component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/customers');
      const data = await response.json();
        setCachedCustomers(data);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    // Filter trên cachedCustomers thay vì customers mock
    if (debouncedSearchTerm) {
      const filteredCustomers = cachedCustomers.filter(customer => 
        customer.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      setCachedCustomers(filteredCustomers);
    } else {
      // Nếu không search, fetch lại toàn bộ từ API
      const fetchCustomers = async () => {
        try {
          const response = await fetch('http://localhost:3001/api/customers');
          const data = await response.json();
          setCachedCustomers(data);
        } catch (error) {
          console.error('Failed to fetch customers:', error);
        }
      };
      fetchCustomers();
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Gọi API lấy đơn hàng khi mở modal chi tiết khách hàng
  useEffect(() => {
    const fetchCustomerOrders = async () => {
      if (isDetailModalOpen && selectedCustomer) {
        setLoadingOrders(true);
        try {
          const res = await fetch(`/api/orders/customer/${selectedCustomer.id}`);
          const data = await res.json();
          setCustomerOrders(data.orders || []);
        } catch (err) {
          setCustomerOrders([]);
        } finally {
          setLoadingOrders(false);
        }
      } else {
        setCustomerOrders([]);
      }
    };
    fetchCustomerOrders();
  }, [isDetailModalOpen, selectedCustomer]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenFilterModal = () => setIsFilterModalOpen(true);
  const handleCloseFilterModal = () => setIsFilterModalOpen(false);
  const handleOpenDetailModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };
  const handleCloseDetailModal = () => setIsDetailModalOpen(false);
  const handleOpenEmailModal = () => setIsEmailModalOpen(true);
  const handleCloseEmailModal = () => setIsEmailModalOpen(false);
  const handleOpenChatbotModal = () => setIsChatbotModalOpen(true);
  const handleCloseChatbotModal = () => setIsChatbotModalOpen(false);
  const handleOpenNoteModal = () => setIsNoteModalOpen(true);
  const handleCloseNoteModal = () => setIsNoteModalOpen(false);
  const handleOpenEditModal = (customer: Customer) => {
    setEditCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
      status: customer.status || 'active',
      level: getCustomerLevel(customer.totalSpent || 0)
    });
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditCustomer(null);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilterData({ ...filterData, [e.target.name]: e.target.value });
  };
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEmailData({ ...emailData, [e.target.name]: e.target.value });
  };
  const handleChatbotChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setChatbotData({ ...chatbotData, [e.target.name]: e.target.value });
  };
  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNoteData({ ...noteData, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Thêm khách hàng mới vào danh sách (giả lập)
    const newCustomer: Customer = {
      id: `KH${Math.floor(Math.random() * 10000)}`,
      ...formData,
      orders: 0,
      totalSpent: 0,
      lastOrder: '',
      status: formData.status,
      joinDate: new Date().toISOString().slice(0, 10)
    };
    setCachedCustomers([newCustomer, ...cachedCustomers]);
    setNotification({ message: 'Khách hàng đã được thêm thành công!', type: 'success' });
    handleCloseModal();
  };
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Filter applied:', filterData);
    setNotification({ message: 'Bộ lọc đã được áp dụng!', type: 'info' });
    handleCloseFilterModal();
  };
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer?.email) return;
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedCustomer.email,
          subject: emailData.subject,
          message: emailData.message
        })
      });
      if (res.ok) {
    setNotification({ message: 'Email đã được gửi thành công!', type: 'success' });
      } else {
        setNotification({ message: 'Gửi email thất bại!', type: 'error' });
      }
    } catch (err) {
      setNotification({ message: 'Gửi email thất bại!', type: 'error' });
    }
    handleCloseEmailModal();
  };
  const handleChatbotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Chatbot message sent:', chatbotData);
    setNotification({ message: 'Tin nhắn đã được gửi thành công!', type: 'success' });
    handleCloseChatbotModal();
  };
  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Note saved:', noteData);
    setNotification({ message: 'Ghi chú đã được lưu thành công!', type: 'success' });
    handleCloseNoteModal();
  };
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCustomers = cachedCustomers.map(c =>
      c.id === editCustomer?.id ? { ...c, ...formData } : c
    );
    setCachedCustomers(updatedCustomers);
    setNotification({ message: 'Cập nhật khách hàng thành công!', type: 'success' });
    handleCloseEditModal();
  };

  const handleOpenLockModal = (customer: Customer) => {
    setLockCustomer(customer);
    setIsLockModalOpen(true);
  };
  const handleCloseLockModal = () => {
    setIsLockModalOpen(false);
    setLockCustomer(null);
  };
  const handleLockCustomer = async () => {
    if (!lockCustomer) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/customers/${lockCustomer.id}/lock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        // Cập nhật trạng thái khách hàng trên UI
        const updatedCustomers = cachedCustomers.map(c =>
          c.id === lockCustomer.id ? { ...c, isActive: false } : c
        );
        setCachedCustomers(updatedCustomers);
        setNotification({ message: 'Khách hàng đã bị khóa!', type: 'success' });
      } else {
        setNotification({ message: 'Khóa khách hàng thất bại!', type: 'error' });
      }
    } catch (error) {
      console.error('Error locking customer:', error);
      setNotification({ message: 'Khóa khách hàng thất bại!', type: 'error' });
    }
    
    handleCloseLockModal();
  };

  const handleOpenUnlockModal = (customer: Customer) => {
    setUnlockCustomer(customer);
    setIsUnlockModalOpen(true);
  };
  const handleCloseUnlockModal = () => {
    setIsUnlockModalOpen(false);
    setUnlockCustomer(null);
  };
  const handleUnlockCustomer = async () => {
    if (!unlockCustomer) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/customers/${unlockCustomer.id}/unlock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        // Cập nhật trạng thái khách hàng trên UI
        const updatedCustomers = cachedCustomers.map(c =>
          c.id === unlockCustomer.id ? { ...c, isActive: true } : c
        );
        setCachedCustomers(updatedCustomers);
        setNotification({ message: 'Khách hàng đã được mở khóa!', type: 'success' });
      } else {
        setNotification({ message: 'Mở khóa khách hàng thất bại!', type: 'error' });
      }
    } catch (error) {
      console.error('Error unlocking customer:', error);
      setNotification({ message: 'Mở khóa khách hàng thất bại!', type: 'error' });
    }
    
    handleCloseUnlockModal();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = cachedCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(cachedCustomers.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getStatusBadge = (isActive: boolean | undefined) => {
    if (isActive === false) {
      return <Badge variant="destructive">Đã khóa</Badge>;
    } else {
      return <Badge className="bg-gaming-green text-black">Hoạt động</Badge>;
    }
  };

  const getCustomerLevel = (totalSpent: number) => {
    if (totalSpent >= 15000000) return 'VIP';
    if (totalSpent >= 5000000) return 'Gold';
    if (totalSpent >= 1000000) return 'Silver';
    return 'Bronze';
  };

  const handleExportExcel = (e: React.MouseEvent) => {
    const headers = ['ID', 'Tên', 'Email', 'Số điện thoại', 'Số đơn hàng', 'Tổng chi tiêu', 'Đơn hàng cuối', 'Trạng thái', 'Ngày tham gia'];
    const data = cachedCustomers.map(customer => [
      customer.id,
      customer.name,
      customer.email,
      customer.phone,
      customer.orders,
      customer.totalSpent,
      customer.lastOrder,
      customer.status,
      customer.joinDate
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    XLSX.writeFile(wb, 'customers.xlsx');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: '#00fff7' }}>Quản lý Khách hàng</h1>
            <p className="text-gray-400 mt-1">
              Quản lý thông tin và lịch sử khách hàng
            </p>
          </div>
          <Button onClick={handleOpenModal} className="bg-gradient-to-r from-gaming-cyan to-gaming-purple hover:from-gaming-cyan/80 hover:to-gaming-purple/80 transition-all duration-300 shadow-lg hover:shadow-gaming-cyan/50">
            <User className="w-4 h-4 mr-2" />
            Thêm khách hàng
          </Button>
        </div>

        {/* Notification */}
        {notification.message && (
          <div className={`p-4 rounded-md ${notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'} text-white`}>
            {notification.message}
          </div>
        )}

        {/* Filters */}
        <Card className="bg-gaming-dark border-gaming-cyan/20 hover:border-gaming-cyan/40 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm khách hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gaming-darker border-gaming-cyan/30 text-white focus:border-gaming-cyan transition-all duration-300"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleOpenFilterModal} variant="outline" className="border-gaming-cyan/30 text-gaming-cyan hover:bg-gaming-cyan/20 transition-all duration-300">
                  <Filter className="w-4 h-4 mr-2" />
                  Bộ lọc
                </Button>
                <Button onClick={handleExportExcel} variant="outline" className="border-gaming-cyan/30 text-gaming-cyan hover:bg-gaming-cyan/20 transition-all duration-300">
                  Xuất Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20 hover:border-gaming-cyan/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Tổng khách hàng</p>
                  <p className="text-2xl font-orbitron font-bold text-white mt-1">{cachedCustomers.length}</p>
                </div>
                <User className="w-8 h-8 text-gaming-cyan" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20 hover:border-gaming-cyan/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Khách hàng VIP</p>
                  <p className="text-2xl font-orbitron font-bold text-white mt-1">{vipCount}</p>
                </div>
                <User className="w-8 h-8 text-gaming-gold" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20 hover:border-gaming-cyan/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Mới tháng này</p>
                  <p className="text-2xl font-orbitron font-bold text-white mt-1">{newThisMonthCount}</p>
                </div>
                <Calendar className="w-8 h-8 text-gaming-green" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20 hover:border-gaming-cyan/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Hoạt động</p>
                  <p className="text-2xl font-orbitron font-bold text-white mt-1">{activeCount}</p>
                </div>
                <User className="w-8 h-8 text-gaming-purple" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customers Table */}
        <Card className="bg-gaming-dark border-gaming-cyan/20 hover:border-gaming-cyan/40 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white">Danh sách khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gaming-cyan/20">
                  <TableHead className="text-gaming-cyan">Khách hàng</TableHead>
                  <TableHead className="text-gaming-cyan">Liên hệ</TableHead>
                  <TableHead className="text-gaming-cyan">Đơn hàng</TableHead>
                  <TableHead className="text-gaming-cyan">Tổng chi tiêu</TableHead>
                  <TableHead className="text-gaming-cyan">Hạng</TableHead>
                  <TableHead className="text-gaming-cyan">Trạng thái</TableHead>
                  <TableHead className="text-gaming-cyan">Tham gia</TableHead>
                  <TableHead className="text-gaming-cyan">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((customer) => (
                  <TableRow key={customer.id} className="border-gaming-cyan/10 hover:bg-gaming-cyan/5 transition-all duration-300">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gaming-cyan to-gaming-purple rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{customer.name}</p>
                          <p className="text-sm text-gray-400">ID: #{customer.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-gray-300">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">{customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-300">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">{customer.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{customer.orders}</TableCell>
                    <TableCell className="text-white font-medium">
                      ₫{typeof customer.totalSpent === 'number' ? customer.totalSpent.toLocaleString() : '0'}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-gaming-purple text-white">
                        {getCustomerLevel(customer.totalSpent || 0)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(customer.isActive)}
                    </TableCell>
                    <TableCell className="text-gray-300">{customer.joinDate ? customer.joinDate : (customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-gaming-cyan hover:bg-gaming-cyan/20 transition-all duration-300" onClick={() => handleOpenDetailModal(customer)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gaming-purple hover:bg-gaming-purple/20 transition-all duration-300" onClick={() => handleOpenEditModal(customer)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {customer.isActive === false ? (
                          <Button variant="ghost" size="sm" className="text-gaming-green hover:bg-gaming-green/20 transition-all duration-300" onClick={() => handleOpenUnlockModal(customer)}>
                            <Unlock className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-gaming-red hover:bg-gaming-red/20 transition-all duration-300" onClick={() => handleOpenLockModal(customer)}>
                          <Lock className="w-4 h-4" />
                        </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Hiển thị</span>
                <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="bg-gaming-darker border-gaming-cyan/30 text-white rounded-md p-1 focus:border-gaming-cyan transition-all duration-300">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-400">mục</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="border-gaming-cyan/30 text-gaming-cyan hover:bg-gaming-cyan/20 transition-all duration-300">
                  Trước
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => handlePageChange(page)} className={currentPage === page ? "bg-gaming-cyan text-black" : "border-gaming-cyan/30 text-gaming-cyan hover:bg-gaming-cyan/20 transition-all duration-300"}>
                    {page}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="border-gaming-cyan/30 text-gaming-cyan hover:bg-gaming-cyan/20 transition-all duration-300">
                  Sau
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gaming-dark p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Thêm khách hàng mới</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Tên</label>
                  <Input name="name" value={formData.name} onChange={handleInputChange} className="mt-1 bg-gaming-darker border-gaming-cyan/30 text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Email</label>
                  <Input name="email" type="email" value={formData.email} onChange={handleInputChange} className="mt-1 bg-gaming-darker border-gaming-cyan/30 text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Số điện thoại</label>
                  <Input name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 bg-gaming-darker border-gaming-cyan/30 text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Địa chỉ</label>
                  <Input name="address" value={formData.address} onChange={handleInputChange} className="mt-1 bg-gaming-darker border-gaming-cyan/30 text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Trạng thái</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="mt-1 w-full bg-gaming-darker border-gaming-cyan/30 text-white rounded-md p-2">
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="vip">VIP</option>
                    <option value="blocked">Đã khóa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Cấp độ</label>
                  <select name="level" value={formData.level} onChange={handleInputChange} className="mt-1 w-full bg-gaming-darker border-gaming-cyan/30 text-white rounded-md p-2">
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseModal} className="border-gaming-cyan/30 text-gaming-cyan">Hủy</Button>
                  <Button type="submit" className="bg-gradient-to-r from-gaming-cyan to-gaming-purple hover:from-gaming-cyan/80 hover:to-gaming-purple/80">Lưu</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filter Modal */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gaming-dark p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Bộ lọc nâng cao</h2>
              <form onSubmit={handleFilterSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Cấp độ</label>
                  <select name="level" value={filterData.level} onChange={handleFilterChange} className="mt-1 w-full bg-gaming-darker border-gaming-cyan/30 text-white rounded-md p-2">
                    <option value="">Tất cả</option>
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Trạng thái</label>
                  <select name="status" value={filterData.status} onChange={handleFilterChange} className="mt-1 w-full bg-gaming-darker border-gaming-cyan/30 text-white rounded-md p-2">
                    <option value="">Tất cả</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="vip">VIP</option>
                    <option value="blocked">Đã khóa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Khoảng thời gian</label>
                  <div className="flex gap-2">
                    <Input name="startDate" type="date" value={filterData.startDate} onChange={handleFilterChange} className="mt-1 bg-gaming-darker border-gaming-cyan/30 text-white" />
                    <Input name="endDate" type="date" value={filterData.endDate} onChange={handleFilterChange} className="mt-1 bg-gaming-darker border-gaming-cyan/30 text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Tổng chi tiêu</label>
                  <div className="flex gap-2">
                    <Input name="minSpent" type="number" placeholder="Min" value={filterData.minSpent} onChange={handleFilterChange} className="mt-1 bg-gaming-darker border-gaming-cyan/30 text-white" />
                    <Input name="maxSpent" type="number" placeholder="Max" value={filterData.maxSpent} onChange={handleFilterChange} className="mt-1 bg-gaming-darker border-gaming-cyan/30 text-white" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseFilterModal} className="border-gaming-cyan/30 text-gaming-cyan">Hủy</Button>
                  <Button type="submit" className="bg-gradient-to-r from-gaming-cyan to-gaming-purple hover:from-gaming-cyan/80 hover:to-gaming-purple/80">Áp dụng</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {isDetailModalOpen && selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gaming-dark p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">Chi tiết khách hàng</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-gaming-cyan to-gaming-purple rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{selectedCustomer.name}</p>
                    <p className="text-sm text-gray-400">ID: #{selectedCustomer.id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Email</p>
                    <p className="text-white">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Số điện thoại</p>
                    <p className="text-white">{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Địa chỉ</p>
                    <p className="text-white">{selectedCustomer.address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Số đơn hàng</p>
                    <p className="text-white">{orderCount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Tổng chi tiêu</p>
                    <p className="text-white">₫{totalSpent.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Hạng</p>
                    <Badge className="bg-gaming-purple text-white">
                      {getCustomerLevel(totalSpent)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Trạng thái</p>
                    {getStatusBadge(selectedCustomer.isActive)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Ngày tham gia</p>
                    <p className="text-white">{joinDate ? new Date(joinDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Đơn hàng cuối</p>
                    <p className="text-white">
                      {lastOrder ? (
                        <>
                          <span className="font-bold text-gaming-cyan">{lastOrder.id}</span> - {lastOrder.createdAt ? new Date(lastOrder.createdAt).toLocaleDateString('vi-VN') : ''}
                        </>
                      ) : 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Lịch sử đơn hàng</p>
                  <div className="mt-2 bg-gaming-darker p-4 rounded-md max-h-60 overflow-y-auto order-history-scrollbar">
                    {loadingOrders ? (
                      <p className="text-gray-300">Đang tải...</p>
                    ) : customerOrders.length === 0 ? (
                    <p className="text-gray-300">Chưa có lịch sử đơn hàng.</p>
                    ) : (
                      <table className="min-w-full text-sm text-left text-gray-300">
                        <thead>
                          <tr>
                            <th className="px-2 py-1">Mã đơn</th>
                            <th className="px-2 py-1">Ngày tạo</th>
                            <th className="px-2 py-1">Tổng tiền</th>
                            <th className="px-2 py-1">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customerOrders.map(order => (
                            <tr key={order.id} className="border-b border-gaming-cyan/10">
                              <td className="px-2 py-1 font-bold text-gaming-cyan">{order.id}</td>
                              <td className="px-2 py-1">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                              <td className="px-2 py-1">₫{order.total?.toLocaleString() || '0'}</td>
                              <td className="px-2 py-1">{order.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button onClick={handleOpenEmailModal} className="bg-gradient-to-r from-gaming-cyan to-gaming-purple hover:from-gaming-cyan/80 hover:to-gaming-purple/80 transition-all duration-300">
                    Gửi Email
                  </Button>
                  <Button onClick={handleCloseDetailModal} className="bg-gaming-red hover:bg-gaming-red/80 text-white transition-all duration-300">
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Modal */}
        {isEmailModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gaming-dark p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Gửi Email</h2>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Tiêu đề</label>
                  <Input name="subject" value={emailData.subject} onChange={handleEmailChange} className="mt-1 bg-gaming-darker border-gaming-cyan/30 text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Nội dung</label>
                  <textarea name="message" value={emailData.message} onChange={handleEmailChange} className="mt-1 w-full bg-gaming-darker border-gaming-cyan/30 text-white rounded-md p-2" rows={5} required />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseEmailModal} className="border-gaming-cyan/30 text-gaming-cyan">Hủy</Button>
                  <Button type="submit" className="bg-gradient-to-r from-gaming-cyan to-gaming-purple hover:from-gaming-cyan/80 hover:to-gaming-purple/80">Gửi</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Chatbot Modal */}
        {isChatbotModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gaming-dark p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Chatbot</h2>
              <form onSubmit={handleChatbotSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Tin nhắn</label>
                  <textarea name="message" value={chatbotData.message} onChange={handleChatbotChange} className="mt-1 w-full bg-gaming-darker border-gaming-cyan/30 text-white rounded-md p-2" rows={5} required />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseChatbotModal} className="border-gaming-cyan/30 text-gaming-cyan">Hủy</Button>
                  <Button type="submit" className="bg-gradient-to-r from-gaming-cyan to-gaming-purple hover:from-gaming-cyan/80 hover:to-gaming-purple/80">Gửi</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Note Modal */}
        {isNoteModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gaming-dark p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Ghi chú</h2>
              <form onSubmit={handleNoteSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Ghi chú</label>
                  <textarea name="note" value={noteData.note} onChange={handleNoteChange} className="mt-1 w-full bg-gaming-darker border-gaming-cyan/30 text-white rounded-md p-2" rows={5} required />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseNoteModal} className="border-gaming-cyan/30 text-gaming-cyan">Hủy</Button>
                  <Button type="submit" className="bg-gradient-to-r from-gaming-cyan to-gaming-purple hover:from-gaming-cyan/80 hover:to-gaming-purple/80">Lưu</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && editCustomer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gaming-dark p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Chỉnh sửa khách hàng</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Tên</label>
                  <Input name="name" value={formData.name} onChange={handleInputChange} className="mt-1 bg-gaming-darker border-gaming-cyan/30 text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Email</label>
                  <Input name="email" type="email" value={formData.email} onChange={handleInputChange} className="mt-1 bg-gaming-darker border-gaming-cyan/30 text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Số điện thoại</label>
                  <Input name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 bg-gaming-darker border-gaming-cyan/30 text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Địa chỉ</label>
                  <Input name="address" value={formData.address} onChange={handleInputChange} className="mt-1 bg-gaming-darker border-gaming-cyan/30 text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Trạng thái</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="mt-1 w-full bg-gaming-darker border-gaming-cyan/30 text-white rounded-md p-2">
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="vip">VIP</option>
                    <option value="blocked">Đã khóa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Cấp độ</label>
                  <select name="level" value={formData.level} onChange={handleInputChange} className="mt-1 w-full bg-gaming-darker border-gaming-cyan/30 text-white rounded-md p-2">
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseEditModal} className="border-gaming-cyan/30 text-gaming-cyan">Hủy</Button>
                  <Button type="submit" className="bg-gradient-to-r from-gaming-cyan to-gaming-purple hover:from-gaming-cyan/80 hover:to-gaming-purple/80">Lưu</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lock Modal */}
        {isLockModalOpen && lockCustomer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gaming-dark p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Xác nhận khóa khách hàng</h2>
              <p className="text-gray-300 mb-6">Bạn có chắc chắn muốn khóa khách hàng <span className="font-bold text-white">{lockCustomer.name}</span>?</p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseLockModal} className="border-gaming-cyan/30 text-gaming-cyan">Hủy</Button>
                <Button type="button" className="bg-gaming-red hover:bg-gaming-red/80 text-white" onClick={handleLockCustomer}>Khóa</Button>
              </div>
            </div>
          </div>
        )}

        {/* Unlock Modal */}
        {isUnlockModalOpen && unlockCustomer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gaming-dark p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Xác nhận mở khóa khách hàng</h2>
              <p className="text-gray-300 mb-6">Bạn có chắc chắn muốn mở khóa khách hàng <span className="font-bold text-white">{unlockCustomer.name}</span>?</p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseUnlockModal} className="border-gaming-cyan/30 text-gaming-cyan">Hủy</Button>
                <Button type="button" className="bg-gaming-green hover:bg-gaming-green/80 text-white" onClick={handleUnlockCustomer}>Mở khóa</Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .order-history-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .order-history-scrollbar::-webkit-scrollbar-thumb {
          background: #00fff7;
          border-radius: 8px;
        }
        .order-history-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </AdminLayout>
  );
};

export default CustomerManagement;
