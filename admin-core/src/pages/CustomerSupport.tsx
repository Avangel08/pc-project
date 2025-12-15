import React, { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Eye,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageCircle,
  Headphones,
  Users,
  TrendingUp,
  Plus
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { TicketDetailModal } from '@/components/modals/TicketDetailModal';
import { NewTicketModal } from '@/components/modals/NewTicketModal';

const supportTickets = [
  {
    id: 'SP001',
    customerName: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    subject: 'Sản phẩm bị lỗi sau 2 ngày sử dụng',
    category: 'Khiếu nại',
    priority: 'high',
    status: 'open',
    createdAt: '2024-05-24 09:30',
    assignedTo: 'Trần Thị B',
    lastReply: '2024-05-24 10:15'
  },
  {
    id: 'SP002',
    customerName: 'Lê Văn C',
    email: 'levanc@email.com',
    subject: 'Hỏi về thông tin bảo hành',
    category: 'Tư vấn',
    priority: 'medium',
    status: 'pending',
    createdAt: '2024-05-24 08:45',
    assignedTo: 'Phạm Văn D',
    lastReply: '2024-05-24 09:20'
  },
  {
    id: 'SP003',
    customerName: 'Hoàng Thị E',
    email: 'hoangthie@email.com',
    subject: 'Đổi trả sản phẩm không đúng mô tả',
    category: 'Đổi trả',
    priority: 'high',
    status: 'resolved',
    createdAt: '2024-05-23 14:20',
    assignedTo: 'Trần Thị B',
    lastReply: '2024-05-24 08:30'
  },
  {
    id: 'SP004',
    customerName: 'Vũ Minh F',
    email: 'vuminhf@email.com',
    subject: 'Cần hỗ trợ cài đặt phần mềm',
    category: 'Kỹ thuật',
    priority: 'low',
    status: 'closed',
    createdAt: '2024-05-23 16:10',
    assignedTo: 'Nguyễn Văn G',
    lastReply: '2024-05-23 17:45'
  }
];

const chatSessions = [
  {
    id: 'CH001',
    customerName: 'Đỗ Thị H',
    status: 'active',
    startTime: '10:30',
    waitTime: '2 phút',
    agent: 'Trần Thị B',
    lastMessage: 'Cho em hỏi về sản phẩm keyboard này...'
  },
  {
    id: 'CH002',
    customerName: 'Nguyễn Văn I',
    status: 'waiting',
    startTime: '10:45',
    waitTime: '5 phút',
    agent: null,
    lastMessage: 'Xin chào, em cần tư vấn...'
  },
  {
    id: 'CH003',
    customerName: 'Lê Thị K',
    status: 'active',
    startTime: '09:15',
    waitTime: '0 phút',
    agent: 'Phạm Văn D',
    lastMessage: 'Cảm ơn anh đã hỗ trợ!'
  }
];

export const CustomerSupport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('tickets');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyFile, setReplyFile] = useState(null);
  const [ticketStatus, setTicketStatus] = useState('open');
  const [assignedAgent, setAssignedAgent] = useState('');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [showDevModal, setShowDevModal] = useState(true);

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

  const getChatStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-gaming-green text-black">Đang chat</Badge>;
      case 'waiting':
        return <Badge className="bg-gaming-red text-white">Chờ hỗ trợ</Badge>;
      case 'ended':
        return <Badge variant="secondary">Đã kết thúc</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  // Lịch sử trao đổi mẫu
  const mockHistory = [
    { sender: 'Khách hàng', time: '2024-05-24 09:30', content: 'Sản phẩm bị lỗi sau 2 ngày sử dụng.' },
    { sender: 'Agent', time: '2024-05-24 10:00', content: 'Chào anh/chị, vui lòng gửi ảnh sản phẩm lỗi.' },
    { sender: 'Khách hàng', time: '2024-05-24 10:05', content: 'Đây là ảnh sản phẩm (file đính kèm).' },
    { sender: 'Agent', time: '2024-05-24 10:15', content: 'Cảm ơn anh/chị, chúng tôi sẽ xử lý và phản hồi sớm.' },
  ];

  const handleOpenTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setTicketStatus(ticket.status);
    setAssignedAgent(ticket.assignedTo || '');
    setIsTicketModalOpen(true);
  };
  const handleCloseTicketModal = () => {
    setIsTicketModalOpen(false);
    setSelectedTicket(null);
    setReplyContent('');
    setReplyFile(null);
  };
  const handleReplySubmit = (e) => {
    e.preventDefault();
    // Xử lý gửi trả lời (mock)
    alert('Đã gửi trả lời (mock)!');
    setReplyContent('');
    setReplyFile(null);
  };

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    // TODO: Implement status change logic
    console.log(`Changing status of ticket ${ticketId} to ${newStatus}`);
  };

  const handleAgentChange = (ticketId: string, newAgent: string) => {
    // TODO: Implement agent change logic
    console.log(`Changing agent of ticket ${ticketId} to ${newAgent}`);
  };

  const handleReply = (ticketId: string, content: string, attachments: File[]) => {
    // TODO: Implement reply logic
    console.log(`Replying to ticket ${ticketId} with content: ${content}`);
    console.log('Attachments:', attachments);
  };

  const handleCreateTicket = (ticketData: any) => {
    // Mock: Thêm ticket mới vào danh sách
    const newTicket = {
      id: `SP${String(supportTickets.length + 1).padStart(3, '0')}`,
      customerName: ticketData.customerName,
      email: ticketData.customerEmail,
      subject: ticketData.subject,
      category: ticketData.category,
      priority: ticketData.priority,
      status: 'open',
      createdAt: new Date().toLocaleString(),
      assignedTo: '',
      lastReply: new Date().toLocaleString()
    };
    
    // Thêm ticket mới vào đầu danh sách
    supportTickets.unshift(newTicket);
    
    // Đóng modal
    setIsNewTicketModalOpen(false);
    
    // Thông báo thành công
    alert('Đã tạo ticket mới thành công!');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 relative">
        {/* Overlay mờ khi modal đang mở */}
        {showDevModal && (
          <div className="absolute inset-0 z-30 bg-black/60 pointer-events-none" />
        )}
        {/* Modal thông báo đang phát triển chỉ trong content, style phù hợp dark/gaming */}
        {showDevModal && (
          <div className="absolute left-1/2 top-16 -translate-x-1/2 z-40">
            <div className="bg-[#181A20] rounded-xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-yellow-400">
              <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-yellow-300 mb-4" style={{letterSpacing: 0.5}}>
                Chức năng hỗ trợ khách hàng đang được phát triển.
              </div>
              <Button className="mx-auto mt-2 bg-gaming-cyan text-black hover:bg-cyan-300" onClick={() => setShowDevModal(false)} autoFocus>
                Đóng
              </Button>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-orbitron font-bold text-gradient">
              Hỗ trợ Khách hàng
            </h1>
            <p className="text-gray-400 mt-1">
              Quản lý ticket hỗ trợ và chat trực tuyến
            </p>
          </div>
          <Button
            onClick={() => setIsNewTicketModalOpen(true)}
            className="bg-gaming-cyan text-black hover:bg-gaming-cyan/80"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo Ticket Mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Ticket đang mở</p>
                  <p className="text-2xl font-bold text-white mt-1">24</p>
                </div>
                <AlertCircle className="w-8 h-8 text-gaming-red" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Chat đang diễn ra</p>
                  <p className="text-2xl font-bold text-white mt-1">8</p>
                </div>
                <MessageCircle className="w-8 h-8 text-gaming-green" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Thời gian phản hồi TB</p>
                  <p className="text-2xl font-bold text-white mt-1">12m</p>
                </div>
                <Clock className="w-8 h-8 text-gaming-cyan" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Độ hài lòng</p>
                  <p className="text-2xl font-bold text-white mt-1">98%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-gaming-purple" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gaming-darker">
            <TabsTrigger value="tickets" className="text-white data-[state=active]:bg-gaming-cyan data-[state=active]:text-black">
              <Headphones className="w-4 h-4 mr-2" />
              Ticket hỗ trợ
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-white data-[state=active]:bg-gaming-cyan data-[state=active]:text-black">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat trực tuyến
            </TabsTrigger>
            <TabsTrigger value="agents" className="text-white data-[state=active]:bg-gaming-cyan data-[state=active]:text-black">
              <Users className="w-4 h-4 mr-2" />
              Nhân viên hỗ trợ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-6">
            {/* Filters */}
            <Card className="bg-gaming-dark border-gaming-cyan/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Tìm kiếm ticket..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gaming-darker border-gaming-cyan/30 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-gaming-cyan/30 text-gaming-cyan">
                      <Filter className="w-4 h-4 mr-2" />
                      Lọc theo trạng thái
                    </Button>
                    <Button variant="outline" className="border-gaming-cyan/30 text-gaming-cyan">
                      Xuất báo cáo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tickets Table */}
            <Card className="bg-gaming-dark border-gaming-cyan/20">
              <CardHeader>
                <CardTitle className="text-white font-orbitron">Danh sách ticket hỗ trợ</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gaming-cyan/20">
                      <TableHead className="text-gaming-cyan">Ticket</TableHead>
                      <TableHead className="text-gaming-cyan">Khách hàng</TableHead>
                      <TableHead className="text-gaming-cyan">Chủ đề</TableHead>
                      <TableHead className="text-gaming-cyan">Danh mục</TableHead>
                      <TableHead className="text-gaming-cyan">Độ ưu tiên</TableHead>
                      <TableHead className="text-gaming-cyan">Trạng thái</TableHead>
                      <TableHead className="text-gaming-cyan">Được giao</TableHead>
                      <TableHead className="text-gaming-cyan">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supportTickets.map((ticket) => (
                      <TableRow key={ticket.id} className="border-gaming-cyan/10 hover:bg-gaming-cyan/5">
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">#{ticket.id}</p>
                            <p className="text-sm text-gray-400">{ticket.createdAt}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{ticket.customerName}</p>
                            <p className="text-sm text-gray-400">{ticket.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-white max-w-xs truncate">
                          {ticket.subject}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-gaming-purple text-white">
                            {ticket.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(ticket.priority)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(ticket.status)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {ticket.assignedTo}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="text-gaming-cyan hover:bg-gaming-cyan/20" onClick={() => handleOpenTicketModal(ticket)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gaming-purple hover:bg-gaming-purple/20">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            {/* Chat Sessions */}
            <Card className="bg-gaming-dark border-gaming-cyan/20">
              <CardHeader>
                <CardTitle className="text-white font-orbitron">Phiên chat trực tuyến</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gaming-cyan/20">
                      <TableHead className="text-gaming-cyan">Khách hàng</TableHead>
                      <TableHead className="text-gaming-cyan">Trạng thái</TableHead>
                      <TableHead className="text-gaming-cyan">Bắt đầu</TableHead>
                      <TableHead className="text-gaming-cyan">Thời gian chờ</TableHead>
                      <TableHead className="text-gaming-cyan">Nhân viên</TableHead>
                      <TableHead className="text-gaming-cyan">Tin nhắn cuối</TableHead>
                      <TableHead className="text-gaming-cyan">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chatSessions.map((session) => (
                      <TableRow key={session.id} className="border-gaming-cyan/10 hover:bg-gaming-cyan/5">
                        <TableCell className="text-white font-medium">
                          {session.customerName}
                        </TableCell>
                        <TableCell>
                          {getChatStatusBadge(session.status)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {session.startTime}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {session.waitTime}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {session.agent || 'Chưa giao'}
                        </TableCell>
                        <TableCell className="text-gray-300 max-w-xs truncate">
                          {session.lastMessage}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="text-gaming-green hover:bg-gaming-green/20">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            {session.status === 'waiting' && (
                              <Button variant="ghost" size="sm" className="text-gaming-cyan hover:bg-gaming-cyan/20">
                                <User className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            {/* Support Agents */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gaming-dark border-gaming-cyan/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gaming-cyan to-gaming-purple rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">Trần Thị B</h3>
                      <p className="text-sm text-gray-400">CSKH Senior</p>
                    </div>
                    <Badge className="bg-gaming-green text-black">Online</Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Ticket đang xử lý:</span>
                      <span className="text-white">8</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Chat active:</span>
                      <span className="text-white">3</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Đánh giá TB:</span>
                      <span className="text-gaming-gold">4.9/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gaming-dark border-gaming-cyan/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gaming-purple to-gaming-cyan rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">Phạm Văn D</h3>
                      <p className="text-sm text-gray-400">CSKH</p>
                    </div>
                    <Badge className="bg-gaming-green text-black">Online</Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Ticket đang xử lý:</span>
                      <span className="text-white">5</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Chat active:</span>
                      <span className="text-white">2</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Đánh giá TB:</span>
                      <span className="text-gaming-gold">4.7/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gaming-dark border-gaming-cyan/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gaming-gold to-gaming-red rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">Nguyễn Văn G</h3>
                      <p className="text-sm text-gray-400">Kỹ thuật</p>
                    </div>
                    <Badge variant="secondary">Offline</Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Ticket đang xử lý:</span>
                      <span className="text-white">2</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Chat active:</span>
                      <span className="text-white">0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Đánh giá TB:</span>
                      <span className="text-gaming-gold">4.8/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {isTicketModalOpen && selectedTicket && (
        <TicketDetailModal
          isOpen={isTicketModalOpen}
          onClose={handleCloseTicketModal}
          ticket={selectedTicket}
          onStatusChange={handleStatusChange}
          onAgentChange={handleAgentChange}
          onReply={handleReply}
          onQualityRating={() => {}}
        />
      )}

      {/* Add NewTicketModal */}
      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        onSubmit={handleCreateTicket}
      />
    </AdminLayout>
  );
};

export default CustomerSupport;
