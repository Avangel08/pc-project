
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
  Trash2,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Check,
  X,
  AlertTriangle
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  date: string;
  status: 'approved' | 'pending' | 'flagged' | 'rejected';
  helpful: number;
  reported?: boolean;
  reportReason?: string;
}

// Dữ liệu mẫu sẽ được thay thế bằng dữ liệu thực từ API

export const ReviewManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Fetch reviews
  useEffect(() => {
    fetchReviews();
  }, []);

  // Reset về trang 1 khi thay đổi tìm kiếm hoặc bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, ratingFilter]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-gaming-green text-black">Đã duyệt</Badge>;
      case 'pending':
        return <Badge className="bg-gaming-gold text-black">Chờ duyệt</Badge>;
      case 'flagged':
        return <Badge variant="destructive">Bị báo cáo</Badge>;
      case 'rejected':
        return <Badge variant="secondary">Đã từ chối</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-gaming-gold fill-current' 
            : 'text-gray-400'
        }`}
      />
    ));
  };

  const handleApproveReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      });
      
      if (response.ok) {
        await fetchReviews();
      }
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      });
      
      if (response.ok) {
        await fetchReviews();
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        const response = await fetch(`/api/reviews/${reviewId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchReviews();
        }
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const openViewModal = (review: Review) => {
    setSelectedReview(review);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedReview(null);
  };

  // Lọc và phân trang dữ liệu
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      (review.productId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (review.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (review.comment?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    
    const matchesRating = ratingFilter === 'all' || 
      (ratingFilter === '5' && review.rating === 5) ||
      (ratingFilter === '4' && review.rating === 4) ||
      (ratingFilter === '3' && review.rating === 3) ||
      (ratingFilter === '2' && review.rating === 2) ||
      (ratingFilter === '1' && review.rating === 1);
    
    return matchesSearch && matchesStatus && matchesRating;
  });

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Tính toán thống kê
  const totalReviews = reviews.length;
  const pendingReviews = reviews.filter(r => r.status === 'pending').length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';
  const flaggedReviews = reviews.filter(r => r.status === 'flagged').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gaming-cyan">
              Quản lý Đánh giá & Bình luận
            </h1>
            <p className="text-gray-400 mt-1">
              Duyệt và quản lý đánh giá sản phẩm từ khách hàng
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Tổng đánh giá</p>
                  <p className="text-2xl font-bold text-white mt-1">{totalReviews}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-gaming-cyan" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Chờ duyệt</p>
                  <p className="text-2xl font-bold text-white mt-1">{pendingReviews}</p>
                </div>
                <Eye className="w-8 h-8 text-gaming-gold" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Đánh giá trung bình</p>
                  <p className="text-2xl font-bold text-white mt-1">{averageRating}</p>
                </div>
                <Star className="w-8 h-8 text-gaming-gold" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Bị báo cáo</p>
                  <p className="text-2xl font-bold text-white mt-1">{flaggedReviews}</p>
                </div>
                <ThumbsDown className="w-8 h-8 text-gaming-red" />
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
                    placeholder="Tìm kiếm đánh giá..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gaming-darker border-gaming-cyan/30 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
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
                    <div className="absolute top-full right-0 mt-2 w-64 bg-gaming-darker border border-gaming-cyan/30 rounded-lg shadow-lg z-10 filter-dropdown">
                      <div className="p-4 space-y-4">
                        <div>
                          <h4 className="text-white text-sm font-medium mb-2">Trạng thái</h4>
                          <div className="space-y-2">
                            {['all', 'pending', 'approved', 'flagged', 'rejected'].map(status => (
                              <label key={status} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="statusFilter"
                                  value={status}
                                  checked={statusFilter === status}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStatusFilter(e.target.value)}
                                  className="text-gaming-cyan"
                                />
                                <span className="text-gray-300 text-sm">
                                  {status === 'all' ? 'Tất cả' :
                                   status === 'pending' ? 'Chờ duyệt' :
                                   status === 'approved' ? 'Đã duyệt' :
                                   status === 'flagged' ? 'Bị báo cáo' : 'Đã từ chối'}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-white text-sm font-medium mb-2">Số sao</h4>
                          <div className="space-y-2">
                            {['all', '5', '4', '3', '2', '1'].map(rating => (
                              <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="ratingFilter"
                                  value={rating}
                                  checked={ratingFilter === rating}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRatingFilter(e.target.value)}
                                  className="text-gaming-cyan"
                                />
                                <span className="text-gray-300 text-sm">
                                  {rating === 'all' ? 'Tất cả' : `${rating} sao`}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="border-gaming-cyan/30 text-gaming-cyan">
                  Xuất báo cáo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Table */}
        <Card className="bg-gaming-dark border-gaming-cyan/20">
          <CardHeader>
            <CardTitle className="text-white">Danh sách đánh giá [{filteredReviews.length}]</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gaming-cyan/20 border-t border-gaming-cyan/20">
                  <TableHead className="text-gaming-cyan">Sản phẩm</TableHead>
                  <TableHead className="text-gaming-cyan">Khách hàng</TableHead>
                  <TableHead className="text-gaming-cyan">Đánh giá</TableHead>
                  <TableHead className="text-gaming-cyan">Nội dung</TableHead>
                  <TableHead className="text-gaming-cyan">Ngày</TableHead>
                  <TableHead className="text-gaming-cyan">Hữu ích</TableHead>
                  <TableHead className="text-gaming-cyan">Trạng thái</TableHead>
                  <TableHead className="text-gaming-cyan">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
                                <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gaming-cyan"></div>
                            <span>Đang tải...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginatedReviews.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                          Không tìm thấy đánh giá nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedReviews.map((review) => (
                    <TableRow key={review.id} className="border-gaming-cyan/10 hover:bg-gaming-cyan/5">
                                          <TableCell>
                      <div>
                        <p className="font-medium text-white">Sản phẩm #{review.productId}</p>
                        <p className="text-sm text-gray-400">ID: {review.productId}</p>
                      </div>
                    </TableCell>
                      <TableCell className="text-gray-300">{review.customerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-white font-medium">{review.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-gray-300 truncate">{review.comment}</p>
                      </TableCell>
                      <TableCell className="text-gray-300">{review.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="w-4 h-4 text-gaming-green" />
                          <span className="text-white">{review.helpful}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(review.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gaming-cyan hover:bg-gaming-cyan/20"
                            onClick={() => openViewModal(review)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {review.status === 'pending' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-gaming-green hover:bg-gaming-green/20"
                                onClick={() => handleApproveReview(review.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-gaming-red hover:bg-gaming-red/20"
                                onClick={() => handleRejectReview(review.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gaming-red hover:bg-gaming-red/20"
                            onClick={() => handleDeleteReview(review.id)}
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
          if (totalPages > 1) {
            return (
              <Card className="bg-gaming-dark border-gaming-cyan/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredReviews.length)} trong tổng số {filteredReviews.length} đánh giá
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

        {/* Review Detail Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="bg-gaming-dark border-gaming-cyan/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Chi tiết đánh giá</DialogTitle>
            </DialogHeader>
            {selectedReview && (
              <div className="space-y-6">
                {/* Product Info */}
                <div className="flex items-start space-x-4 p-4 bg-gaming-darker rounded-lg">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-gaming-cyan" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">Sản phẩm #{selectedReview.productId}</h3>
                    <p className="text-gray-400 text-sm">ID: {selectedReview.productId}</p>
                    <div className="flex items-center space-x-1 mt-2">
                      {renderStars(selectedReview.rating)}
                      <span className="ml-2 text-white font-medium">{selectedReview.rating}/5</span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="p-4 bg-gaming-darker rounded-lg">
                  <h4 className="text-white font-medium mb-2">Thông tin khách hàng</h4>
                  <p className="text-gray-300">Tên: {selectedReview.customerName}</p>
                  <p className="text-gray-300">Email: {selectedReview.customerEmail}</p>
                  <p className="text-gray-300">Ngày đánh giá: {selectedReview.date}</p>
                </div>

                {/* Review Content */}
                <div className="p-4 bg-gaming-darker rounded-lg">
                  <h4 className="text-white font-medium mb-2">Nội dung đánh giá</h4>
                  <p className="text-gray-300 leading-relaxed">{selectedReview.comment}</p>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center justify-between p-4 bg-gaming-darker rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-gray-400 text-sm">Trạng thái:</span>
                      <div className="mt-1">{getStatusBadge(selectedReview.status)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Hữu ích:</span>
                      <div className="flex items-center space-x-1 mt-1">
                        <ThumbsUp className="w-4 h-4 text-gaming-green" />
                        <span className="text-white">{selectedReview.helpful}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedReview.reported && (
                    <div className="flex items-center space-x-2 text-gaming-red">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">Bị báo cáo: {selectedReview.reportReason}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2">
                  {selectedReview.status === 'pending' && (
                    <>
                      <Button 
                        className="bg-gaming-green hover:bg-gaming-green/80 text-black"
                        onClick={() => {
                          handleApproveReview(selectedReview.id);
                          closeViewModal();
                        }}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Phê duyệt
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-gaming-red text-gaming-red hover:bg-gaming-red/20"
                        onClick={() => {
                          handleRejectReview(selectedReview.id);
                          closeViewModal();
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Từ chối
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="outline"
                    className="border-gaming-cyan/30 text-gaming-cyan"
                    onClick={closeViewModal}
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ReviewManagement;
