"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Calendar, MapPin, Phone, Mail, User } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  userId?: number;
  isGuest: boolean;
  guestEmail?: string;
  items: any[];
  subtotal: number;
  shipping: number;
  total: number;
  payment: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    province: string;
    district: string;
    address: string;
    note?: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  createdAt: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
    case 'processing':
      return 'bg-yellow-500 text-black';
    case 'shipped':
      return 'bg-blue-500 text-white';
    case 'delivered':
      return 'bg-green-500 text-white';
    case 'cancelled':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Chờ xử lý';
    case 'processing':
      return 'Đang xử lý';
    case 'shipped':
      return 'Đang giao';
    case 'delivered':
      return 'Đã giao';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

export default function TrackOrderPage() {
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !orderId.trim()) {
      setError('Vui lòng nhập đầy đủ email và mã đơn hàng');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await fetch(`/api/orders/track?email=${encodeURIComponent(email)}&orderId=${encodeURIComponent(orderId)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.order) {
          setOrder(data.order);
        } else {
          setError('Không tìm thấy đơn hàng với thông tin đã cung cấp');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Có lỗi xảy ra khi tìm kiếm đơn hàng');
      }
    } catch (error) {
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1A1A2E] text-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#9D00FF]">
            Theo dõi đơn hàng
          </h1>
          <p className="mt-2 text-gray-400">Nhập email và mã đơn hàng để theo dõi trạng thái</p>
        </div>

        <Card className="bg-[#161625] border-[#2A2A40] shadow-[0_0_15px_rgba(0,255,255,0.1)] mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Tìm kiếm đơn hàng</CardTitle>
            <CardDescription>Dành cho khách hàng không có tài khoản</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email đặt hàng</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      type="email"
                      placeholder="Nhập email đã dùng khi đặt hàng"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-[#1A1A2E] border-[#2A2A40] focus:border-[#00FFFF] transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mã đơn hàng</label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      placeholder="Nhập mã đơn hàng (VD: ORDER_123456789)"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="pl-10 bg-[#1A1A2E] border-[#2A2A40] focus:border-[#00FFFF] transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] hover:shadow-[0_0_15px_rgba(157,0,255,0.5)] transition-shadow text-black font-medium disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Đang tìm kiếm...
                  </>
                ) : (
                  <>
                    <Search size={18} className="mr-2" />
                    Tìm kiếm đơn hàng
                  </>
                )}
              </Button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {order && (
          <Card className="bg-[#161625] border-[#2A2A40] shadow-[0_0_15px_rgba(0,255,255,0.1)]">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold">Đơn hàng #{order.id}</CardTitle>
                  <CardDescription className="text-gray-400">
                    Đặt hàng lúc {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusText(order.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Thông tin sản phẩm */}
                <div>
                  <h3 className="font-semibold mb-3 text-[#00FFFF]">Sản phẩm</h3>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-300">{item.product.name}</span>
                        <span className="text-gray-400">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Thông tin khách hàng */}
                <div>
                  <h3 className="font-semibold mb-3 text-[#00FFFF]">Thông tin giao hàng</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span>{order.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <span>{order.customer.phone}</span>
                    </div>
                    {order.customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span>{order.customer.email}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-gray-400 mt-0.5" />
                      <span>{order.customer.address}, {order.customer.district}, {order.customer.province}</span>
                    </div>
                  </div>
                </div>

                {/* Tổng tiền */}
                <div>
                  <h3 className="font-semibold mb-3 text-[#00FFFF]">Tổng tiền</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tạm tính:</span>
                      <span>{order.subtotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vận chuyển:</span>
                      <span>{order.shipping === 0 ? 'Miễn phí' : order.shipping.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t border-[#2A2A40] pt-2">
                      <span>Tổng cộng:</span>
                      <span className="text-[#00FFFF]">{order.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      Thanh toán: {order.payment === 'cod' ? 'Tiền mặt khi nhận hàng' : 
                                 order.payment === 'bank' ? 'Chuyển khoản ngân hàng' : 'Ví điện tử'}
                    </div>
                  </div>
                </div>
              </div>

              {order.customer.note && (
                <div className="mt-6 p-3 bg-[#1A1A2E] rounded-lg">
                  <h4 className="font-semibold text-[#00FFFF] mb-2">Ghi chú:</h4>
                  <p className="text-sm text-gray-300">{order.customer.note}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-8">
          <p className="text-gray-400 mb-4">Bạn có tài khoản? Đăng nhập để xem tất cả đơn hàng</p>
          <Link href="/auth">
            <Button variant="outline" className="border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black transition-colors">
              Đăng nhập
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 