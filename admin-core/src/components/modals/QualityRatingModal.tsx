import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

interface QualityRating {
  id: string;
  ticketId: string;
  rating: number;
  category: string;
  comment: string;
  evaluator: string;
  evaluatedAt: string;
  agentName: string;
  tags: string[];
}

interface QualityRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  agentName: string;
  onSave: (rating: Omit<QualityRating, 'id' | 'evaluatedAt'>) => void;
}

const ratingCategories = [
  { value: 'communication', label: 'Giao tiếp' },
  { value: 'knowledge', label: 'Kiến thức' },
  { value: 'problem_solving', label: 'Giải quyết vấn đề' },
  { value: 'professionalism', label: 'Chuyên nghiệp' },
  { value: 'efficiency', label: 'Hiệu quả' }
];

const ratingTags = [
  'Thân thiện',
  'Nhiệt tình',
  'Chuyên nghiệp',
  'Nhanh chóng',
  'Chính xác',
  'Cần cải thiện',
  'Thiếu thông tin',
  'Phản hồi chậm'
];

export const QualityRatingModal: React.FC<QualityRatingModalProps> = ({
  isOpen,
  onClose,
  ticketId,
  agentName,
  onSave
}) => {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('');
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSave = () => {
    onSave({
      ticketId,
      rating,
      category,
      comment,
      evaluator: 'Nguyễn Văn A', // Mock current evaluator
      agentName,
      tags: selectedTags
    });
    onClose();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gaming-dark text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gaming-cyan">
            Đánh giá Chất lượng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Agent Info */}
          <div className="p-4 bg-gaming-darker rounded-lg">
            <h3 className="text-lg font-semibold text-gaming-cyan mb-2">Thông tin Agent</h3>
            <p className="text-white">{agentName}</p>
            <p className="text-gray-400 text-sm">Ticket #{ticketId}</p>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Đánh giá tổng thể</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-gaming-gold fill-gaming-gold'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Danh mục đánh giá</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-gaming-darker border-gaming-border">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {ratingCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {ratingTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={`cursor-pointer ${
                    selectedTags.includes(tag)
                      ? 'bg-gaming-cyan text-black'
                      : 'bg-gaming-darker text-white hover:bg-gaming-hover'
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label>Nhận xét</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Nhập nhận xét chi tiết..."
              className="min-h-[100px] bg-gaming-darker border-gaming-border"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-gaming-darker border-gaming-border text-white hover:bg-gaming-hover"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-gaming-cyan text-black hover:bg-gaming-cyan/80"
            disabled={!rating || !category}
          >
            Lưu đánh giá
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 