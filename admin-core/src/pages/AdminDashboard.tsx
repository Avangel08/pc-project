import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  TrendingUp,
  Eye,
  Loader2,
  RefreshCw
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

const revenueData = [
  { name: 'T1', revenue: 45000000, orders: 120 },
  { name: 'T2', revenue: 52000000, orders: 135 },
  { name: 'T3', revenue: 48000000, orders: 128 },
  { name: 'T4', revenue: 61000000, orders: 156 },
  { name: 'T5', revenue: 55000000, orders: 142 },
  { name: 'T6', revenue: 67000000, orders: 171 },
  { name: 'T7', revenue: 58000000, orders: 148 },
];

const topProducts = [
  { name: 'Bàn phím cơ Keychron K2', sales: 145, revenue: 29000000 },
  { name: 'Chuột Logitech G Pro X', sales: 128, revenue: 19200000 },
  { name: 'Tai nghe SteelSeries Arctis 7', sales: 98, revenue: 24500000 },
  { name: 'Mô hình Naruto Uzumaki', sales: 87, revenue: 13050000 },
  { name: 'Đèn LED RGB Corsair', sales: 76, revenue: 15200000 },
];

export const AdminDashboard = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Hàm fetch dữ liệu tổng quan
  const fetchSummary = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/dashboard/summary');
      const data = await res.json();
      if (res.ok) {
        setSummary(data);
        setError('');
      } else {
        setError(data.error || 'Lỗi khi lấy dữ liệu tổng quan');
      }
    } catch (err) {
      setError('Không thể kết nối tới server');
    } finally {
      setLoading(false);
    }
  };

  // Hàm refresh dữ liệu
  const handleRefresh = () => {
    setLoading(true);
    fetchSummary();
  };

  useEffect(() => {
    // Tải dữ liệu lần đầu
    fetchSummary();

    // Cập nhật dữ liệu tự động mỗi 30 giây
    const interval = setInterval(() => {
      fetchSummary();
    }, 30000); // 30 giây

    // Cleanup interval khi component unmount
    return () => clearInterval(interval);
  }, []);

  // Helper format
  const formatCurrency = (v: number) => v?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '₫0';

  return (
    <AdminLayout>
      <div className="space-y-8 px-2 md:px-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-4xl font-bold mb-1">
              Dashboard Tổng Quan
            </h1>
            <p className="text-gray-400 mt-1 text-base md:text-lg">
              Thống kê và báo cáo tổng quan hệ thống
            </p>
          </div>
          <Button onClick={handleRefresh} className="bg-gaming-cyan hover:bg-gaming-cyan/90 text-white">
            <RefreshCw className="w-5 h-5 mr-2" />
            Làm mới dữ liệu
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="animate-spin w-12 h-12 text-gaming-cyan mb-4" />
            <div className="text-gaming-cyan text-lg font-semibold">Đang tải dữ liệu tổng quan...</div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-12 text-lg">{error}</div>
        ) : summary && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="transition-all rounded-xl shadow-lg bg-gaming-dark border border-gaming-cyan/20 hover:shadow-xl hover:border-gaming-cyan/60 flex flex-col items-center py-4 group">
                <div className="bg-gaming-cyan/10 rounded-full p-2 mb-2 group-hover:scale-105 transition-transform">
                  <DollarSign className="w-7 h-7 text-gaming-cyan" />
                </div>
                <div className="text-lg font-bold text-white mb-0.5">{formatCurrency(summary.totalRevenue)}</div>
                <div className="text-gray-400 text-sm">Doanh thu tháng này</div>
              </div>
              <div className="transition-all rounded-xl shadow-lg bg-gaming-dark border border-gaming-cyan/20 hover:shadow-xl hover:border-gaming-cyan/60 flex flex-col items-center py-4 group">
                <div className="bg-gradient-to-br from-gaming-cyan to-gaming-purple rounded-full p-2 mb-2 group-hover:scale-105 transition-transform">
                  <ShoppingCart className="w-7 h-7 text-white" />
                </div>
                <div className="text-lg font-bold text-white mb-0.5">{summary.orderCount?.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Đơn hàng</div>
              </div>
              <div className="transition-all rounded-xl shadow-lg bg-gaming-dark border border-gaming-cyan/20 hover:shadow-xl hover:border-gaming-cyan/60 flex flex-col items-center py-4 group">
                <div className="bg-gradient-to-br from-gaming-purple to-gaming-red rounded-full p-2 mb-2 group-hover:scale-105 transition-transform">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="text-lg font-bold text-white mb-0.5">{summary.newCustomers?.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Khách hàng mới</div>
              </div>
              <div className="transition-all rounded-xl shadow-lg bg-gaming-dark border border-gaming-cyan/20 hover:shadow-xl hover:border-gaming-cyan/60 flex flex-col items-center py-4 group">
                <div className="bg-gradient-to-br from-gaming-red to-gaming-gold rounded-full p-2 mb-2 group-hover:scale-105 transition-transform">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div className="text-lg font-bold text-white mb-0.5">{summary.productCount?.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Sản phẩm</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Revenue Chart */}
              <Card className="card-hover bg-gaming-dark border border-gaming-cyan/20 rounded-2xl shadow-lg p-2">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gaming-cyan mb-2">Doanh thu 7 tháng gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                  {(!summary.revenueData || summary.revenueData.every((d: any) => !d.revenue)) ? (
                    <div className="text-gray-400 text-center py-12">Không có dữ liệu doanh thu.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={summary.revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis 
                          stroke="#888" 
                          tickFormatter={v => v >= 1e7 ? (v/1e6).toFixed(0) + 'tr' : v.toLocaleString('vi-VN')}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#1A1A2E',
                            border: '1px solid rgba(0,255,255,0.3)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: 16
                          }}
                          formatter={(value, name) => [formatCurrency(value), name === 'revenue' ? 'Doanh thu' : name]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#00FFFF" 
                          strokeWidth={3}
                          dot={{ fill: '#00FFFF', strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Orders Chart */}
              <Card className="card-hover bg-gaming-dark border border-gaming-cyan/20 rounded-2xl shadow-lg p-2">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gaming-cyan mb-2">Số lượng đơn hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  {(!summary.revenueData || summary.revenueData.every((d: any) => !d.orders)) ? (
                    <div className="text-gray-400 text-center py-12">Không có dữ liệu đơn hàng.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={summary.revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#1A1A2E',
                            border: '1px solid rgba(157,0,255,0.3)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: 16
                          }}
                        />
                        <Bar 
                          dataKey="orders" 
                          fill="url(#barGradient)"
                          radius={[6, 6, 0, 0]}
                        />
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#9D00FF" />
                            <stop offset="100%" stopColor="#00FFFF" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Products - REMOVED */}
            {/* <Card className="card-hover bg-gaming-dark border border-gaming-cyan/20 rounded-2xl shadow-lg p-2 mt-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gaming-cyan mb-2">Sản phẩm bán chạy nhất</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(!summary.topProducts || summary.topProducts.length === 0) && (
                    <div className="text-gray-400 text-center py-8">Không có dữ liệu sản phẩm bán chạy.</div>
                  )}
                  {summary.topProducts?.map((product: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gaming-darker rounded-xl border border-gaming-cyan/10 hover:border-gaming-cyan/30 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gaming-cyan to-gaming-purple rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-lg">{product.name}</p>
                          <p className="text-sm text-gray-400">{product.sales} sản phẩm đã bán</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gaming-cyan text-lg">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
