"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, ThumbsUp, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  helpful: number;
  reported?: boolean;
  reportReason?: string;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fetch reviews
  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập để đánh giá sản phẩm",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung đánh giá",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          customerId: user.id,
          customerName: user.name || user.email,
          customerEmail: user.email,
          rating,
          comment: comment.trim(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Đánh giá của bạn đã được gửi và đang chờ duyệt",
        });
        setComment('');
        setRating(5);
        setShowReviewForm(false);
        // Refresh reviews
        fetchReviews();
      } else {
        const error = await response.json();
        toast({
          title: "Lỗi",
          description: error.error || "Có lỗi xảy ra khi gửi đánh giá",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi gửi đánh giá",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    return Array.from({ length: 5 }, (_, index) => (
      <button
        key={index}
        type={interactive ? "button" : "button"}
        onClick={interactive ? () => onStarClick?.(index + 1) : undefined}
        className={`transition-colors ${
          interactive ? 'hover:scale-110' : ''
        }`}
        disabled={!interactive}
      >
        <Star
          size={16}
          className={`${
            index < rating 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-400'
          }`}
        />
      </button>
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Tính toán thống kê
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-2">
      {/* Header và thống kê */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white">Đánh giá & Nhận xét</h2>
          <p className="text-xs text-gray-400 mt-1">
            {totalReviews} đánh giá • Trung bình {averageRating}/5 sao
          </p>
        </div>
        
        {user && (
          <Button
            onClick={() => setShowReviewForm(!showReviewForm)}
            size="sm"
            className="bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] text-black font-semibold hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]"
          >
            <MessageSquare className="w-3 h-3 mr-2" />
            {showReviewForm ? 'Hủy đánh giá' : 'Viết đánh giá'}
          </Button>
        )}
      </div>

      {/* Form đánh giá */}
      {showReviewForm && (
        <div className="bg-[#1A1A2E] rounded-lg p-3 border border-[#2A2A40]">
          <h3 className="text-sm font-semibold text-white mb-2">Đánh giá sản phẩm: {productName}</h3>
          
          <form onSubmit={handleSubmitReview} className="space-y-2">
            {/* Rating */}
            <div>
              <label className="block text-white text-xs font-medium mb-1">Đánh giá của bạn:</label>
              <div className="flex items-center gap-1">
                {renderStars(rating, true, setRating)}
                <span className="ml-2 text-white text-xs">{rating}/5 sao</span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-white text-xs font-medium mb-1">
                Nhận xét của bạn:
              </label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                className="bg-[#161625] border-[#2A2A40] text-white placeholder-gray-400 min-h-[60px] text-xs"
                maxLength={500}
              />
              <p className="text-[10px] text-gray-400 mt-1">
                {comment.length}/500 ký tự
              </p>
            </div>

            {/* Submit buttons */}
            <div className="flex gap-1">
              <Button
                type="submit"
                size="sm"
                disabled={submitting || !comment.trim()}
                className="bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] text-black font-semibold hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] disabled:opacity-50"
              >
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowReviewForm(false)}
                className="border-[#2A2A40] text-white hover:bg-[#2A2A40]"
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách đánh giá */}
      <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00FFFF] mx-auto"></div>
            <p className="text-gray-400 mt-2 text-xs">Đang tải đánh giá...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-4 bg-[#1A1A2E] rounded-lg border border-[#2A2A40]">
            <MessageSquare className="w-5 h-5 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400 text-xs">Chưa có đánh giá nào cho sản phẩm này</p>
            {!user && (
              <p className="text-[10px] text-gray-500 mt-1">
                Đăng nhập để viết đánh giá đầu tiên!
              </p>
            )}
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-[#1A1A2E] rounded-lg p-2 border border-[#2A2A40]">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-[#00FFFF] rounded-full flex items-center justify-center">
                    <User className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-xs">{review.customerName}</p>
                    <p className="text-[10px] text-gray-400">{formatDate(review.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                  <span className="ml-1 text-white font-medium text-xs">{review.rating}/5</span>
                </div>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-2 text-xs">{review.comment}</p>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{review.helpful} hữu ích</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Thông báo đăng nhập */}
      {!user && (
        <div className="bg-[#1A1A2E] rounded-lg p-2 border border-[#2A2A40] text-center">
          <MessageSquare className="w-5 h-5 text-[#00FFFF] mx-auto mb-2" />
          <h3 className="text-xs font-semibold text-white mb-1">Đăng nhập để đánh giá</h3>
          <p className="text-gray-400 text-xs">
            Chỉ khách hàng đã đăng nhập mới có thể viết đánh giá và nhận xét về sản phẩm.
          </p>
          <Button
            size="sm"
            onClick={() => window.location.href = '/auth'}
            className="bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] text-black font-semibold hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]"
          >
            Đăng nhập ngay
          </Button>
        </div>
      )}
    </div>
  );
} 