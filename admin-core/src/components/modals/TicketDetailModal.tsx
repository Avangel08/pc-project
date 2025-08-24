import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from '@/hooks/use-toast';
import { Eye, MessageSquare, File, User, Clock, Send, Paperclip, X, Upload, Star } from 'lucide-react';
import { QuickReplyModal } from './QuickReplyModal';
import { QualityRatingModal } from './QualityRatingModal';

interface Ticket {
  id: string;
  customerName: string;
  email: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  assignedTo: string;
  createdAt: string;
}

interface Message {
  id: string;
  sender: string;
  senderType: 'customer' | 'agent';
  content: string;
  timestamp: string;
  attachments?: {
    name: string;
    url: string;
  }[];
}

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onStatusChange: (ticketId: string, newStatus: string) => void;
  onAgentChange: (ticketId: string, newAgent: string) => void;
  onReply: (ticketId: string, content: string, attachments: File[]) => void;
  onQualityRating: (rating: any) => void;
}

const mockAgents = [
  { id: '1', name: 'Trần Thị B', status: 'online' },
  { id: '2', name: 'Phạm Văn D', status: 'offline' },
  { id: '3', name: 'Nguyễn Văn A', status: 'online' },
];

const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'Đỗ Thị H',
    senderType: 'customer',
    content: 'Sản phẩm bị lỗi sau 2 ngày sử dụng.',
    timestamp: '2024-05-24 09:30',
  },
  {
    id: '2',
    sender: 'Trần Thị B',
    senderType: 'agent',
    content: 'Chào anh/chị, vui lòng gửi ảnh sản phẩm lỗi.',
    timestamp: '2024-05-24 10:00',
  },
  {
    id: '3',
    sender: 'Đỗ Thị H',
    senderType: 'customer',
    content: 'Đây là ảnh sản phẩm.',
    timestamp: '2024-05-24 10:05',
    attachments: [
      { name: 'product_image.jpg', url: '#' }
    ]
  },
  {
    id: '4',
    sender: 'Trần Thị B',
    senderType: 'agent',
    content: 'Cảm ơn anh/chị, chúng tôi sẽ xử lý và phản hồi sớm.',
    timestamp: '2024-05-24 10:15',
  },
];

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onStatusChange,
  onAgentChange,
  onReply,
  onQualityRating
}) => {
  const [replyContent, setReplyContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [selectedFiles, setSelectedFiles] = useState<{ name: string; size: number }[]>([]);
  const [isQuickReplyModalOpen, setIsQuickReplyModalOpen] = useState(false);
  const [isQualityRatingModalOpen, setIsQualityRatingModalOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
      setSelectedFiles([...selectedFiles, ...newFiles.map(file => ({ name: file.name, size: file.size }))]);
    }
  };

  const removeFile = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung trả lời",
        variant: "destructive",
      });
      return;
    }

    // Thêm tin nhắn mới vào lịch sử
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'Trần Thị B', // Mock current agent
      senderType: 'agent',
      content: replyContent,
      timestamp: new Date().toLocaleString(),
      attachments: selectedFiles.map(file => ({ name: file.name, url: '#' }))
    };

    setMessages([...messages, newMessage]);
    onReply(ticket.id, replyContent, attachments);
    setReplyContent('');
    setAttachments([]);
    setSelectedFiles([]);
  };

  const handleQuickReplySelect = (reply: any) => {
    setReplyContent(reply.content);
    setIsQuickReplyModalOpen(false);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-gaming-red text-white">Cao</Badge>;
      case 'medium':
        return <Badge className="bg-gaming-gold text-black">Trung bình</Badge>;
      case 'low':
        return <Badge className="bg-gaming-green text-black">Thấp</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-gaming-cyan text-black">Mở</Badge>;
      case 'pending':
        return <Badge className="bg-gaming-gold text-black">Chờ xử lý</Badge>;
      case 'resolved':
        return <Badge className="bg-gaming-green text-black">Đã giải quyết</Badge>;
      case 'closed':
        return <Badge variant="secondary">Đã đóng</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  const handleQualityRating = (rating: any) => {
    onQualityRating(rating);
    toast({
      title: "Thành công",
      description: "Đã lưu đánh giá chất lượng",
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl bg-gaming-dark border-gaming-cyan/20">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-white font-orbitron">
                Chi tiết Ticket #{ticket.id}
              </DialogTitle>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsQualityRatingModalOpen(true)}
                className="bg-gaming-darker border-gaming-cyan/30 text-gaming-cyan hover:bg-gaming-cyan/20"
              >
                <Star className="w-4 h-4 mr-2" />
                Đánh giá chất lượng
              </Button>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-6">
            {/* Thông tin ticket */}
            <div className="col-span-1 space-y-4">
              <div className="bg-gaming-darker p-4 rounded-lg">
                <h3 className="text-gaming-cyan font-medium mb-3">Thông tin ticket</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-400">Khách hàng</Label>
                    <p className="text-white font-medium">{ticket.customerName}</p>
                    <p className="text-gray-400 text-sm">{ticket.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Chủ đề</Label>
                    <p className="text-white">{ticket.subject}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Danh mục</Label>
                    <Badge className="bg-gaming-purple text-white">{ticket.category}</Badge>
                  </div>
                  <div>
                    <Label className="text-gray-400">Độ ưu tiên</Label>
                    {getPriorityBadge(ticket.priority)}
                  </div>
                  <div>
                    <Label className="text-gray-400">Trạng thái</Label>
                    <Select
                      value={ticket.status}
                      onValueChange={(value) => onStatusChange(ticket.id, value)}
                    >
                      <SelectTrigger className="bg-gaming-darker border-gaming-cyan/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gaming-darker border-gaming-cyan/30">
                        <SelectItem value="open" className="text-white">Mở</SelectItem>
                        <SelectItem value="pending" className="text-white">Chờ xử lý</SelectItem>
                        <SelectItem value="resolved" className="text-white">Đã giải quyết</SelectItem>
                        <SelectItem value="closed" className="text-white">Đã đóng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-400">Được giao</Label>
                    <Select
                      value={ticket.assignedTo}
                      onValueChange={(value) => onAgentChange(ticket.id, value)}
                    >
                      <SelectTrigger className="bg-gaming-darker border-gaming-cyan/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gaming-darker border-gaming-cyan/30">
                        {mockAgents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.name} className="text-white">
                            <div className="flex items-center gap-2">
                              <span>{agent.name}</span>
                              <span className={`w-2 h-2 rounded-full ${agent.status === 'online' ? 'bg-gaming-green' : 'bg-gray-500'}`} />
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-400">Thời gian tạo</Label>
                    <p className="text-white">{ticket.createdAt}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lịch sử trao đổi */}
            <div className="col-span-2 space-y-4">
              <div className="bg-gaming-darker p-4 rounded-lg h-[500px] flex flex-col">
                <h3 className="text-gaming-cyan font-medium mb-3">Lịch sử trao đổi</h3>
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === 'agent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[80%] ${message.senderType === 'agent' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gaming-cyan text-white">
                            {message.sender.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`space-y-1 ${message.senderType === 'agent' ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{message.sender}</span>
                            <span className="text-xs text-gray-400">{message.timestamp}</span>
                          </div>
                          <div className={`p-3 rounded-lg ${
                            message.senderType === 'agent'
                              ? 'bg-gaming-cyan/20 text-white'
                              : 'bg-gaming-darker text-white'
                          }`}>
                            <p>{message.content}</p>
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map((file, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 text-sm text-gaming-cyan hover:text-gaming-cyan/80"
                                  >
                                    <File className="w-4 h-4" />
                                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                                      {file.name}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form trả lời */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="reply">Trả lời</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsQuickReplyModalOpen(true)}
                        className="text-gaming-cyan hover:text-gaming-cyan/80"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Mẫu trả lời nhanh
                      </Button>
                    </div>
                    <Textarea
                      id="reply"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="min-h-[100px] bg-gaming-darker border-gaming-cyan/30 text-white resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>File đính kèm</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-gaming-darker border-gaming-cyan/30 text-white hover:bg-gaming-cyan/20"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Chọn file
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gaming-darker rounded">
                            <span className="text-sm text-white">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-gaming-red hover:text-gaming-red/80"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="border-gaming-cyan/30 text-gaming-cyan"
                    >
                      Đóng
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-gaming-cyan to-gaming-purple hover:from-gaming-cyan/80 hover:to-gaming-purple/80"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Gửi trả lời
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <QuickReplyModal
        isOpen={isQuickReplyModalOpen}
        onClose={() => setIsQuickReplyModalOpen(false)}
        onSelect={handleQuickReplySelect}
      />

      <QualityRatingModal
        isOpen={isQualityRatingModalOpen}
        onClose={() => setIsQualityRatingModalOpen(false)}
        ticketId={ticket.id}
        agentName={ticket.assignedTo}
        onSave={handleQualityRating}
      />
    </>
  );
}; 