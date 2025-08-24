"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MailIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import zxcvbn from 'zxcvbn';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setServerOtp(data.otp); // dev mode
        setStep('otp');
        toast({ title: 'OTP đã được gửi (dev)', description: `OTP: ${data.otp}` });
      } else {
        setEmailError(data.error || 'Có lỗi xảy ra');
      }
    } catch {
      setEmailError('Không gửi được OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    const result = zxcvbn(value);
    setPasswordStrength(result.score);
    if (value.length < 8) {
      setPasswordError('Mật khẩu phải có ít nhất 8 ký tự');
    } else if (result.score < 2) {
      setPasswordError('Mật khẩu quá yếu');
    } else {
      setPasswordError('');
    }
    if (confirmPassword && value !== confirmPassword) {
      setConfirmError('Mật khẩu xác nhận không khớp');
    } else {
      setConfirmError('');
    }
  };
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (password !== value) {
      setConfirmError('Mật khẩu xác nhận không khớp');
    } else {
      setConfirmError('');
    }
  };
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
    setOtpError('');
  };
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== serverOtp) {
      setOtpError('OTP không đúng');
      return;
    }
    if (passwordError || confirmError) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Đổi mật khẩu thành công', description: (<span>Bạn có thể đăng nhập lại với mật khẩu mới.<br/><img className="toast-gif" src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExejNyNHl5YTRyYjI0ZWp3aGxkcTY1eHpvdW90ZXBxbzZyank2M3djZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mKHOtvOT8ljlkr3Tsi/giphy.gif" alt="success" /></span>), variant: 'default' });
        setTimeout(() => {
          router.push('/auth');
        }, 1500);
        setStep('email');
        setEmail(''); setOtp(''); setServerOtp(''); setPassword(''); setConfirmPassword('');
      } else {
        toast({ title: 'Đổi mật khẩu thất bại', description: data.error || 'Có lỗi xảy ra', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Lỗi', description: 'Không kết nối được server', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#121212] to-[#1A1A2E] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#9D00FF]">
            GEARHUB
          </h1>
          <p className="mt-2 text-gray-400">Your premium gaming gear destination</p>
        </div>

        <div className="bg-card rounded-lg border border-[#2A2A40] shadow-[0_0_15px_rgba(0,255,255,0.1)]">
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader>
              <Link href="/auth" className="inline-flex items-center text-sm text-[#00FFFF] hover:text-[#9D00FF] transition-colors mb-4">
                <ArrowLeft size={16} className="mr-1" /> Back to login
              </Link>
              <CardTitle className="text-xl font-semibold text-center">Reset your password</CardTitle>
              <CardDescription className="text-center">
                {step === 'email'
                  ? 'Nhập email để nhận mã OTP đặt lại mật khẩu'
                  : 'Nhập mã OTP đã nhận và đặt lại mật khẩu mới'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 'email' && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <MailIcon size={18} />
                      </span>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="name@example.com" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="pl-10 bg-muted/50 border-muted focus:border-[#00FFFF] transition-colors" 
                        required
                      />
                    </div>
                    {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-[#00FFFF] to-[#9D00FF]" disabled={isLoading}>
                    {isLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
                  </Button>
                </form>
              )}
              {step === 'otp' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Mã OTP (dev: {serverOtp})</Label>
                    <Input id="otp" type="text" value={otp} onChange={handleOtpChange} maxLength={6} required />
                    {otpError && <p className="text-xs text-red-500 mt-1">{otpError}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Mật khẩu mới</Label>
                    <div className="relative">
                      <Input id="new-password" type={showPassword ? 'text' : 'password'} value={password} onChange={handlePasswordChange} required />
                      <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                      </button>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className={`h-2 w-24 rounded ${passwordStrength >= 3 ? 'bg-green-500' : passwordStrength === 2 ? 'bg-yellow-400' : 'bg-red-500'}`}></div>
                      <span className="text-xs text-gray-400">
                        {password ? (passwordStrength >= 3 ? 'Mạnh' : passwordStrength === 2 ? 'Trung bình' : 'Yếu') : ''}
                      </span>
                    </div>
                    {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                    <div className="relative">
                      <Input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={handleConfirmPasswordChange} required />
                      <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground">
                        {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                      </button>
                    </div>
                    {confirmError && <p className="text-xs text-red-500 mt-1">{confirmError}</p>}
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-[#00FFFF] to-[#9D00FF]" disabled={!!passwordError || !!confirmError || isLoading}>
                    {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                  </Button>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link 
                  href="/auth" 
                  className="text-[#00FFFF] hover:text-[#9D00FF] transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}