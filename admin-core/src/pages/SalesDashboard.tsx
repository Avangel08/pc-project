import React from 'react';
import { SidebarProvider } from '../components/ui/sidebar';
import { SalesSidebar } from '../components/SalesSidebar';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

// Mock data - sẽ được thay thế bằng data thực tế sau
const stats = {
  todayOrders: 12,
  processingOrders: 5,
  newCustomers: 3,
  soldProducts: 25
};

const recentOrders = [
  {
    id: "ORD001",
    customer: "Nguyễn Văn A",
    products: 3,
    total: "2,500,000đ",
    status: "Đang xử lý"
  },
  {
    id: "ORD002",
    customer: "Trần Thị B",
    products: 1,
    total: "1,200,000đ",
    status: "Đã xác nhận"
  },
  {
    id: "ORD003",
    customer: "Lê Văn C",
    products: 2,
    total: "3,800,000đ",
    status: "Hoàn thành"
  }
];

const supportRequests = [
  {
    id: "SR001",
    customer: "Phạm Thị D",
    issue: "Hỏi về chính sách bảo hành",
    priority: "Cao",
    status: "Chờ xử lý"
  },
  {
    id: "SR002",
    customer: "Hoàng Văn E",
    issue: "Yêu cầu đổi trả sản phẩm",
    priority: "Trung bình",
    status: "Đang xử lý"
  }
];

const SalesDashboard = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gaming-dark">
        <SalesSidebar />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-orbitron font-bold text-gradient">
                Tổng quan
              </h1>
              <div className="flex space-x-4">
                <Button variant="outline" className="border-gaming-cyan/20 text-gaming-cyan hover:bg-gaming-cyan/10">
                  <Clock className="w-4 h-4 mr-2" />
                  Hôm nay
                </Button>
                <Button variant="outline" className="border-gaming-cyan/20 text-gaming-cyan hover:bg-gaming-cyan/10">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Báo cáo
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gaming-darker/50 border-gaming-cyan/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Đơn hàng hôm nay</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.todayOrders}</h3>
                  </div>
                  <div className="w-12 h-12 bg-gaming-cyan/20 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-gaming-cyan" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gaming-cyan">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>Tăng 20% so với hôm qua</span>
                </div>
              </Card>

              <Card className="bg-gaming-darker/50 border-gaming-purple/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Đơn hàng đang xử lý</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.processingOrders}</h3>
                  </div>
                  <div className="w-12 h-12 bg-gaming-purple/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-gaming-purple" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gaming-purple">
                  <span>2 đơn cần xử lý gấp</span>
                </div>
              </Card>

              <Card className="bg-gaming-darker/50 border-gaming-green/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Khách hàng mới</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.newCustomers}</h3>
                  </div>
                  <div className="w-12 h-12 bg-gaming-green/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-gaming-green" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gaming-green">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>Tăng 15% so với tuần trước</span>
                </div>
              </Card>

              <Card className="bg-gaming-darker/50 border-gaming-orange/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Sản phẩm đã bán</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.soldProducts}</h3>
                  </div>
                  <div className="w-12 h-12 bg-gaming-orange/20 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-gaming-orange" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gaming-orange">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>Tăng 8% so với hôm qua</span>
                </div>
              </Card>
            </div>

            {/* Recent Orders & Support Requests */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card className="bg-gaming-darker/50 border-gaming-cyan/20">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-orbitron font-bold text-white">Đơn hàng gần đây</h2>
                    <Link to="/sales/orders">
                      <Button variant="ghost" className="text-gaming-cyan hover:text-gaming-cyan/80">
                        Xem tất cả
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gaming-darker rounded-lg border border-gaming-cyan/10">
                        <div>
                          <p className="font-medium text-white">{order.id}</p>
                          <p className="text-sm text-gray-400">{order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">{order.products} sản phẩm</p>
                          <p className="font-medium text-white">{order.total}</p>
                        </div>
                        <div className="flex items-center">
                          {order.status === "Hoàn thành" ? (
                            <CheckCircle2 className="w-5 h-5 text-gaming-green" />
                          ) : order.status === "Đang xử lý" ? (
                            <Clock className="w-5 h-5 text-gaming-orange" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-gaming-cyan" />
                          )}
                          <span className="ml-2 text-sm text-gray-400">{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Support Requests */}
              <Card className="bg-gaming-darker/50 border-gaming-purple/20">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-orbitron font-bold text-white">Yêu cầu hỗ trợ</h2>
                    <Link to="/sales/support">
                      <Button variant="ghost" className="text-gaming-purple hover:text-gaming-purple/80">
                        Xem tất cả
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {supportRequests.map((request) => (
                      <div key={request.id} className="p-4 bg-gaming-darker rounded-lg border border-gaming-purple/10">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-white">{request.customer}</p>
                            <p className="text-sm text-gray-400">{request.issue}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            request.priority === "Cao" 
                              ? "bg-red-500/20 text-red-500"
                              : "bg-yellow-500/20 text-yellow-500"
                          }`}>
                            {request.priority}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-400">{request.id}</span>
                          <span className="text-sm text-gaming-purple">{request.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SalesDashboard; 