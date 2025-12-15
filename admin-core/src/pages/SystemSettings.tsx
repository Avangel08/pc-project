
import React, { useState, useEffect } from 'react';
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
  Upload
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
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setLoadingPayment(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const [backupList, setBackupList] = useState([]);
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
                {/* Thêm input nhập URL QR code chuyển khoản */}
                <div className="flex items-center gap-4 mt-2">
                  <Label htmlFor="bankQrUrl" className="text-gray-300 min-w-[120px]">URL mã QR chuyển khoản</Label>
                  <Input
                    id="bankQrUrl"
                    value={bankQrUrl}
                    onChange={e => setBankQrUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-gaming-darker border-gaming-cyan/30 text-white"
                    disabled={loadingPayment}
                  />
                  {bankQrUrl && (
                    <img src={bankQrUrl} alt="QR chuyển khoản" className="w-16 h-16 object-contain border border-gaming-cyan rounded ml-2" />
                  )}
                </div>
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
