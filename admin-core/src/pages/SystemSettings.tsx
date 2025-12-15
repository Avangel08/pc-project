
import React, { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Settings,
  Store,
  Mail,
  Bell,
  Shield,
  Database,
  Download,
  Upload,
  X
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Switch
} from "@/components/ui/switch";
import { toast } from '@/hooks/use-toast';
import { uploadImage } from '@/lib/api';

export const SystemSettings = () => {
  const [storeName, setStoreName] = useState('Gaming Store VN');
  const [storeAddress, setStoreAddress] = useState('123 Nguyễn Huệ, Q1, TP.HCM');
  const [storePhone, setStorePhone] = useState('0901234567');
  const [storeEmail, setStoreEmail] = useState('contact@gamingstore.vn');

  // State cho payment methods
  const [cod, setCod] = useState(true);
  const [bank, setBank] = useState(true);
  const [ewallet, setEwallet] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle'|'success'|'error'>('idle');
  const [bankQrUrl, setBankQrUrl] = useState('');
  const [uploadingQR, setUploadingQR] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lấy trạng thái payment methods khi vào trang
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setLoadingPayment(true);
      try {
        const res = await fetch('http://localhost:3001/api/settings/payment-methods');
        const data = await res.json();
        setCod(!!data.cod);
        setBank(!!data.bank);
        setEwallet(!!data.ewallet);
        setBankQrUrl(data.bankQrUrl || '');
      } catch (err) {
        // Có thể show toast lỗi
      } finally {
        setLoadingPayment(false);
      }
    };
    fetchPaymentMethods();
  }, []);

  // Hàm upload QR code
  const handleUploadQR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra file có phải ảnh không
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Lỗi',
        description: 'Chỉ cho phép upload file ảnh!',
        variant: 'destructive',
      });
      return;
    }

    setUploadingQR(true);
    try {
      const url = await uploadImage(file);
      setBankQrUrl(url);
      toast({
        title: 'Thành công',
        description: 'Đã upload ảnh QR code thành công!',
      });
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể upload ảnh',
        variant: 'destructive',
      });
    } finally {
      setUploadingQR(false);
      // Reset input để có thể chọn lại file cùng tên
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Hàm xóa QR code
  const handleRemoveQR = () => {
    setBankQrUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Hàm lưu trạng thái payment methods
  const handleSavePaymentMethods = async () => {
    setSaveStatus('idle');
    setLoadingPayment(true);
    try {
      const res = await fetch('http://localhost:3001/api/settings/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cod, bank, ewallet, bankQrUrl })
      });
      if (res.ok) {
        setSaveStatus('success');
        toast({
          title: 'Thành công',
          description: 'Đã lưu cài đặt thanh toán!',
        });
      } else {
        setSaveStatus('error');
        toast({
          title: 'Lỗi',
          description: 'Không thể lưu cài đặt',
          variant: 'destructive',
        });
      }
    } catch (err) {
      setSaveStatus('error');
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu cài đặt',
        variant: 'destructive',
      });
    } finally {
      setLoadingPayment(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const [backupList, setBackupList] = useState<any[]>([]);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [restoring, setRestoring] = useState('');

  // Lấy danh sách backup khi vào tab
  useEffect(() => {
    fetchBackupList();
  }, []);

  const fetchBackupList = async () => {
    setLoadingBackup(true);
    try {
      const res = await fetch('http://localhost:3001/api/backup/list');
      const data = await res.json();
      setBackupList(Array.isArray(data) ? data : []);
    } catch (err) {
      setBackupList([]);
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleCreateBackup = async () => {
    setLoadingBackup(true);
    try {
      const res = await fetch('http://localhost:3001/api/backup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Thành công', description: 'Đã tạo bản sao lưu mới!' });
        fetchBackupList();
      } else {
        toast({ title: 'Lỗi', description: data.error || 'Không thể tạo backup', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Lỗi', description: 'Không thể tạo backup', variant: 'destructive' });
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleRestore = async (file: string) => {
    setRestoring(file);
    try {
      const res = await fetch('http://localhost:3001/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Thành công', description: 'Khôi phục dữ liệu thành công!' });
      } else {
        toast({ title: 'Lỗi', description: data.error || 'Khôi phục thất bại', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Lỗi', description: 'Không thể khôi phục', variant: 'destructive' });
    } finally {
      setRestoring('');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gaming-cyan mb-2">Cài đặt Hệ thống</h1>
            <p className="text-gray-400 mt-1">
              Cấu hình và quản lý các thiết lập hệ thống
            </p>
          </div>
        </div>

        <Tabs defaultValue="store" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gaming-darker">
            <TabsTrigger value="store" className="text-white data-[state=active]:bg-gaming-cyan data-[state=active]:text-black">
              <Store className="w-4 h-4 mr-2" />
              Cửa hàng
            </TabsTrigger>
            {/* Xóa TabsTrigger và TabsContent cho tab Sao lưu & Khôi phục */}
          </TabsList>

          <TabsContent value="store" className="space-y-6">
            {/* Đã xóa phần Thông tin Cửa hàng theo yêu cầu */}
            <Card className="bg-gaming-dark border-gaming-cyan/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold mb-4">Cài đặt Thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Thanh toán COD</p>
                    <p className="text-gray-400 text-sm">Cho phép thanh toán khi nhận hàng</p>
                  </div>
                  <Switch checked={cod} onCheckedChange={setCod} disabled={loadingPayment} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Chuyển khoản ngân hàng</p>
                    <p className="text-gray-400 text-sm">Thanh toán qua chuyển khoản</p>
                  </div>
                  <Switch checked={bank} onCheckedChange={setBank} disabled={loadingPayment} />
                </div>
                {/* Upload ảnh QR code chuyển khoản */}
                {bank && (
                  <div className="space-y-3 mt-4 pt-4 border-t border-gaming-cyan/20">
                    <Label className="text-gray-300 text-sm font-medium">Mã QR chuyển khoản</Label>
                    <div className="flex items-center gap-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleUploadQR}
                        className="hidden"
                        id="qr-upload"
                        disabled={uploadingQR || loadingPayment}
                      />
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingQR || loadingPayment}
                        className="bg-gaming-cyan text-black hover:bg-gaming-cyan/80"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingQR ? 'Đang upload...' : bankQrUrl ? 'Thay đổi ảnh QR' : 'Upload ảnh QR'}
                      </Button>
                      {bankQrUrl && (
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img 
                              src={bankQrUrl} 
                              alt="QR chuyển khoản" 
                              className="w-24 h-24 object-contain border border-gaming-cyan/50 rounded-lg bg-gaming-darker p-2" 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveQR}
                              disabled={loadingPayment}
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="text-gray-400 text-sm">Đã có ảnh QR</span>
                        </div>
                      )}
                    </div>
                    {!bankQrUrl && (
                      <p className="text-gray-500 text-xs">Vui lòng upload ảnh QR code để khách hàng có thể quét thanh toán</p>
                    )}
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSavePaymentMethods} disabled={loadingPayment} className="bg-gaming-cyan text-black hover:bg-gaming-cyan/80">
                    {loadingPayment ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                  {saveStatus === 'success' && <span className="ml-4 text-green-400 self-center">Đã lưu!</span>}
                  {saveStatus === 'error' && <span className="ml-4 text-red-400 self-center">Lỗi khi lưu!</span>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Xóa TabsContent cho tab Sao lưu & Khôi phục */}
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SystemSettings;
