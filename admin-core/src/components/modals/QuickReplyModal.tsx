import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Search } from 'lucide-react';

interface QuickReply {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  usageCount: number;
}

interface QuickReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (reply: QuickReply) => void;
}

const mockQuickReplies: QuickReply[] = [
  {
    id: 'QR001',
    title: 'Chào hỏi',
    content: 'Xin chào anh/chị, tôi có thể giúp gì cho anh/chị ạ?',
    category: 'general',
    tags: ['chào hỏi', 'bắt đầu'],
    usageCount: 156
  },
  {
    id: 'QR002',
    title: 'Yêu cầu thông tin',
    content: 'Anh/chị vui lòng cung cấp thêm thông tin về vấn đề này để tôi có thể hỗ trợ tốt hơn.',
    category: 'general',
    tags: ['thông tin', 'hỗ trợ'],
    usageCount: 89
  },
  {
    id: 'QR003',
    title: 'Xác nhận đơn hàng',
    content: 'Cảm ơn anh/chị đã đặt hàng. Đơn hàng của anh/chị đã được xác nhận và sẽ được xử lý trong thời gian sớm nhất.',
    category: 'order',
    tags: ['đơn hàng', 'xác nhận'],
    usageCount: 234
  }
];

export const QuickReplyModal: React.FC<QuickReplyModalProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newReply, setNewReply] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });

  const filteredReplies = mockQuickReplies.filter(reply => {
    const matchesSearch = reply.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reply.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reply.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || reply.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateReply = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement create reply logic
    setIsCreating(false);
    setNewReply({ title: '', content: '', category: '', tags: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-gaming-dark text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gaming-cyan">Mẫu Trả lời Nhanh</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm mẫu trả lời..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gaming-darker border-gaming-border"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px] bg-gaming-darker border-gaming-border">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="general">Chung</SelectItem>
                <SelectItem value="order">Đơn hàng</SelectItem>
                <SelectItem value="technical">Kỹ thuật</SelectItem>
                <SelectItem value="billing">Thanh toán</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-gaming-cyan text-black hover:bg-gaming-cyan/80"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo mới
            </Button>
          </div>

          {/* Create New Reply Form */}
          {isCreating && (
            <form onSubmit={handleCreateReply} className="p-4 bg-gaming-darker rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gaming-cyan">Tạo mẫu trả lời mới</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                  className="text-gaming-red hover:text-gaming-red/80"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề</Label>
                <Input
                  id="title"
                  value={newReply.title}
                  onChange={(e) => setNewReply(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-gaming-dark border-gaming-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Nội dung</Label>
                <Textarea
                  id="content"
                  value={newReply.content}
                  onChange={(e) => setNewReply(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-[100px] bg-gaming-dark border-gaming-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục</Label>
                  <Select
                    value={newReply.category}
                    onValueChange={(value) => setNewReply(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Chung</SelectItem>
                      <SelectItem value="order">Đơn hàng</SelectItem>
                      <SelectItem value="technical">Kỹ thuật</SelectItem>
                      <SelectItem value="billing">Thanh toán</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
                  <Input
                    id="tags"
                    value={newReply.tags}
                    onChange={(e) => setNewReply(prev => ({ ...prev, tags: e.target.value }))}
                    className="bg-gaming-dark border-gaming-border"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                  className="bg-gaming-darker border-gaming-border text-white hover:bg-gaming-hover"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-gaming-cyan text-black hover:bg-gaming-cyan/80"
                >
                  Tạo mẫu
                </Button>
              </div>
            </form>
          )}

          {/* Quick Replies List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredReplies.map((reply) => (
              <div
                key={reply.id}
                className="p-4 bg-gaming-darker rounded-lg hover:bg-gaming-hover cursor-pointer"
                onClick={() => onSelect(reply)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gaming-cyan">{reply.title}</h3>
                    <p className="text-gray-300 mt-1">{reply.content}</p>
                    <div className="flex gap-2 mt-2">
                      {reply.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-gaming-purple/20 text-gaming-purple">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-gaming-gold text-black">
                      {reply.usageCount} lần sử dụng
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-gaming-darker border-gaming-border text-white hover:bg-gaming-hover"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 