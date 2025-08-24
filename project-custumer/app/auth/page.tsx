"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeOffIcon, KeyIcon, MailIcon, UserIcon, PhoneIcon, MapPinIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import zxcvbn from 'zxcvbn';

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Thêm state cho kiểm tra email realtime
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailError, setEmailError] = useState('');
  const emailCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  // Thêm state cho xác nhận mật khẩu và kiểm tra độ mạnh
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  // State cho lỗi và touched từng trường login
  const [loginEmailError, setLoginEmailError] = useState('');
  const [loginPasswordError, setLoginPasswordError] = useState('');
  const [loginEmailTouched, setLoginEmailTouched] = useState(false);
  const [loginPasswordTouched, setLoginPasswordTouched] = useState(false);

  // Đăng ký: giữ lại các state và validate cho name, email, password, confirm
  const [nameError, setNameError] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  // Validate login email
  const handleLoginEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLoginForm(prev => ({ ...prev, email: value }));
    if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setLoginEmailError('Email không hợp lệ');
    } else {
      setLoginEmailError('');
    }
  };
  const handleLoginEmailBlur = () => setLoginEmailTouched(true);
  // Validate login password
  const handleLoginPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLoginForm(prev => ({ ...prev, password: value }));
    if (value.length < 8) {
      setLoginPasswordError('Mật khẩu phải có ít nhất 8 ký tự');
    } else {
      setLoginPasswordError('');
    }
  };
  const handleLoginPasswordBlur = () => setLoginPasswordTouched(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await login(loginForm.email, loginForm.password);
      if (result.success) {
        toast({
          title: "Đăng nhập thành công",
          description: (<span>Chào mừng bạn trở lại!<br/><img className="toast-gif" src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExejNyNHl5YTRyYjI0ZWp3aGxkcTY1eHpvdW90ZXBxbzZyank2M3djZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mKHOtvOT8ljlkr3Tsi/giphy.gif" alt="success" /></span>),
        });
        router.push('/');
      } else {
        toast({
          title: "Đăng nhập thất bại",
          description: result.error || "Có lỗi xảy ra",
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast({
        title: "Lỗi",
        description: "Vui lòng đồng ý với điều khoản dịch vụ",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await register(
        registerForm.name,
        registerForm.email,
        registerForm.password,
        registerForm.phone || undefined,
        registerForm.address || undefined
      );
      
      if (result.success) {
        toast({
          title: "Đăng ký thành công",
          description: "Tài khoản đã được tạo thành công!",
        });
        router.push('/');
      } else {
        toast({
          title: "Đăng ký thất bại",
          description: result.error || "Có lỗi xảy ra",
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

  // Hàm kiểm tra email realtime
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegisterForm(prev => ({ ...prev, email: value }));
    setEmailError('');
    setEmailExists(false);
    if (emailCheckTimeout.current) clearTimeout(emailCheckTimeout.current);
    if (!value) return;
    setIsCheckingEmail(true);
    emailCheckTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/register?email=${encodeURIComponent(value)}`);
        const data = await res.json();
        if (data.exists) {
          setEmailExists(true);
          setEmailError('Email đã được sử dụng');
        } else {
          setEmailExists(false);
          setEmailError('');
        }
      } catch {
        setEmailError('Không kiểm tra được email');
      } finally {
        setIsCheckingEmail(false);
      }
    }, 500);
  };

  // Kiểm tra độ mạnh mật khẩu khi nhập
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegisterForm(prev => ({ ...prev, password: value }));
    const result = zxcvbn(value);
    setPasswordStrength(result.score);
    if (value.length < 8) {
      setPasswordError('Mật khẩu phải có ít nhất 8 ký tự');
    } else if (result.score < 2) {
      setPasswordError('Mật khẩu quá yếu');
    } else {
      setPasswordError('');
    }
    // Kiểm tra lại xác nhận mật khẩu
    if (confirmPassword && value !== confirmPassword) {
      setConfirmError('Mật khẩu xác nhận không khớp');
    } else {
      setConfirmError('');
    }
  };

  // Kiểm tra xác nhận mật khẩu
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (registerForm.password !== value) {
      setConfirmError('Mật khẩu xác nhận không khớp');
    } else {
      setConfirmError('');
    }
  };

  // Validate name cho đăng ký
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegisterForm(prev => ({ ...prev, name: value }));
    if (value.trim().length < 2) {
      setNameError('Tên phải có ít nhất 2 ký tự');
    } else {
      setNameError('');
    }
  };
  const handleNameBlur = () => setNameTouched(true);
  const handleEmailBlur = () => setEmailTouched(true);
  const handlePasswordBlur = () => setPasswordTouched(true);
  const handleConfirmBlur = () => setConfirmTouched(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#121212] to-[#1A1A2E] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#9D00FF]">
            GEARHUB
          </h1>
          <p className="mt-2 text-gray-400">Nền tảng thiết bị chơi game cao cấp</p>
        </div>

        <Tabs defaultValue="login" className="w-full" onValueChange={setAuthTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00FFFF]/20 data-[state=active]:to-[#9D00FF]/20 rounded-md">
              Đăng nhập
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00FFFF]/20 data-[state=active]:to-[#9D00FF]/20 rounded-md">
              Đăng ký
            </TabsTrigger>
          </TabsList>

          <div className="bg-card rounded-lg border border-[#2A2A40] shadow-[0_0_15px_rgba(0,255,255,0.1)]">
            <TabsContent value="login">
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-center">Đăng nhập vào tài khoản</CardTitle>
                  <CardDescription className="text-center">Nhập thông tin để truy cập tài khoản của bạn</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <MailIcon size={18} />
                      </span>
                      <Input 
                          id="login-email" 
                        type="email" 
                        placeholder="name@example.com" 
                          value={loginForm.email}
                          onChange={handleLoginEmailChange}
                          onBlur={handleLoginEmailBlur}
                        className="pl-10 bg-muted/50 border-muted focus:border-[#00FFFF] transition-colors" 
                          required
                      />
                        {loginEmailError && loginEmailTouched && <p className="text-xs text-red-500 mt-1">{loginEmailError}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Mật khẩu</Label>
                      <Link 
                        href="/auth/reset-password" 
                        className="text-xs text-[#00FFFF] hover:text-[#9D00FF] transition-colors"
                      >
                        Quên mật khẩu?
                      </Link>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <KeyIcon size={18} />
                      </span>
                      <Input 
                          id="login-password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                          value={loginForm.password}
                          onChange={handleLoginPasswordChange}
                          onBlur={handleLoginPasswordBlur}
                        className="pl-10 bg-muted/50 border-muted focus:border-[#00FFFF] transition-colors" 
                          required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                      </button>
                    </div>
                      {loginPasswordError && loginPasswordTouched && <p className="text-xs text-red-500 mt-1">{loginPasswordError}</p>}
                  </div>
                  <Button 
                      type="submit"
                      disabled={isLoading || !!loginEmailError || !!loginPasswordError}
                      className="w-full bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] hover:shadow-[0_0_15px_rgba(157,0,255,0.5)] transition-shadow text-black font-medium disabled:opacity-50"
                  >
                      {isLoading ? <span className="loader mr-2"></span> : null}
                    Đăng nhập
                  </Button>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-card text-muted-foreground">Hoặc đăng nhập bằng</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="bg-muted/30 hover:bg-muted/50 transition-colors">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z"></path>
                      </svg>
                      GitHub
                    </Button>
                    <Button variant="outline" className="bg-muted/30 hover:bg-muted/50 transition-colors">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 5c1.6 0 3.1.9 3.9 2.3h5.7C20.3 4.4 16.4 2 12 2 7.6 2 3.7 4.4 2.4 7.3h5.7C9 5.9 10.4 5 12 5zm7.5 4.8H19V10h.5c1.4 0 2.5 1.1 2.5 2.5S21.4 15 20 15h-2v-2h2c.3 0 .5-.2.5-.5s-.2-.5-.5-.5H12c-1.1 0-2-.9-2-2s.9-2 2-2h7.5zm-16 0H4V10h-.5C2.1 10 1 11.1 1 12.5S2.1 15 3.5 15h2v-2h-2c-.3 0-.5-.2-.5-.5s.2-.5.5-.5H11c1.1 0 2-.9 2-2s-.9-2-2-2H3.5zm9 5.7c-1.6 0-3.1-.9-3.9-2.3H2.4c1.3 2.9 5.2 5.3 9.6 5.3 4.4 0 8.3-2.4 9.6-5.3h-5.7c-.8 1.4-2.3 2.3-3.9 2.3z"></path>
                      </svg>
                      Google
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-muted-foreground">
                      Chưa có tài khoản?{' '}
                    <button 
                      className="text-[#00FFFF] hover:text-[#9D00FF] transition-colors"
                      onClick={() => setAuthTab('register')}
                    >
                      Đăng ký
                    </button>
                  </p>
                </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-center">Tạo tài khoản mới</CardTitle>
                  <CardDescription className="text-center">Nhập thông tin để tạo tài khoản mới</CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Họ và tên</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <UserIcon size={18} />
                      </span>
                      <Input 
                        id="register-name" 
                          type="text" 
                          placeholder="Họ và tên" 
                          value={registerForm.name}
                          onChange={handleNameChange}
                          onBlur={handleNameBlur}
                        className="pl-10 bg-muted/50 border-muted focus:border-[#00FFFF] transition-colors" 
                          required
                      />
                        {nameError && nameTouched && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <MailIcon size={18} />
                      </span>
                      <Input 
                        id="register-email" 
                        type="email" 
                        placeholder="name@example.com" 
                          value={registerForm.email}
                          onChange={handleEmailChange}
                          onBlur={handleEmailBlur}
                          className="pl-10 bg-muted/50 border-muted focus:border-[#00FFFF] transition-colors" 
                          required
                        />
                        {isCheckingEmail && emailTouched && <p className="text-xs text-blue-400 mt-1">Đang kiểm tra email...</p>}
                        {emailError && emailTouched && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-phone">Số điện thoại (tùy chọn)</Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          <PhoneIcon size={18} />
                        </span>
                        <Input 
                          id="register-phone" 
                          type="tel" 
                          placeholder="0123456789" 
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="pl-10 bg-muted/50 border-muted focus:border-[#00FFFF] transition-colors" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-address">Địa chỉ (tùy chọn)</Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          <MapPinIcon size={18} />
                        </span>
                        <Input 
                          id="register-address" 
                          placeholder="123 Đường ABC, Quận XYZ, TP.HCM" 
                          value={registerForm.address}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, address: e.target.value }))}
                        className="pl-10 bg-muted/50 border-muted focus:border-[#00FFFF] transition-colors" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Mật khẩu</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <KeyIcon size={18} />
                      </span>
                      <Input 
                        id="register-password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                          value={registerForm.password}
                          onChange={handlePasswordChange}
                          onBlur={handlePasswordBlur}
                        className="pl-10 bg-muted/50 border-muted focus:border-[#00FFFF] transition-colors" 
                          required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                      </button>
                    </div>
                      {/* Hiển thị độ mạnh mật khẩu */}
                      <div className="mt-1 flex items-center gap-2">
                        <div className={`h-2 w-24 rounded ${passwordStrength >= 3 ? 'bg-green-500' : passwordStrength === 2 ? 'bg-yellow-400' : 'bg-red-500'}`}></div>
                        <span className="text-xs text-gray-400">
                          {registerForm.password ? (passwordStrength >= 3 ? 'Mạnh' : passwordStrength === 2 ? 'Trung bình' : 'Yếu') : ''}
                        </span>
                      </div>
                      {passwordError && passwordTouched && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Xác nhận mật khẩu</Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          <KeyIcon size={18} />
                        </span>
                        <Input
                          id="register-confirm-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={handleConfirmPasswordChange}
                          onBlur={handleConfirmBlur}
                          className="pl-10 bg-muted/50 border-muted focus:border-[#00FFFF] transition-colors"
                          required
                        />
                      </div>
                      {confirmError && confirmTouched && <p className="text-xs text-red-500 mt-1">{confirmError}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="terms" 
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#9D00FF] focus:ring-[#9D00FF]" 
                    />
                    <Label htmlFor="terms" className="text-sm">
                        Tôi đồng ý với{' '}
                      <Link href="/terms" className="text-[#00FFFF] hover:text-[#9D00FF] transition-colors">
                        Điều khoản dịch vụ
                      </Link>{' '}
                        và{' '}
                      <Link href="/privacy" className="text-[#00FFFF] hover:text-[#9D00FF] transition-colors">
                        Chính sách bảo mật
                      </Link>
                    </Label>
                  </div>
                  <Button 
                      type="submit"
                      disabled={isLoading || emailExists || isCheckingEmail || !!passwordError || !!confirmError || !!nameError}
                      className="w-full bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] hover:shadow-[0_0_15px_rgba(157,0,255,0.5)] transition-shadow text-black font-medium disabled:opacity-50"
                  >
                      {isLoading ? <span className="loader mr-2"></span> : null}
                      Đăng ký
                  </Button>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-muted-foreground">
                      Đã có tài khoản?{' '}
                      <span 
                        className="text-[#00FFFF] hover:text-[#9D00FF] transition-colors cursor-pointer"
                      onClick={() => setAuthTab('login')}
                    >
                        Đăng nhập
                      </span>
                  </p>
                </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      <style jsx global>{`
  .loader {
    border: 2px solid #f3f3f3;
    border-top: 2px solid #00FFFF;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    animation: spin 1s linear infinite;
    display: inline-block;
    vertical-align: middle;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`}</style>
    </div>
  );
}