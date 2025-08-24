
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
  Edit,
  Trash2,
  Eye,
  FileText,
  Image,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { BannerModal } from '@/components/modals/BannerModal';
import { Banner, CreateBannerRequest, UpdateBannerRequest } from '@/models/Banner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";



const articles = [
  {
    id: 'BV001',
    title: 'Top 10 bàn phím cơ tốt nhất 2024',
    category: 'Hướng dẫn',
    author: 'Admin',
    status: 'published',
    publishDate: '2024-05-20',
    views: 2345
  },
  {
    id: 'BV002',
    title: 'Cách chọn mô hình Anime phù hợp',
    category: 'Tin tức',
    author: 'Editor',
    status: 'draft',
    publishDate: '2024-05-22',
    views: 0
  }
];

export const ContentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | undefined>();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch banners
  useEffect(() => {
    fetchBanners();
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.filter-dropdown')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset về trang 1 khi thay đổi tìm kiếm hoặc bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, positionFilter]);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/banners');
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBanner = async (data: CreateBannerRequest) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        await fetchBanners();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating banner:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBanner = async (data: UpdateBannerRequest) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/banners/${data._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        await fetchBanners();
        setIsModalOpen(false);
        setEditingBanner(undefined);
      }
    } catch (error) {
      console.error('Error updating banner:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa banner này?')) {
      try {
        const response = await fetch(`/api/banners/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchBanners();
        }
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    }
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingBanner(undefined);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openViewModal = (banner: Banner) => {
    setEditingBanner(banner);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(undefined);
    setModalMode('create');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'published':
        return <Badge className="bg-gaming-green text-black">Đã xuất bản</Badge>;
      case 'draft':
        return <Badge className="bg-gaming-gold text-black">Bản nháp</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Không hoạt động</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gaming-cyan">
              Quản lý Nội dung
            </h1>
            <p className="text-gray-400 mt-1">
              Quản lý banner, bài viết và nội dung website
            </p>
          </div>
        </div>



        <div className="space-y-6">
            {/* Banner Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Quản lý Banner</h2>
            </div>

            {/* Banner Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Tổng banner</p>
                      <p className="text-2xl font-bold text-white mt-1">{banners.length}</p>
                    </div>
                    <Image className="w-8 h-8 text-gaming-cyan" />
                  </div>
                </CardContent>
              </Card>
              <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Đang hoạt động</p>
                      <p className="text-2xl font-bold text-white mt-1">{banners.filter(b => b.status === 'active').length}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-gaming-green" />
                  </div>
                </CardContent>
              </Card>
              <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Tổng lượt xem</p>
                      <p className="text-2xl font-bold text-white mt-1">{banners.reduce((sum, b) => sum + b.views, 0).toLocaleString()}</p>
                    </div>
                    <Eye className="w-8 h-8 text-gaming-purple" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add Banner Button */}
            <div className="flex justify-end">
              <Button 
                onClick={openCreateModal}
                className="bg-gaming-cyan hover:bg-gaming-cyan/80 text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm banner mới
              </Button>
            </div>

            {/* Banner Table */}
            <Card className="bg-gaming-dark border-gaming-cyan/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Danh sách Banner [{banners.length}]</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Tìm kiếm banner..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gaming-darker border-gaming-cyan/30 text-white w-64"
                      />
                    </div>
                    <div className="relative filter-dropdown">
                      <Button 
                        variant="outline" 
                        className="border-gaming-cyan/30 text-gaming-cyan"
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      >
                      <Filter className="w-4 h-4 mr-2" />
                      Bộ lọc
                    </Button>
                      
                      {showFilterDropdown && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-gaming-darker border border-gaming-cyan/30 rounded-lg shadow-lg z-10 filter-dropdown">
                          <div className="p-3">
                            <h4 className="text-white text-sm font-medium mb-2">Lọc theo vị trí</h4>
                            <div className="space-y-2">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="positionFilter"
                                  value="all"
                                  checked={positionFilter === 'all'}
                                  onChange={(e) => setPositionFilter(e.target.value)}
                                  className="text-gaming-cyan"
                                />
                                <span className="text-gray-300 text-sm">Tất cả</span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="positionFilter"
                                  value="hero"
                                  checked={positionFilter === 'hero'}
                                  onChange={(e) => setPositionFilter(e.target.value)}
                                  className="text-gaming-cyan"
                                />
                                <span className="text-gray-300 text-sm">Trang chủ - Hero</span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="positionFilter"
                                  value="promotion"
                                  checked={positionFilter === 'promotion'}
                                  onChange={(e) => setPositionFilter(e.target.value)}
                                  className="text-gaming-cyan"
                                />
                                <span className="text-gray-300 text-sm">Trang chủ - Khuyến mãi</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gaming-cyan/20 border-t border-gaming-cyan/20">
                      <TableHead className="text-gaming-cyan">Banner</TableHead>
                      <TableHead className="text-gaming-cyan">Vị trí</TableHead>
                      <TableHead className="text-gaming-cyan">Thời gian</TableHead>
                      <TableHead className="text-gaming-cyan">Lượt xem</TableHead>
                      <TableHead className="text-gaming-cyan">Trạng thái</TableHead>
                      <TableHead className="text-gaming-cyan">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                          Đang tải...
                        </TableCell>
                      </TableRow>
                    ) : banners.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                          Chưa có banner nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      banners
                        .filter(banner => {
                          // Lọc theo tìm kiếm
                          const matchesSearch = banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            banner.description?.toLowerCase().includes(searchTerm.toLowerCase());
                          
                          // Lọc theo vị trí
                          const matchesPosition = positionFilter === 'all' || banner.position === positionFilter;
                          
                          return matchesSearch && matchesPosition;
                        })
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((banner) => (
                          <TableRow key={banner._id} className="border-gaming-cyan/10 hover:bg-gaming-cyan/5">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                                <div className="w-16 h-12 bg-gaming-darker rounded-lg flex items-center justify-center overflow-hidden">
                                  {banner.imageUrl ? (
                                    <img 
                                      src={banner.imageUrl} 
                                      alt={banner.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                              <Image className="w-6 h-6 text-gaming-cyan" />
                                  )}
                            </div>
                            <div>
                              <p className="font-medium text-white">{banner.title}</p>
                                  <p className="text-sm text-gray-400">ID: #{banner._id}</p>
                            </div>
                          </div>
                        </TableCell>
                            <TableCell className="text-gray-300">
                              {banner.position === 'hero' ? 'Trang chủ - Hero' :
                               banner.position === 'promotion' ? 'Trang chủ - Khuyến mãi' :
                               banner.position === 'sidebar' ? 'Sidebar' :
                               banner.position === 'category' ? 'Danh mục' : banner.position}
                            </TableCell>
                        <TableCell>
                          <div className="text-gray-300 text-sm">
                                <div>{new Date(banner.startDate).toLocaleDateString('vi-VN')}</div>
                                <div>{new Date(banner.endDate).toLocaleDateString('vi-VN')}</div>
                          </div>
                        </TableCell>
                            <TableCell className="text-white font-medium">{banner.views.toLocaleString()}</TableCell>
                        <TableCell>
                          {getStatusBadge(banner.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gaming-cyan hover:bg-gaming-cyan/20"
                              onClick={() => openViewModal(banner)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-gaming-purple hover:bg-gaming-purple/20"
                                  onClick={() => openEditModal(banner)}
                                >
                              <Edit className="w-4 h-4" />
                            </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-gaming-red hover:bg-gaming-red/20"
                                  onClick={() => handleDeleteBanner(banner._id!)}
                                >
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

            {/* Pagination */}
            {(() => {
              const filteredBanners = banners.filter(banner => {
                const matchesSearch = banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  banner.description?.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesPosition = positionFilter === 'all' || banner.position === positionFilter;
                return matchesSearch && matchesPosition;
              });
              
              const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);
              
              // Luôn hiển thị phân trang nếu có dữ liệu
              if (filteredBanners.length > 0) {
                return (
                  <Card className="bg-gaming-dark border-gaming-cyan/20">
                    <CardContent className="p-4">
            <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredBanners.length)} trong tổng số {filteredBanners.length} banner
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="border-gaming-cyan/30 text-gaming-cyan hover:bg-gaming-cyan/20"
                          >
                            Trước
              </Button>
                          
                          <div className="flex space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={
                                  currentPage === page
                                    ? "bg-gaming-cyan text-black hover:bg-gaming-cyan/80"
                                    : "border-gaming-cyan/30 text-gaming-cyan hover:bg-gaming-cyan/20"
                                }
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="border-gaming-cyan/30 text-gaming-cyan hover:bg-gaming-cyan/20"
                          >
                            Sau
                            </Button>
                          </div>
                      </div>
              </CardContent>
            </Card>
                );
              }
              return null;
            })()}
            </div>

        {/* Banner Modal */}
        <BannerModal
          isOpen={isModalOpen}
          onClose={closeModal}
          banner={editingBanner}
          onSubmit={editingBanner ? handleUpdateBanner : handleCreateBanner}
          isLoading={isSubmitting}
          mode={modalMode}
        />
      </div>
    </AdminLayout>
  );
};

export default ContentManagement;
