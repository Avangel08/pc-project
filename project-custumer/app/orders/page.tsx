"use client";

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Calendar, MapPin, Phone, Mail, User, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  userId: number;
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
  shippingAddress?: string;
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
      return 'Chờ xác nhận';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'processing':
      return 'Đang xử lý';
    case 'shipping':
      return 'Đang giao';
    case 'completed':
      return 'Hoàn thành';
    case 'cancelled':
      return 'Hủy';
    case 'returned':
      return 'Trả hàng';
    default:
      return 'Không xác định';
  }
};

const ADMIN_CORE_API = 'http://localhost:3001/api'; // Đổi lại nếu backend chạy port khác

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    if (user) fetchOrders();
    // eslint-disable-next-line
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Gọi API backend admin-core lấy đơn hàng theo userId
      const response = await fetch(`${ADMIN_CORE_API}/orders/customer/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || data); // tuỳ backend trả về
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // Khi click vào đơn hàng, lấy chi tiết mới nhất từ backend
  const openOrderModal = async (order: Order) => {
    try {
      const res = await fetch(`${ADMIN_CORE_API}/orders/${order.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
      } else {
        setSelectedOrder(order);
      }
    } catch (err) {
      setSelectedOrder(order);
    }
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
    fetchOrders(); // Gọi lại để đồng bộ trạng thái ngoài bảng
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1A1A2E] text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="text-[#00FFFF] hover:text-[#9D00FF]">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#9D00FF]">
                Lịch sử đơn hàng
              </h1>
              <p className="mt-2 text-gray-400">Xem chi tiết các đơn hàng của bạn</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchOrders}
              disabled={loading}
              className="ml-auto border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black transition-colors"
            >
              <RefreshCw size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFFF] mx-auto mb-4"></div>
              <p className="text-gray-400">Đang tải đơn hàng...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-[#161625] rounded-lg border border-[#2A2A40]">
              <Package size={64} className="mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-semibold mb-4">Bạn chưa có đơn hàng nào</h2>
              <p className="text-gray-400 mb-8">Hãy mua sắm để có đơn hàng đầu tiên!</p>
              <Link href="/products">
                <Button className="bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] hover:shadow-[0_0_15px_rgba(157,0,255,0.5)] transition-shadow text-black font-medium">
                  Xem sản phẩm
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="bg-[#161625] border-[#2A2A40] shadow-[0_0_15px_rgba(0,255,255,0.1)]">
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
                            <span>{order.shippingAddress || 'N/A'}, {order.customer.district}, {order.customer.province}</span>
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

                    <div className="mt-6 flex justify-end">
                      <Button 
                        onClick={() => openOrderModal(order)}
                        variant="outline"
                        className="border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black transition-colors"
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Modal chi tiết đơn hàng */}
        <Dialog open={showOrderModal} onOpenChange={closeOrderModal}>
          <DialogContent className="max-w-2xl bg-[#181830] border-[#2A2A40] text-white">
            <DialogHeader>
              <DialogTitle>Chi tiết đơn hàng #{selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Thông tin đơn hàng */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-[#1A1A2E] rounded-lg">
                  <div>
                    <div className="text-sm text-gray-400">Ngày đặt:</div>
                    <div className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Trạng thái:</div>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {getStatusText(selectedOrder.status)}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Phương thức thanh toán:</div>
                    <div className="font-medium">
                      {selectedOrder.payment === 'cod' ? 'Tiền mặt khi nhận hàng' : 
                       selectedOrder.payment === 'bank' ? 'Chuyển khoản ngân hàng' : 'Ví điện tử'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Tổng tiền:</div>
                    <div className="font-medium text-[#00FFFF]">
                      {selectedOrder.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </div>
                  </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div>
                  <h3 className="font-semibold mb-3 text-[#00FFFF]">Sản phẩm đã đặt</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-[#1A1A2E] rounded-lg">
                        <div>
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-sm text-gray-400">Số lượng: {item.quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {(item.product.price * item.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                          </div>
                          <div className="text-sm text-gray-400">
                            {item.product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} x {item.quantity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Thông tin giao hàng */}
                <div>
                  <h3 className="font-semibold mb-3 text-[#00FFFF]">Thông tin giao hàng</h3>
                  <div className="p-4 bg-[#1A1A2E] rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="font-medium">{selectedOrder.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <span>{selectedOrder.customer.phone}</span>
                    </div>
                    {selectedOrder.customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span>{selectedOrder.customer.email}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-gray-400 mt-0.5" />
                      <span>{selectedOrder.shippingAddress || 'N/A'}, {selectedOrder.customer.district}, {selectedOrder.customer.province}</span>
                    </div>
                    {selectedOrder.customer.note && (
                      <div className="mt-3 p-2 bg-[#23234a] rounded text-sm">
                        <span className="text-gray-400">Ghi chú: </span>
                        <span>{selectedOrder.customer.note}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
} 