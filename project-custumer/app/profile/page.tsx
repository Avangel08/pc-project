"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserIcon, MailIcon, PhoneIcon, MapPinIcon, CalendarIcon, RefreshCw, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

type OrderType = {
  id: string;
  date: string;
  total: number;
  status: string;
  items: { name: string; qty: number }[];
};

interface Province { 
  code: string; 
  name: string; 
}

interface District { 
  code: string; 
  name: string; 
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // All useState hooks must be called in the same order every time
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [orderHistory, setOrderHistory] = useState<OrderType[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedProvinceName, setSelectedProvinceName] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDistrictName, setSelectedDistrictName] = useState('');
  const [ward, setWard] = useState('');
  const [street, setStreet] = useState('');
  const [didParseAddress, setDidParseAddress] = useState(false);
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Early return after all hooks - moved to end of component
  
  const openOrderModal = (order: OrderType) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  // Validation function
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Họ và tên không được để trống';
    } else if (profileData.name.trim().length < 2) {
      newErrors.name = 'Họ và tên phải có ít nhất 2 ký tự';
    }
    
    if (!profileData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(profileData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (isEditing) {
      if (!selectedProvince) {
        newErrors.province = 'Vui lòng chọn Tỉnh/Thành phố';
      }
      if (!selectedDistrict) {
        newErrors.district = 'Vui lòng chọn Quận/Huyện';
      }
      if (!street.trim()) {
        newErrors.street = 'Số nhà, tên đường không được để trống';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      fetchOrderHistory();
    }
  }, [user]);

  // Debug: Log orderHistory changes
  useEffect(() => {
    console.log('OrderHistory updated:', orderHistory);
  }, [orderHistory]);

  const ADMIN_CORE_API = 'http://localhost:3001/api';

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={14} />;
      case 'confirmed':
      case 'processing':
      case 'shipping':
        return <Package size={14} />;
      case 'completed':
        return <CheckCircle size={14} />;
      case 'cancelled':
      case 'returned':
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'confirmed':
      case 'processing':
      case 'shipping':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled':
      case 'returned':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const fetchOrderHistory = async () => {
    if (!user || !user.id) {
      console.log('User not available');
      setLoadingOrders(false);
      return;
    }
    const userId = user.id;
    setLoadingOrders(true);
    try {
      console.log('Fetching orders for user:', userId);
      const response = await fetch(`${ADMIN_CORE_API}/orders/customer/${userId}`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Orders data:', data);
        
        // Handle different response formats
        const ordersArray = Array.isArray(data) ? data : (data.orders || data.data || []);
        
        const formattedOrders = ordersArray.map((order: any) => ({
          id: order.orderId || order.id || order._id || 'N/A',
          date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A',
          total: order.total || order.totalAmount || 0,
          status: order.status || 'pending',
          items: Array.isArray(order.items) ? order.items.map((item: any) => ({
            name: item.product?.name || item.name || 'Sản phẩm không xác định',
            qty: item.quantity || item.qty || 1
          })) : []
        }));
        
        console.log('Formatted orders:', formattedOrders);
        setOrderHistory(formattedOrders);
      } else {
        console.error('Failed to fetch orders:', response.status, response.statusText);
        setOrderHistory([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to demo data if API fails
      const demoOrders = [
        {
          id: 'ORD001',
          date: new Date().toLocaleDateString('vi-VN'),
          total: 1500000,
          status: 'completed',
          items: [
            { name: 'Chuột gaming RGB', qty: 1 },
            { name: 'Bàn phím cơ', qty: 1 }
          ]
        },
        {
          id: 'ORD002',
          date: new Date(Date.now() - 86400000).toLocaleDateString('vi-VN'),
          total: 2500000,
          status: 'processing',
          items: [
            { name: 'Màn hình 24 inch', qty: 1 }
          ]
        }
      ];
      console.log('Using demo data:', demoOrders);
      setOrderHistory(demoOrders);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch provinces on edit
  useEffect(() => {
    if (isEditing) {
      setLoadingProvinces(true);
      fetch('https://provinces.open-api.vn/api/p/')
        .then(res => res.json())
        .then((data: Province[]) => {
          setProvinces(data);
          setLoadingProvinces(false);
        })
        .catch(() => setLoadingProvinces(false));
    }
  }, [isEditing]);

  // Fetch districts when province changes
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setSelectedDistrict('');
      setSelectedDistrictName('');
      return;
    }
    setLoadingDistricts(true);
    fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
      .then(res => res.json())
      .then((data) => {
        setDistricts((data.districts || []) as District[]);
        setSelectedProvinceName(data.name || '');
        setLoadingDistricts(false);
      })
      .catch(() => setLoadingDistricts(false));
  }, [selectedProvince]);

  // Parse address when editing
  useEffect(() => {
    if (isEditing && profileData.address && provinces.length > 0 && !didParseAddress) {
      const parts = profileData.address.split(',').map(s => s.trim());
      setStreet(parts[0] || '');
      setWard(parts[1] || '');
      setSelectedDistrictName(parts[3] || '');
      setSelectedProvinceName(parts[4] || '');
      if (parts[4]) {
        const foundProvince = provinces.find(p => p.name === parts[4]);
        if (foundProvince) setSelectedProvince(foundProvince.code);
      }
      setDidParseAddress(true);
    }
    if (!isEditing) {
      setSelectedProvince('');
      setSelectedProvinceName('');
      setSelectedDistrict('');
      setSelectedDistrictName('');
      setWard('');
      setStreet('');
      setDidParseAddress(false);
      setErrors({});
    }
  }, [isEditing, profileData.address, provinces]);

  // Parse district from address
  useEffect(() => {
    if (isEditing && profileData.address && districts.length > 0 && !selectedDistrict && didParseAddress) {
      const parts = profileData.address.split(',').map(s => s.trim());
      setSelectedDistrictName(parts[3] || '');
      if (parts[3]) {
        const foundDistrict = districts.find(d => d.name === parts[3]);
        if (foundDistrict) setSelectedDistrict(foundDistrict.code);
      }
    }
  }, [isEditing, profileData.address, districts, didParseAddress]);

  // Reset district when province changes
  useEffect(() => {
    if (didParseAddress) {
      setSelectedDistrict('');
      setSelectedDistrictName('');
    }
  }, [selectedProvince, didParseAddress]);

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Lỗi validation",
        description: "Vui lòng kiểm tra lại thông tin",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      let address = profileData.address;
      if (isEditing) {
        address = [street, ward, selectedDistrictName, selectedProvinceName].filter(Boolean).join(', ');
      }
      
      const response = await fetch(`/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ...profileData, address, isDefaultAddress }),
      });

      if (response.ok) {
        toast({
          title: "Cập nhật thành công",
          description: "Thông tin hồ sơ đã được cập nhật",
        });
        setProfileData(prev => ({
          ...prev,
          address,
        }));
        setIsEditing(false);
        setErrors({});
      } else {
        const data = await response.json();
        toast({
          title: "Cập nhật thất bại",
          description: data.error || "Có lỗi xảy ra",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Early return after all hooks
  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1A1A2E] text-white py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#9D00FF]">
            Hồ sơ cá nhân
          </h1>
          <p className="mt-2 text-gray-400">Quản lý thông tin tài khoản của bạn</p>
        </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Thông tin cá nhân */}
            <div className="flex-1 lg:flex-[2]">
        <Card className="bg-[#161625] border-[#2A2A40] shadow-[0_0_15px_rgba(0,255,255,0.1)]">
          <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <UserIcon size={20} className="text-[#00FFFF]" />
                    Thông tin cá nhân
                  </CardTitle>
            <CardDescription>Xem và cập nhật thông tin tài khoản</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                      <Label htmlFor="name">Họ và tên *</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <UserIcon size={18} />
                  </span>
                  <Input 
                    id="name" 
                    value={profileData.name}
                          onChange={(e) => {
                            setProfileData(prev => ({ ...prev, name: e.target.value }));
                            if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                          }}
                    disabled={!isEditing}
                          className={`pl-10 bg-muted/50 border-muted focus:border-[#00FFFF] transition-colors ${
                            errors.name ? 'border-red-500' : ''
                          }`}
                  />
                </div>
                      {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <MailIcon size={18} />
                  </span>
                  <Input 
                    id="email" 
                    type="email"
                    value={profileData.email}
                          disabled={true}
                    className="pl-10 bg-muted/30 border-muted text-gray-400" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại *</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <PhoneIcon size={18} />
                  </span>
                  <Input 
                    id="phone" 
                    type="tel"
                    value={profileData.phone}
                          onChange={(e) => {
                            setProfileData(prev => ({ ...prev, phone: e.target.value }));
                            if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                          }}
                    disabled={!isEditing}
                          className={`pl-10 bg-muted/50 border-muted focus:border-[#00FFFF] transition-colors ${
                            errors.phone ? 'border-red-500' : ''
                          }`}
                  />
                </div>
                      {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Select 
                                value={selectedProvince} 
                                onValueChange={val => {
                                  setSelectedProvince(val);
                                  if (errors.province) setErrors(prev => ({ ...prev, province: '' }));
                                }}
                              >
                                <SelectTrigger className={`w-full bg-[#181830] border border-[#2A2A40] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#00FFFF] transition-colors ${
                                  errors.province ? 'border-red-500' : ''
                                }`}>
                                  <SelectValue placeholder="Tỉnh/Thành phố *" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingProvinces
                          ? <div className="px-4 py-2 text-gray-400">Đang tải...</div>
                          : provinces.map(p => (
                                        <SelectItem key={p.code} value={p.code}>
                                          {p.name.replace(/^Tỉnh |^Thành phố /, '')}
                                        </SelectItem>
                            ))
                        }
                      </SelectContent>
                    </Select>
                              {errors.province && <p className="text-red-400 text-sm mt-1">{errors.province}</p>}
                            </div>
                            
                            <div>
                    <Select
                      value={selectedDistrict}
                      onValueChange={val => {
                        setSelectedDistrict(val);
                        const found = districts.find(d => d.code === val);
                        setSelectedDistrictName(found ? found.name : '');
                                  if (errors.district) setErrors(prev => ({ ...prev, district: '' }));
                      }}
                      disabled={!selectedProvince || loadingDistricts}
                    >
                                <SelectTrigger className={`w-full bg-[#181830] border border-[#2A2A40] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#00FFFF] transition-colors ${
                                  errors.district ? 'border-red-500' : ''
                                }`}>
                                  <SelectValue placeholder="Quận/Huyện *" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingDistricts
                          ? <div className="px-4 py-2 text-gray-400">Đang tải...</div>
                          : districts.map(d => (
                              <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>
                            ))
                        }
                      </SelectContent>
                    </Select>
                              {errors.district && <p className="text-red-400 text-sm mt-1">{errors.district}</p>}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                      className="w-full bg-[#181830] border border-[#2A2A40] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#00FFFF] transition-colors placeholder:text-gray-400"
                      placeholder="Phường/Xã"
                      value={ward}
                      onChange={e => setWard(e.target.value)}
                    />
                            <Input
                              className={`w-full bg-[#181830] border border-[#2A2A40] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#00FFFF] transition-colors placeholder:text-gray-400 ${
                                errors.street ? 'border-red-500' : ''
                              }`}
                              placeholder="Số nhà, Tên đường *"
                      value={street}
                              onChange={e => {
                                setStreet(e.target.value);
                                if (errors.street) setErrors(prev => ({ ...prev, street: '' }));
                              }}
                    />
                          </div>
                          {errors.street && <p className="text-red-400 text-sm">{errors.street}</p>}
                          
                          <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="default-address" 
                        checked={isDefaultAddress}
                        onChange={(e) => setIsDefaultAddress(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-[#9D00FF] focus:ring-[#9D00FF]" 
                      />
                      <Label htmlFor="default-address" className="text-sm text-gray-300">
                        Đặt làm địa chỉ mặc định khi đặt hàng
                      </Label>
                    </div>
                  </div>
                  ) : (
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                            <MapPinIcon size={18} />
                          </span>
                  <Input 
                    id="address" 
                            value={profileData.address || 'Chưa cập nhật'}
                    disabled={true}
                    className="pl-10 bg-muted/50 border-muted text-gray-400" 
                  />
                        </div>
                )}
              </div>
            </div>

                  {/* Thông tin tài khoản */}
            <div className="space-y-2">
              <Label>Thông tin tài khoản</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CalendarIcon size={16} className="text-[#00FFFF]" />
                  <span className="text-sm text-gray-300">Ngày tạo:</span>
                  <span className="text-sm text-white">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <UserIcon size={16} className="text-[#00FFFF]" />
                  <span className="text-sm text-gray-300">Vai trò:</span>
                  <span className="text-sm text-white capitalize">{user.role}</span>
                </div>
              </div>
            </div>

                  {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        name: user.name || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        address: user.address || ''
                      });
                            setErrors({});
                    }}
                    className="bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    Hủy
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] hover:shadow-[0_0_15px_rgba(157,0,255,0.5)] transition-shadow text-black font-medium disabled:opacity-50"
                  >
                    {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] hover:shadow-[0_0_15px_rgba(157,0,255,0.5)] transition-shadow text-black font-medium"
                >
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
            </div>

            {/* Thống kê nhanh */}
            <div className="flex-1 lg:flex-[1] space-y-6">
              <Card className="bg-[#161625] border-[#2A2A40] shadow-[0_0_15px_rgba(0,255,255,0.1)]">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Thống kê</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Package size={16} className="text-[#00FFFF]" />
                      <span className="text-sm">Tổng đơn hàng</span>
                    </div>
                    <span className="text-lg font-bold text-[#00FFFF]">{orderHistory.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-sm">Đã hoàn thành</span>
                    </div>
                    <span className="text-lg font-bold text-green-400">
                      {orderHistory.filter(o => o.status === 'completed').length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-yellow-400" />
                      <span className="text-sm">Đang xử lý</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-400">
                      {orderHistory.filter(o => ['pending', 'confirmed', 'processing', 'shipping'].includes(o.status)).length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#161625] border-[#2A2A40] shadow-[0_0_15px_rgba(0,255,255,0.1)]">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Hành động nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/orders">
                    <Button variant="outline" className="w-full border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black transition-colors">
                      Xem tất cả đơn hàng
                    </Button>
                  </Link>
                  <Link href="/cart">
                    <Button variant="outline" className="w-full border-[#9D00FF] text-[#9D00FF] hover:bg-[#9D00FF] hover:text-black transition-colors">
                      Giỏ hàng
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Lịch sử đơn hàng */}
        <Card className="bg-[#161625] border-[#2A2A40] shadow-[0_0_15px_rgba(0,255,255,0.1)] mt-8">
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Package size={20} className="text-[#00FFFF]" />
                  Lịch sử đơn hàng
                </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchOrderHistory}
                  disabled={loadingOrders}
                  className="border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black transition-colors"
                >
                  <RefreshCw size={16} className={`mr-1 ${loadingOrders ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
                <Link href="/orders">
                  <Button variant="outline" size="sm" className="border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black transition-colors">
                    Xem tất cả
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingOrders ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FFFF] mx-auto"></div>
                  <p className="text-gray-400 mt-2">Đang tải lịch sử đơn hàng...</p>
                </div>
            ) : orderHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Package size={48} className="text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Bạn chưa có đơn hàng nào.</p>
                  <Link href="/products">
                    <Button className="mt-4 bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] hover:shadow-[0_0_15px_rgba(157,0,255,0.5)] transition-shadow text-black font-medium">
                      Mua sắm ngay
                    </Button>
                  </Link>
                </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                      <tr className="text-[#00FFFF] border-b border-[#2A2A40]">
                        <th className="px-3 py-3 text-left">Mã đơn</th>
                        <th className="px-3 py-3 text-left">Ngày</th>
                        <th className="px-3 py-3 text-left">Tổng tiền</th>
                        <th className="px-3 py-3 text-left">Trạng thái</th>
                        <th className="px-3 py-3 text-left">Sản phẩm</th>
                    </tr>
                  </thead>
                  <tbody>
                      {orderHistory.slice(0, 5).map((order: OrderType) => (
                        <tr key={order.id} className="border-b border-[#2A2A40] hover:bg-muted/20 transition-colors">
                          <td className="px-3 py-3">
                            <span 
                              className="font-mono cursor-pointer text-[#00FFFF] underline hover:text-[#9D00FF] transition-colors"
                              onClick={() => openOrderModal(order)}
                            >
                              {order.id}
                          </span>
                        </td>
                          <td className="px-3 py-3">{order.date}</td>
                          <td className="px-3 py-3 font-medium">
                            {order.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                          </td>
                          <td className="px-3 py-3">
                            <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {getStatusText(order.status)}
                            </Badge>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1">
                              {order.items.slice(0, 2).map((item: { name: string; qty: number }, idx: number) => (
                                <span key={idx} className="inline-block bg-[#23234a] px-2 py-1 rounded text-xs">
                              {item.name} x{item.qty}
                            </span>
                          ))}
                              {order.items.length > 2 && (
                                <span className="inline-block bg-[#23234a] px-2 py-1 rounded text-xs text-gray-400">
                                  +{order.items.length - 2} sản phẩm khác
                                </span>
                              )}
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                  
                  {orderHistory.length > 5 && (
                    <div className="text-center mt-4">
                      <Link href="/orders">
                        <Button variant="outline" className="border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black transition-colors">
                          Xem tất cả {orderHistory.length} đơn hàng
                        </Button>
                      </Link>
                    </div>
                  )}
              </div>
              )}
          </CardContent>
        </Card>
            </div>

      {/* Modal chi tiết đơn hàng */}
      <Dialog open={showOrderModal} onOpenChange={closeOrderModal}>
        <DialogContent className="max-w-md bg-[#181830] border-[#2A2A40] text-white">
          <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package size={20} className="text-[#00FFFF]" />
                Chi tiết đơn hàng
              </DialogTitle>
            <DialogDescription>Mã đơn: {selectedOrder?.id}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Ngày đặt:</p>
                    <p className="font-medium">{selectedOrder.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tổng tiền:</p>
                    <p className="font-medium text-[#00FFFF]">
                      {selectedOrder.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">Trạng thái:</p>
                  <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {getStatusText(selectedOrder.status)}
                  </Badge>
                </div>
                
              <div>
                  <p className="text-sm text-gray-400 mb-2">Sản phẩm:</p>
                  <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-muted/20 rounded">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm text-[#00FFFF]">x{item.qty}</span>
                      </div>
                  ))}
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