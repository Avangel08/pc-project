
import React, { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  Search, 
  Filter, 
  Edit,
  Trash2,
  Percent,
  Tag,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

// Định nghĩa type Promotion phù hợp với backend
interface Promotion {
  id: string;
  name: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  usage: number;
  limit: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'scheduled' | 'paused';
}

export const PromotionManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState<Partial<Promotion>>({});

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3001/api/promotions')
      .then(res => res.json())
      .then((data: Promotion[]) => {
        setPromotions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-gaming-green text-black">Đang hoạt động</Badge>;
      case 'expired':
        return <Badge variant="secondary">Đã hết hạn</Badge>;
      case 'scheduled':
        return <Badge className="bg-gaming-gold text-black">Đã lên lịch</Badge>;
      case 'paused':
        return <Badge className="bg-gaming-red text-white">Đã tạm dừng</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-4 h-4 text-gaming-green" />;
      case 'fixed':
        return <Tag className="w-4 h-4 text-gaming-cyan" />;
      default:
        return <Tag className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatValue = (type: string, value: number) => {
    if (type === 'percentage') {
      return `${value}%`;
    }
    return `₫${value.toLocaleString()}`;
  };

  // Modal open/close logic
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      code: '',
      type: 'percentage',
      value: 0,
      usage: 0,
      limit: 100,
      startDate: '',
      endDate: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };
  const openEditModal = (promo: Promotion) => {
    setModalMode('edit');
    setSelectedPromotion(promo);
    setFormData({ ...promo });
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPromotion(null);
  };

  // Xử lý submit form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.type || !formData.value || !formData.startDate || !formData.endDate) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập đầy đủ thông tin', variant: 'destructive' });
      return;
    }
    try {
      if (modalMode === 'create') {
        const res = await fetch('http://localhost:3001/api/promotions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          toast({ title: 'Thành công', description: 'Đã tạo khuyến mãi mới!' });
          setIsModalOpen(false);
          reloadPromotions();
        } else {
          const data = await res.json();
          toast({ title: 'Lỗi', description: data.error || 'Tạo khuyến mãi thất bại', variant: 'destructive' });
        }
      } else if (modalMode === 'edit' && selectedPromotion) {
        const res = await fetch(`http://localhost:3001/api/promotions/${selectedPromotion.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          toast({ title: 'Thành công', description: 'Đã cập nhật khuyến mãi!' });
          setIsModalOpen(false);
          reloadPromotions();
        } else {
          const data = await res.json();
          toast({ title: 'Lỗi', description: data.error || 'Cập nhật thất bại', variant: 'destructive' });
        }
      }
    } catch (err) {
      toast({ title: 'Lỗi', description: 'Có lỗi khi gửi dữ liệu', variant: 'destructive' });
    }
  };

  // Xử lý xóa
  const handleDelete = async () => {
    if (!promotionToDelete) return;
    try {
      const res = await fetch(`http://localhost:3001/api/promotions/${promotionToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Thành công', description: 'Đã xóa khuyến mãi!' });
        setIsDeleteDialogOpen(false);
        reloadPromotions();
      } else {
        const data = await res.json();
        toast({ title: 'Lỗi', description: data.error || 'Xóa thất bại', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Lỗi', description: 'Có lỗi khi xóa', variant: 'destructive' });
    }
  };

  // Reload danh sách
  const reloadPromotions = () => {
    setLoading(true);
    fetch('http://localhost:3001/api/promotions')
      .then(res => res.json())
      .then((data: Promotion[]) => {
        setPromotions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: '#00fff7' }}>Quản lý Khuyến mãi</h1>
            <p className="text-gray-400 mt-1">
              Tạo và quản lý chương trình khuyến mãi
            </p>
          </div>
          <Button className="bg-gradient-to-r from-gaming-cyan to-gaming-purple hover:from-gaming-cyan/80 hover:to-gaming-purple/80" onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo khuyến mãi mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Đang hoạt động</p>
                  <p className="text-2xl font-bold text-white mt-1">8</p>
                </div>
                <TrendingUp className="w-8 h-8 text-gaming-green" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Tổng lượt sử dụng</p>
                  <p className="text-2xl font-bold text-white mt-1">2,456</p>
                </div>
                <Users className="w-8 h-8 text-gaming-cyan" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Tiết kiệm KH</p>
                  <p className="text-2xl font-bold text-white mt-1">45.6M</p>
                </div>
                <Tag className="w-8 h-8 text-gaming-gold" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Tỷ lệ chuyển đổi</p>
                  <p className="text-2xl font-bold text-white mt-1">12.8%</p>
                </div>
                <Percent className="w-8 h-8 text-gaming-purple" />
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
                    placeholder="Tìm kiếm khuyến mãi..."
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
                  <Calendar className="w-4 h-4 mr-2" />
                  Lịch trình
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Promotions Table */}
        <Card className="bg-gaming-dark border-gaming-cyan/20">
          <CardHeader>
            <CardTitle className="text-white">Danh sách khuyến mãi</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-gray-400 py-8">Đang tải danh sách khuyến mãi...</div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gaming-cyan/20">
                  <TableHead className="text-gaming-cyan">Chương trình</TableHead>
                  <TableHead className="text-gaming-cyan">Mã giảm giá</TableHead>
                  <TableHead className="text-gaming-cyan">Giá trị</TableHead>
                  <TableHead className="text-gaming-cyan">Sử dụng</TableHead>
                  <TableHead className="text-gaming-cyan">Thời gian</TableHead>
                  <TableHead className="text-gaming-cyan">Trạng thái</TableHead>
                  <TableHead className="text-gaming-cyan">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promotion) => (
                  <TableRow key={promotion.id} className="border-gaming-cyan/10 hover:bg-gaming-cyan/5">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gaming-darker rounded-lg flex items-center justify-center">
                          {getPromotionIcon(promotion.type)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{promotion.name}</p>
                          <p className="text-sm text-gray-400">ID: #{promotion.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-gaming-darker px-2 py-1 rounded text-gaming-cyan font-mono">
                        {promotion.code}
                      </code>
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {formatValue(promotion.type, promotion.value)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          {promotion.usage}/{promotion.limit}
                        </span>
                        <div className="w-16 bg-gaming-darker rounded-full h-2 mt-1">
                          <div 
                            className="bg-gaming-cyan h-2 rounded-full" 
                            style={{ width: `${(promotion.usage / promotion.limit) * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-300 text-sm">
                        <div>{promotion.startDate ? new Date(promotion.startDate).toLocaleDateString('vi-VN') : ''}</div>
                        <div>{promotion.endDate ? new Date(promotion.endDate).toLocaleDateString('vi-VN') : ''}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(promotion.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-gaming-purple hover:bg-gaming-purple/20" onClick={() => openEditModal(promotion)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gaming-red hover:bg-gaming-red/20" onClick={() => { setPromotionToDelete(promotion); setIsDeleteDialogOpen(true); }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>

        {/* Modal Thêm/Sửa khuyến mãi */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{modalMode === 'create' ? 'Tạo khuyến mãi mới' : 'Chỉnh sửa khuyến mãi'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Input placeholder="Tên chương trình" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              <Input placeholder="Mã giảm giá (code)" value={formData.code || ''} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
              <div className="flex gap-2">
                <Select value={formData.type || 'percentage'} onValueChange={val => setFormData({ ...formData, type: val as 'percentage' | 'fixed' })}>
                  <SelectTrigger className="w-1/2">
                    <SelectValue placeholder="Loại khuyến mãi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                    <SelectItem value="fixed">Số tiền cố định</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" min={0} placeholder="Giá trị" value={formData.value || 0} onChange={e => setFormData({ ...formData, value: Number(e.target.value) })} className="w-1/2" />
              </div>
              <div className="flex gap-2">
                <Input type="number" min={1} placeholder="Giới hạn lượt dùng" value={formData.limit || 100} onChange={e => setFormData({ ...formData, limit: Number(e.target.value) })} className="w-1/2" />
                <Select value={formData.status || 'active'} onValueChange={val => setFormData({ ...formData, status: val as Promotion['status'] })}>
                  <SelectTrigger className="w-1/2">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                    <SelectItem value="paused">Tạm dừng</SelectItem>
                    <SelectItem value="expired">Đã hết hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Input type="date" value={formData.startDate ? format(new Date(formData.startDate), 'yyyy-MM-dd') : ''} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-1/2" />
                <Input type="date" value={formData.endDate ? format(new Date(formData.endDate), 'yyyy-MM-dd') : ''} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-1/2" />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-gradient-to-r from-gaming-cyan to-gaming-purple text-black font-bold">
                  {modalMode === 'create' ? 'Tạo mới' : 'Cập nhật'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog xác nhận xóa */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Xác nhận xóa khuyến mãi</DialogTitle>
            </DialogHeader>
            <div>Bạn có chắc chắn muốn xóa khuyến mãi <b>{promotionToDelete?.name}</b>?</div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
              <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default PromotionManagement;
