import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Facebook, Twitter, Instagram, Youtube, 
  Mail, Phone, MapPin, CreditCard, Truck, Shield
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0D0D17] text-white border-t border-[#2A2A40]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="/" className="inline-block mb-4">
              <h2 className="text-2xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#9D00FF]">
                ARENA
              </h2>
            </Link>
            <p className="text-gray-400 mb-4">
              Cửa hàng thiết bị gaming và phụ kiện máy tính hàng đầu Việt Nam.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#00FFFF] hover:bg-[#00FFFF]/10 transition-colors">
                <Facebook size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#00FFFF] hover:bg-[#00FFFF]/10 transition-colors">
                <Twitter size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#00FFFF] hover:bg-[#00FFFF]/10 transition-colors">
                <Instagram size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#00FFFF] hover:bg-[#00FFFF]/10 transition-colors">
                <Youtube size={20} />
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-[#00FFFF] transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-[#00FFFF] transition-colors">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-gray-400 hover:text-[#00FFFF] transition-colors">
                  Theo dõi đơn hàng
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-400 hover:text-[#00FFFF] transition-colors">
                  Giỏ hàng
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-[#00FFFF] transition-colors">
                  Tài khoản
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Danh mục</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categories/chuot" className="text-gray-400 hover:text-[#00FFFF] transition-colors">
                  Chuột
                </Link>
              </li>
              <li>
                <Link href="/categories/ban-phim" className="text-gray-400 hover:text-[#00FFFF] transition-colors">
                  Bàn phím
                </Link>
              </li>
              <li>
                <Link href="/categories/tai-nghe" className="text-gray-400 hover:text-[#00FFFF] transition-colors">
                  Tai nghe
                </Link>
              </li>
              <li>
                <Link href="/categories/lot-chuot" className="text-gray-400 hover:text-[#00FFFF] transition-colors">
                  Lót chuột
                </Link>
              </li>
              <li>
                <Link href="/categories/ghe" className="text-gray-400 hover:text-[#00FFFF] transition-colors">
                  Ghế & Bàn
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone size={16} className="text-[#00FFFF] mr-2" />
                <span className="text-gray-400 text-sm">1900 1234</span>
              </div>
              <div className="flex items-center">
                <Mail size={16} className="text-[#00FFFF] mr-2" />
                <span className="text-gray-400 text-sm">support@arena.vn</span>
              </div>
              <div className="flex items-center">
                <MapPin size={16} className="text-[#00FFFF] mr-2" />
                <span className="text-gray-400 text-sm">123 Nguyễn Huệ, Q1, TP.HCM</span>
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="mb-8 bg-[#2A2A40]" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center justify-center md:justify-start bg-[#161625] p-3 rounded-lg">
            <Truck size={24} className="text-[#00FFFF] mr-3" />
            <div>
              <h4 className="font-semibold">Giao hàng toàn quốc</h4>
              <p className="text-sm text-gray-400">Miễn phí từ 500.000đ</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center bg-[#161625] p-3 rounded-lg">
            <CreditCard size={24} className="text-[#9D00FF] mr-3" />
            <div>
              <h4 className="font-semibold">Thanh toán an toàn</h4>
              <p className="text-sm text-gray-400">COD, Chuyển khoản, Thẻ</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center md:justify-end bg-[#161625] p-3 rounded-lg">
            <Shield size={24} className="text-[#00FF66] mr-3" />
            <div>
              <h4 className="font-semibold">Bảo hành chính hãng</h4>
              <p className="text-sm text-gray-400">1-2 năm tùy sản phẩm</p>
            </div>
          </div>
        </div>
        
        <Separator className="mb-8 bg-[#2A2A40]" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} ARENA. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex space-x-4">
            <Link href="/privacy" className="text-gray-400 text-sm hover:text-[#00FFFF] transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className="text-gray-400 text-sm hover:text-[#00FFFF] transition-colors">
              Điều khoản sử dụng
            </Link>
            <Link href="/return" className="text-gray-400 text-sm hover:text-[#00FFFF] transition-colors">
              Chính sách đổi trả
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}