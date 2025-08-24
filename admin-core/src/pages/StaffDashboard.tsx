import React from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  Users, 
  Package,
  TrendingUp,
  Eye,
  Clock,
  Calendar,
  Bell,
  MessageSquare,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const orderData = [
  { name: 'T1', orders: 45, completed: 40 },
  { name: 'T2', orders: 52, completed: 48 },
  { name: 'T3', orders: 48, completed: 45 },
  { name: 'T4', orders: 61, completed: 55 },
  { name: 'T5', orders: 55, completed: 50 },
  { name: 'T6', orders: 67, completed: 60 },
  { name: 'T7', orders: 58, completed: 52 },
];

const recentOrders = [
  { id: 'ORD001', customer: 'Nguyễn Văn A', products: 3, total: 2500000, status: 'Đang xử lý' },
  { id: 'ORD002', customer: 'Trần Thị B', products: 2, total: 1800000, status: 'Đang giao hàng' },
  { id: 'ORD003', customer: 'Lê Văn C', products: 1, total: 1200000, status: 'Hoàn thành' },
  { id: 'ORD004', customer: 'Phạm Thị D', products: 4, total: 3200000, status: 'Đang xử lý' },
  { id: 'ORD005', customer: 'Hoàng Văn E', products: 2, total: 1500000, status: 'Đang giao hàng' },
];

const customerSupport = [
  { id: 'CS001', customer: 'Nguyễn Văn A', issue: 'Hỏi về chính sách đổi trả', priority: 'Cao', status: 'Chưa xử lý' },
  { id: 'CS002', customer: 'Trần Thị B', issue: 'Yêu cầu hủy đơn hàng', priority: 'Trung bình', status: 'Đang xử lý' },
  { id: 'CS003', customer: 'Lê Văn C', issue: 'Khiếu nại sản phẩm', priority: 'Cao', status: 'Chưa xử lý' },
];

const tasks = [
  { id: 'TASK001', title: 'Kiểm tra đơn hàng ORD001', deadline: '14:00', priority: 'Cao' },
  { id: 'TASK002', title: 'Phản hồi khách hàng CS001', deadline: '15:30', priority: 'Trung bình' },
  { id: 'TASK003', title: 'Cập nhật trạng thái giao hàng', deadline: '16:00', priority: 'Thấp' },
];

const notifications = [
  { id: 'NOT001', title: 'Đơn hàng mới', content: 'Có đơn hàng mới cần xử lý', time: '5 phút trước' },
  { id: 'NOT002', title: 'Nhắc nhở', content: 'Cập nhật trạng thái đơn hàng', time: '10 phút trước' },
  { id: 'NOT003', title: 'Thông báo từ Admin', content: 'Họp nhóm lúc 15:00', time: '30 phút trước' },
];

const schedule = [
  { time: '09:00 - 10:00', task: 'Kiểm tra đơn hàng', status: 'Hoàn thành' },
  { time: '10:00 - 11:00', task: 'Hỗ trợ khách hàng', status: 'Đang thực hiện' },
  { time: '11:00 - 12:00', task: 'Cập nhật trạng thái', status: 'Chưa thực hiện' },
  { time: '13:00 - 14:00', task: 'Xử lý khiếu nại', status: 'Chưa thực hiện' },
];

