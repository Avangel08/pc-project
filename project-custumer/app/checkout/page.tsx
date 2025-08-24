"use client";
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';

export default function CheckoutPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    payment: 'cod',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // State cho trạng thái payment methods
  const [paymentMethods, setPaymentMethods] = useState({ cod: true, bank: true, ewallet: false });
  const [loadingPayment, setLoadingPayment] = useState(true);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setLoadingPayment(true);
      try {
        const res = await fetch('http://localhost:3001/api/settings/payment-methods');
        const data = await res.json();
        setPaymentMethods({
          cod: !!data.cod,
          bank: !!data.bank,
          ewallet: !!data.ewallet
        });
        // Nếu phương thức hiện tại bị tắt thì chọn phương thức đầu tiên còn bật
        if (!data[form.payment]) {
          if (data.cod) setForm(f => ({ ...f, payment: 'cod' }));
          else if (data.bank) setForm(f => ({ ...f, payment: 'bank' }));
          else if (data.ewallet) setForm(f => ({ ...f, payment: 'e-wallet' }));
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

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    // Gửi thêm userId nếu user đã đăng nhập
    const orderData = {
      ...form,
      userId: user?.id || null,
    };
    // TODO: Gửi orderData lên backend (fetch/post)
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1A1A2E] text-white pt-24 px-4">
      <div className="container mx-auto max-w-lg">
        <h1 className="text-3xl font-bold font-orbitron mb-6">Thanh toán</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-[#161625] p-6 rounded-lg border border-[#2A2A40]">
          <div>
            <label className="block mb-1 font-medium">Họ và tên</label>
            <Input name="name" value={form.name} onChange={handleChange} required placeholder="Nhập họ tên..." />
          </div>
          <div>
            <label className="block mb-1 font-medium">Số điện thoại</label>
            <Input name="phone" value={form.phone} onChange={handleChange} required placeholder="Nhập số điện thoại..." />
          </div>
          <div>
            <label className="block mb-1 font-medium">Địa chỉ giao hàng</label>
            <Input name="address" value={form.address} onChange={handleChange} required placeholder="Nhập địa chỉ..." />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <Input name="email" value={form.email} onChange={handleChange} required placeholder="Nhập email..." />
          </div>
          <div>
            <label className="block mb-2 font-medium">Phương thức thanh toán</label>
            {loadingPayment ? (
              <div className="text-gray-400">Đang tải phương thức thanh toán...</div>
            ) : (
              (paymentMethods.cod || paymentMethods.bank || paymentMethods.ewallet) ? (
                <RadioGroup value={form.payment} onValueChange={val => setForm(f => ({ ...f, payment: val }))} className="space-y-2">
                  {paymentMethods.cod && (
                    <label className="flex items-center gap-2 cursor-pointer" htmlFor="cod">
                      <RadioGroupItem value="cod" id="cod" />
                      Thanh toán khi nhận hàng (COD)
                    </label>
                  )}
                  {paymentMethods.bank && (
                    <label className="flex items-center gap-2 cursor-pointer" htmlFor="bank">
                      <RadioGroupItem value="bank" id="bank" />
                      Chuyển khoản ngân hàng
                    </label>
                  )}
                  {paymentMethods.ewallet && (
                    <label className="flex items-center gap-2 cursor-pointer" htmlFor="e-wallet">
                      <RadioGroupItem value="e-wallet" id="e-wallet" />
                      Ví điện tử (Momo, ZaloPay...)
                    </label>
                  )}
                </RadioGroup>
              ) : (
                <div className="text-red-400">Hiện không có phương thức thanh toán nào khả dụng. Vui lòng liên hệ cửa hàng.</div>
              )
            )}
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] text-black font-medium">Xác nhận đặt hàng</Button>
        </form>
      </div>
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đặt hàng thành công!</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div><b>Khách hàng:</b> {form.name}</div>
            <div><b>Địa chỉ:</b> {form.address}</div>
            <div><b>Phương thức thanh toán:</b> {form.payment === 'cod' ? 'COD' : form.payment === 'bank' ? 'Chuyển khoản' : 'Ví điện tử'}</div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSuccess(false)} className="w-full bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] text-black">Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 