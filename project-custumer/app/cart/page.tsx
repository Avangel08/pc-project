"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Minus, Plus, Trash2, ArrowLeft, 
  CreditCard, ShieldCheck, Truck, Copy 
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getColorValue, getColorName } from '@/lib/utils';
import ShippingAddressForm, { ShippingInfo } from '@/components/ShippingAddressForm';
import { toast } from '@/hooks/use-toast';


export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart, getCartItemKey } = useCart();
  const { user } = useAuth();
  
  // Debug: Log user data
  console.log('Cart page - User data:', user);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [payment, setPayment] = useState('cod');
  const [customerNote, setCustomerNote] = useState('');
  const [formError, setFormError] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // State đồng bộ dữ liệu form địa chỉ nhận hàng
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: '',
    email: '',
    phone: '',
    province: '',
    provinceName: '',
    district: '',
    districtName: '',
    address: '',
  });

  // State cho trạng thái payment methods
  const [paymentMethods, setPaymentMethods] = useState({ cod: true, bank: true, ewallet: false, bankQrUrl: '' });
  const [loadingPayment, setLoadingPayment] = useState(true);

  // Log shippingInfo mỗi khi thay đổi để debug
  useEffect(() => {
    console.log('ShippingInfo:', shippingInfo);
  }, [shippingInfo]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setLoadingPayment(true);
      try {
        const res = await fetch('http://localhost:3001/api/settings/payment-methods');
        const data = await res.json();
        setPaymentMethods({
          cod: !!data.cod,
          bank: !!data.bank,
          ewallet: !!data.ewallet,
          bankQrUrl: data.bankQrUrl || ''
        });
        // Nếu phương thức hiện tại bị tắt thì chọn phương thức đầu tiên còn bật
        if (!data[payment]) {
          if (data.cod) setPayment('cod');
          else if (data.bank) setPayment('bank');
          else if (data.ewallet) setPayment('e-wallet');
        }
      } catch (err) {
        // Có thể show toast lỗi
      } finally {
        setLoadingPayment(false);
      }
    };
    fetchPaymentMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuantityChange = (productId: string, newQuantity: number, selectedColor?: string) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity, selectedColor);
    }
  };

  const handleRemoveItem = (productId: string, selectedColor?: string) => {
    removeFromCart(productId, selectedColor);
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping - discount;

  // Auto-fill shipping info for logged-in users with address
  useEffect(() => {
    if (user && user.address) {
      console.log('Auto-filling shipping info for user:', user);
      // Parse address to fill shipping form
      const addressParts = user.address.split(',').map(s => s.trim());
      console.log('Address parts:', addressParts);
      
      if (addressParts.length >= 3) {
        // Find province and district codes by name
        const findProvinceCode = async () => {
          try {
            const provincesResponse = await fetch('https://provinces.open-api.vn/api/p/');
            const provinces = await provincesResponse.json();
            const provinceName = addressParts[addressParts.length - 1]; // "Tỉnh Bắc Giang"
            console.log('Looking for province:', provinceName);
            
            const province = provinces.find((p: any) => {
              const match1 = p.name === provinceName;
              const match2 = p.name.includes(provinceName.replace(/^Tỉnh |^Thành phố /, ''));
              const match3 = provinceName.includes(p.name.replace(/^Tỉnh |^Thành phố /, ''));
              return match1 || match2 || match3;
            });
            
            console.log('Found province:', province);
            
            if (province) {
              const districtsResponse = await fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`);
              const provinceData = await districtsResponse.json();
              const districtName = addressParts[addressParts.length - 2]; // "Huyện Lục Nam"
              console.log('Looking for district:', districtName);
              
              const district = provinceData.districts?.find((d: any) => {
                const match1 = d.name === districtName;
                const match2 = d.name.includes(districtName.replace(/^Huyện |^Thành phố |^Thị xã /, ''));
                const match3 = districtName.includes(d.name.replace(/^Huyện |^Thành phố |^Thị xã /, ''));
                return match1 || match2 || match3;
              });
              
              console.log('Found district:', district);
              
              setShippingInfo(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: addressParts[0] || '',
                province: province.code,
                provinceName: province.name,
                district: district?.code || '',
                districtName: district?.name || addressParts[addressParts.length - 2],
              }));
              
              console.log('Auto-filled shipping info with codes:', {
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: addressParts[0],
                province: province.code,
                provinceName: province.name,
                district: district?.code,
                districtName: district?.name,
              });
            }
          } catch (error) {
            console.error('Error finding province/district codes:', error);
            // Fallback: just set names without codes
            setShippingInfo(prev => ({
              ...prev,
              name: user.name || '',
              email: user.email || '',
              phone: user.phone || '',
              address: addressParts[0] || '',
              provinceName: addressParts[addressParts.length - 1] || '',
              districtName: addressParts[addressParts.length - 2] || '',
            }));
          }
        };
        
        findProvinceCode();
      }
    }
  }, [user]);

  // Validate form
  const validateForm = () => {
    if (!shippingInfo.name.trim()) return 'Vui lòng nhập họ tên.';
    if (!shippingInfo.phone.trim()) return 'Vui lòng nhập số điện thoại.';
    if (!/^\d{9,11}$/.test(shippingInfo.phone.trim())) return 'Số điện thoại không hợp lệ.';
    if (!shippingInfo.province || !shippingInfo.district) return 'Vui lòng chọn tỉnh/thành và quận/huyện.';
    if (!shippingInfo.address.trim()) return 'Vui lòng nhập địa chỉ nhận hàng.';
    if (shippingInfo.email && !/^\S+@\S+\.\S+$/.test(shippingInfo.email.trim())) return 'Email không hợp lệ.';
    return '';
  };

  const handleCheckout = async () => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }
    setFormError('');
    console.log('Đặt hàng với promotionCode:', appliedPromo);
    const order = {
      items: cart,
      subtotal,
      shipping,
      total,
      payment,
      customer: {
        name: shippingInfo.name,
        phone: shippingInfo.phone,
        email: shippingInfo.email,
        province: shippingInfo.provinceName,
        district: shippingInfo.districtName,
        address: shippingInfo.address,
        note: customerNote,
      },
      date: new Date().toLocaleString('vi-VN'),
      ...(appliedPromo ? { promotionCode: appliedPromo } : {}),
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      const data = await res.json();
      if (data.success) {
        setOrderInfo(order);
        setOrderId(data.orderId || null);
        setShowSuccess(true);
        clearCart();
        setDiscount(0);
        setAppliedPromo(null);
      } else {
        setFormError('Có lỗi khi gửi đơn hàng: ' + (data.error || ''));
      }
    } catch (err: any) {
      setFormError('Không thể gửi đơn hàng: ' + err.message);
    }
  };

  // Hàm áp dụng mã giảm giá
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập mã giảm giá', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/api/promotions/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim(), total: subtotal })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDiscount(data.discount);
        setAppliedPromo(promoCode.trim());
        toast({ title: 'Thành công', description: `Áp dụng mã giảm giá thành công! Được giảm ${data.discount.toLocaleString('vi-VN')}đ` });
      } else {
        setDiscount(0);
        setAppliedPromo(null);
        toast({ title: 'Lỗi', description: data.error || 'Mã giảm giá không hợp lệ', variant: 'destructive' });
      }
    } catch (err) {
      setDiscount(0);
      setAppliedPromo(null);
      toast({ title: 'Lỗi', description: 'Không thể kiểm tra mã giảm giá', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1A1A2E] text-white py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mt-4 mb-6">Giỏ hàng</h1>
        {cart.length === 0 ? (
          <div className="text-center py-16 bg-[#161625] rounded-lg border border-[#2A2A40]">
            <h2 className="text-2xl font-semibold mb-4">Giỏ hàng của bạn đang trống</h2>
            <p className="text-gray-400 mb-8">Hãy thêm các sản phẩm gaming tuyệt vời vào giỏ!</p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] hover:shadow-[0_0_15px_rgba(157,0,255,0.5)] transition-shadow text-black font-medium">
                Xem sản phẩm
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start h-full">
            {/* Cột trái: Danh sách sản phẩm */}
            <div className="lg:col-span-3 space-y-4">
              {cart.map((item) => (
                <div 
                  key={getCartItemKey(item.product.id, item.selectedColor)} 
                  className="bg-[#161625] rounded-lg border border-[#2A2A40] p-4 flex items-center gap-4"
                >
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-grow">
                    <Link 
                      href={`/products/${item.product.id}`}
                      className="text-lg font-semibold hover:text-[#00FFFF] transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-gray-400">Mã SP: {item.product.productCode}</p>
                    {item.selectedColor && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-400">Màu:</span>
                        <div className="flex items-center gap-1">
                          <span 
                            className="w-4 h-4 rounded-full border border-white" 
                            style={{ background: getColorValue(item.selectedColor) }}
                          ></span>
                          <span className="text-sm text-gray-300">
                            {getColorName(getColorValue(item.selectedColor))}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center mt-2">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 bg-[#1A1A2E] hover:bg-[#2A2A40] border-[#2A2A40]"
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1, item.selectedColor)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 bg-[#1A1A2E] hover:bg-[#2A2A40] border-[#2A2A40]"
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1, item.selectedColor)}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-4 text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => handleRemoveItem(item.product.id, item.selectedColor)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {(item.product.price * item.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </div>
                    {(item.product.oldPrice && item.product.oldPrice > item.product.price) && (
                      <div className="text-sm text-gray-400 line-through">
                        {(item.product.oldPrice * item.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Cột phải: Form + Tóm tắt đơn hàng */}
            <div className="lg:col-span-2 flex flex-col gap-6 h-full min-h-[400px]">
              <div className="flex-1 flex flex-col">
                <ShippingAddressForm value={shippingInfo} onChange={setShippingInfo} />
                {formError && (
                  <div className="text-red-500 text-sm mt-2 font-medium px-2">
                    {formError}
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col">
                {/* Tóm tắt đơn hàng */}
                <div className="bg-[#161625] rounded-lg border border-[#2A2A40] p-6 flex-1 flex flex-col">
                  <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tạm tính</span>
                      <span>{subtotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vận chuyển</span>
                      <span>{shipping === 0 ? 'Miễn phí' : shipping.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                    </div>
                    <Separator className="bg-[#2A2A40]" />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Tổng cộng</span>
                      <span>{total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="Mã giảm giá"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="bg-[#1A1A2E] border-[#2A2A40] focus:border-[#00FFFF] transition-colors"
                      />
                      <Button variant="outline" className="bg-[#1A1A2E] hover:bg-[#2A2A40] border-[#2A2A40]" onClick={handleApplyPromo}>
                        Áp dụng
                      </Button>
                    </div>
                    {discount > 0 && (
                      <div className="text-green-400 text-sm mb-2">Đã áp dụng mã <b>{appliedPromo}</b>, giảm <b>{discount.toLocaleString('vi-VN')}đ</b></div>
                    )}
                    <div>
                      <label className="block mb-2 font-medium">Phương thức thanh toán</label>
                      {loadingPayment ? (
                        <div className="text-gray-400">Đang tải phương thức thanh toán...</div>
                      ) : (
                        (paymentMethods.cod || paymentMethods.bank || paymentMethods.ewallet) ? (
                          <>
                            <RadioGroup value={payment} onValueChange={setPayment} className="space-y-2">
                              {paymentMethods.cod && (
                                <label className="flex items-center gap-2 cursor-pointer" htmlFor="cart-cod">
                                  <RadioGroupItem value="cod" id="cart-cod" />
                                  Thanh toán khi nhận hàng (COD)
                                </label>
                              )}
                              {paymentMethods.bank && (
                                <label className="flex items-center gap-2 cursor-pointer" htmlFor="cart-bank">
                                  <RadioGroupItem value="bank" id="cart-bank" />
                                  Chuyển khoản ngân hàng
                                </label>
                              )}
                              {paymentMethods.ewallet && (
                                <label className="flex items-center gap-2 cursor-pointer" htmlFor="cart-ewallet">
                                  <RadioGroupItem value="e-wallet" id="cart-ewallet" />
                                  Ví điện tử (Momo, ZaloPay...)
                                </label>
                              )}
                            </RadioGroup>
                            {/* Hiển thị QR code nếu chọn chuyển khoản và có url */}
                            {payment === 'bank' && paymentMethods.bankQrUrl && (
                              <div className="mt-4 p-4 bg-[#22223a] rounded-lg border border-[#2A2A40] text-center">
                                <div className="mb-2 font-semibold text-lg text-gaming-cyan">Quét mã QR để chuyển khoản</div>
                                <img
                                  src={paymentMethods.bankQrUrl}
                                  alt="QR chuyển khoản"
                                  className="mx-auto w-48 h-48 object-contain border border-[#00FFFF] rounded-lg"
                                />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-red-400">Hiện không có phương thức thanh toán nào khả dụng. Vui lòng liên hệ cửa hàng.</div>
                        )
                      )}
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] hover:shadow-[0_0_15px_rgba(157,0,255,0.5)] transition-shadow text-black font-medium mb-6" onClick={handleCheckout}>
                    Xác nhận đặt hàng
                  </Button>
                  <div className="space-y-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Truck size={18} className="mr-2 text-[#00FFFF]" />
                      Miễn phí vận chuyển cho đơn hàng từ 2.500.000đ
                    </div>
                    <div className="flex items-center">
                      <ShieldCheck size={18} className="mr-2 text-[#9D00FF]" />
                      Thanh toán an toàn với mã hóa SSL
                    </div>
                    <div className="flex items-center">
                      <CreditCard size={18} className="mr-2 text-[#00FF66]" />
                      Hỗ trợ nhiều phương thức thanh toán
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showSuccess && orderId && (
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Đặt hàng thành công!</DialogTitle>
            </DialogHeader>
            <div className="text-center my-4">
              {payment === 'bank' ? (
                <>
                  <div className="text-lg font-semibold mb-2">Nội dung chuyển khoản</div>
                  <div className="flex items-center justify-center gap-2 bg-[#22223a] rounded px-3 py-2 select-all">
                    <span className="font-mono text-base">THANH TOAN {orderId}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`THANH TOAN ${orderId}`);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                      className="ml-2 p-1 rounded hover:bg-[#2A2A40]"
                      title="Copy"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                  {copied && <div className="text-green-400 text-sm mt-2">Đã copy nội dung!</div>}
                  <div className="mt-4 text-gray-400 text-sm">Vui lòng ghi đúng nội dung này khi chuyển khoản để hệ thống tự động xác nhận đơn hàng.</div>
                </>
              ) : (
                <>
                  <div className="text-lg font-semibold mb-2 text-green-400">Đơn hàng đã được đặt thành công!</div>
                  <div className="text-gray-300 mb-4">
                    Mã đơn hàng: <span className="font-mono text-gaming-cyan">{orderId}</span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {payment === 'cod' && 'Chúng tôi sẽ liên hệ với bạn để xác nhận đơn hàng và giao hàng.'}
                    {payment === 'e-wallet' && 'Vui lòng hoàn tất thanh toán qua ví điện tử để xác nhận đơn hàng.'}
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowSuccess(false)} className="w-full">Đóng</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}