export const StaffDashboard = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-orbitron font-bold text-gradient">
              Bảng Điều Khiển Nhân Viên
            </h1>
            <p className="text-gray-400 mt-1">
              Quản lý đơn hàng và hỗ trợ khách hàng
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="border-gaming-cyan/30 text-gaming-cyan hover:bg-gaming-cyan/20">
              <Eye className="w-4 h-4 mr-2" />
              Xem báo cáo chi tiết
            </Button>
            <Button className="bg-gradient-to-r from-gaming-cyan to-gaming-purple hover:from-gaming-cyan/80 hover:to-gaming-purple/80">
              <TrendingUp className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Đơn hàng hôm nay"
            value="45"
            change="+5 so với hôm qua"
            changeType="increase"
            icon={ShoppingCart}
            iconColor="bg-gradient-to-br from-gaming-green to-gaming-cyan"
          />
          <StatsCard
            title="Đơn hàng đang xử lý"
            value="12"
            change="3 đơn cần xử lý gấp"
            changeType="neutral"
            icon={Clock}
            iconColor="bg-gradient-to-br from-gaming-cyan to-gaming-purple"
          />
          <StatsCard
            title="Khách hàng mới"
            value="8"
            change="+2 so với hôm qua"
            changeType="increase"
            icon={Users}
            iconColor="bg-gradient-to-br from-gaming-purple to-gaming-red"
          />
          <StatsCard
            title="Sản phẩm đã bán"
            value="156"
            change="+23 so với hôm qua"
            changeType="increase"
            icon={Package}
            iconColor="bg-gradient-to-br from-gaming-red to-gaming-gold"
          />
        </div>

        {/* New Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Support */}
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardHeader>
              <CardTitle className="text-white font-orbitron">Hỗ trợ khách hàng cần xử lý</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerSupport.map((support, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gaming-darker rounded-lg border border-gaming-cyan/10 hover:border-gaming-cyan/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-gaming-red to-gaming-purple rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{support.customer}</p>
                        <p className="text-sm text-gray-400">{support.issue}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        support.priority === 'Cao' ? 'text-red-400' : 
                        support.priority === 'Trung bình' ? 'text-yellow-400' : 
                        'text-green-400'
                      }`}>
                        {support.priority}
                      </p>
                      <p className="text-sm text-gray-400">{support.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardHeader>
              <CardTitle className="text-white font-orbitron">Nhiệm vụ cần thực hiện</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gaming-darker rounded-lg border border-gaming-cyan/10 hover:border-gaming-cyan/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-gaming-cyan to-gaming-purple rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{task.title}</p>
                        <p className="text-sm text-gray-400">Hạn: {task.deadline}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        task.priority === 'Cao' ? 'text-red-400' : 
                        task.priority === 'Trung bình' ? 'text-yellow-400' : 
                        'text-green-400'
                      }`}>
                        {task.priority}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schedule */}
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardHeader>
              <CardTitle className="text-white font-orbitron">Lịch làm việc hôm nay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedule.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gaming-darker rounded-lg border border-gaming-cyan/10 hover:border-gaming-cyan/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-gaming-cyan to-gaming-purple rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{item.time}</p>
                        <p className="text-sm text-gray-400">{item.task}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        item.status === 'Hoàn thành' ? 'text-green-400' : 
                        item.status === 'Đang thực hiện' ? 'text-yellow-400' : 
                        'text-gray-400'
                      }`}>
                        {item.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardHeader>
              <CardTitle className="text-white font-orbitron">Thông báo mới</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gaming-darker rounded-lg border border-gaming-cyan/10 hover:border-gaming-cyan/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-gaming-cyan to-gaming-purple rounded-lg flex items-center justify-center">
                        <Bell className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{notification.title}</p>
                        <p className="text-sm text-gray-400">{notification.content}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders Chart */}
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardHeader>
              <CardTitle className="text-white font-orbitron">Đơn hàng 7 ngày gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={orderData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1A1A2E',
                      border: '1px solid rgba(0,255,255,0.3)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#00FFFF" 
                    strokeWidth={3}
                    dot={{ fill: '#00FFFF', strokeWidth: 2, r: 5 }}
                    name="Tổng đơn"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#9D00FF" 
                    strokeWidth={3}
                    dot={{ fill: '#9D00FF', strokeWidth: 2, r: 5 }}
                    name="Đã hoàn thành"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Completion Rate Chart */}
          <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
            <CardHeader>
              <CardTitle className="text-white font-orbitron">Tỷ lệ hoàn thành đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={orderData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1A1A2E',
                      border: '1px solid rgba(157,0,255,0.3)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Bar 
                    dataKey="completed" 
                    fill="url(#barGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9D00FF" />
                      <stop offset="100%" stopColor="#00FFFF" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="card-hover bg-gaming-dark border-gaming-cyan/20">
          <CardHeader>
            <CardTitle className="text-white font-orbitron">Đơn hàng gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gaming-darker rounded-lg border border-gaming-cyan/10 hover:border-gaming-cyan/30 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-gaming-cyan to-gaming-purple rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{order.id} - {order.customer}</p>
                      <p className="text-sm text-gray-400">{order.products} sản phẩm</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gaming-cyan">
                      ₫{order.total.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}; 