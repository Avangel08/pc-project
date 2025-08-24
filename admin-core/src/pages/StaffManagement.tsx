
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  Search, 
  Filter, 
  Eye,
  Edit,
  Trash2,
  User,
  Shield,
  Lock,
  Unlock,
  Activity
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Định nghĩa interface cho Staff
interface Staff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  joinDate?: string;
  lastLogin?: string;
  status: string;
  createdAt?: string;
}

export const StaffManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch dữ liệu thực tế từ API
  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/staff');
        if (!response.ok) {
          throw new Error('Failed to fetch staff data');
        }
        const data = await response.json();
        setStaff(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching staff:', err);
        setError('Không thể tải dữ liệu nhân viên');
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // Tính toán thống kê từ dữ liệu thực
  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.status === 'active').length;
  const adminStaff = staff.filter(s => s.role === 'admin').length;
  const onlineStaff = staff.filter(s => {
    if (!s.lastLogin) return false;
    const lastLogin = new Date(s.lastLogin);
    const now = new Date();
    const diffHours = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
    return diffHours < 1; // Online trong 1 giờ qua
  }).length;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-gaming-red text-white">Quản trị viên</Badge>;
      case 'sales':
        return <Badge className="bg-gaming-cyan text-black">Bán hàng</Badge>;
      case 'warehouse':
        return <Badge className="bg-gaming-purple text-white">Kho vận</Badge>;
      case 'support':
        return <Badge className="bg-gaming-green text-black">CSKH</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-gaming-green text-black">Hoạt động</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Không hoạt động</Badge>;
      case 'locked':
        return <Badge variant="destructive">Đã khóa</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-gaming-red" />;
      case 'sales':
        return <User className="w-4 h-4 text-gaming-cyan" />;
      case 'warehouse':
        return <User className="w-4 h-4 text-gaming-purple" />;
      case 'support':
        return <User className="w-4 h-4 text-gaming-green" />;
      default:
        return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-orbitron font-bold text-gradient">
              Quản lý Nhân viên
            </h1>
            <p className="text-gray-400 mt-1">
              Quản lý tài khoản và phân quyền nhân viên
            </p>
          </div>
          <Button className="bg-gradient-to-r from-gaming-cyan to-gaming-purple hover:from-gaming-cyan/80 hover:to-gaming-purple/80">
            <Plus className="w-4 h-4 mr-2" />
            Thêm nhân viên mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Tổng nhân viên</p>
                  <p className="text-2xl font-bold text-white mt-1">{totalStaff}</p>
                </div>
                <User className="w-8 h-8 text-gaming-cyan" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Đang hoạt động</p>
                  <p className="text-2xl font-bold text-white mt-1">{activeStaff}</p>
                </div>
                <Activity className="w-8 h-8 text-gaming-green" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Quản trị viên</p>
                  <p className="text-2xl font-bold text-white mt-1">{adminStaff}</p>
                </div>
                <Shield className="w-8 h-8 text-gaming-red" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Online hiện tại</p>
                  <p className="text-2xl font-bold text-white mt-1">{onlineStaff}</p>
                </div>
                <Activity className="w-8 h-8 text-gaming-purple" />
              </div>
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
                    placeholder="Tìm kiếm nhân viên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gaming-darker border-gaming-cyan/30 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-gaming-cyan/30 text-gaming-cyan">
                  <Filter className="w-4 h-4 mr-2" />
                  Bộ lọc
                </Button>
                <Button variant="outline" className="border-gaming-cyan/30 text-gaming-cyan">
                  Phân quyền
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Table */}
        <Card className="bg-gaming-dark border-gaming-cyan/20">
          <CardHeader>
            <CardTitle className="text-white font-orbitron">Danh sách nhân viên</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gaming-cyan/20">
                  <TableHead className="text-gaming-cyan">Nhân viên</TableHead>
                  <TableHead className="text-gaming-cyan">Liên hệ</TableHead>
                  <TableHead className="text-gaming-cyan">Chức vụ</TableHead>
                  <TableHead className="text-gaming-cyan">Phòng ban</TableHead>
                  <TableHead className="text-gaming-cyan">Tham gia</TableHead>
                  <TableHead className="text-gaming-cyan">Đăng nhập cuối</TableHead>
                  <TableHead className="text-gaming-cyan">Trạng thái</TableHead>
                  <TableHead className="text-gaming-cyan">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <p className="text-gray-400">Đang tải dữ liệu...</p>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-red-400">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-400">
                      Không tìm thấy nhân viên nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  staff.map((member) => (
                    <TableRow key={member.id} className="border-gaming-cyan/10 hover:bg-gaming-cyan/5">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gaming-darker rounded-lg flex items-center justify-center">
                            {getRoleIcon(member.role)}
                          </div>
                          <div>
                            <p className="font-medium text-white">{member.name}</p>
                            <p className="text-sm text-gray-400">ID: #{member.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-gray-300 text-sm">{member.email}</p>
                          <p className="text-gray-300 text-sm">{member.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(member.role)}
                      </TableCell>
                      <TableCell className="text-gray-300">{member.department}</TableCell>
                      <TableCell className="text-gray-300">{member.joinDate}</TableCell>
                      <TableCell className="text-gray-300 text-sm">{member.lastLogin}</TableCell>
                      <TableCell>
                        {getStatusBadge(member.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-gaming-cyan hover:bg-gaming-cyan/20">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gaming-purple hover:bg-gaming-purple/20">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gaming-gold hover:bg-gaming-gold/20">
                            <Lock className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gaming-red hover:bg-gaming-red/20">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default StaffManagement;
