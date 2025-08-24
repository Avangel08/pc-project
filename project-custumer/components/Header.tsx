"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Search, ShoppingCart, Menu, User, 
  ChevronDown, X, Sun, Moon, Keyboard, 
  MousePointer, Cpu, Armchair, Table, Sparkles, Headphones, Monitor, Brush, RectangleHorizontal
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { getProducts, transformProductData } from '@/lib/api';
import { Product } from '@/types/product';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useCart();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  const isActive = (path: string) => pathname === path;
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data.map(transformProductData));
    });
  }, []);

  // Lấy supplier duy nhất theo category
  useEffect(() => {
    if (hoveredCategory && products.length > 0) {
      const filtered = products.filter((p) => p.category === hoveredCategory);
      const uniqueSuppliers = Array.from(new Set(filtered.map((p) => p.supplier).filter((s): s is string => typeof s === 'string' && s.length > 0)));
      setSuppliers(uniqueSuppliers);
    } else {
      setSuppliers([]);
    }
  }, [hoveredCategory, products]);
  
  const navLinks = [
    { name: 'Trang chủ', href: '/' },
    { 
      name: 'Danh mục', 
      href: '#',
      dropdown: true,
      items: [
        { name: 'Chuột', href: '/categories/chuot', icon: MousePointer },
        { name: 'Bàn phím', href: '/categories/ban-phim', icon: Keyboard },
        { name: 'Lót chuột', href: '/categories/lot-chuot', icon: RectangleHorizontal },
        { name: 'Tai nghe', href: '/categories/tai-nghe', icon: Headphones },
        { name: 'Bàn', href: '/categories/ban', icon: Table },
        { name: 'Ghế', href: '/categories/ghe', icon: Armchair },
        { name: 'Mô hình', href: '/categories/mo-hinh', icon: Sparkles },
        { name: 'Decor', href: '/categories/decor', icon: Monitor },
      ]
    },
    { name: 'Sản phẩm', href: '/products' },
  ];
  
  // Thêm mapping từ tên tiếng Việt sang slug chuẩn
  const categoryNameToSlug: Record<string, string> = {
    'Chuột': 'chuot',
    'Bàn phím': 'ban-phim',
    'Tai nghe': 'tai-nghe',
    'Lót chuột': 'lot-chuot',
    'Mô hình': 'mo-hinh',
    'Ghế': 'ghe',
    'Bàn': 'ban',
    'Decor': 'decor',
  };
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#121212]/95 backdrop-blur-md border-b border-[#2A2A40] shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-xl md:text-2xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#9D00FF]">
              ARENA
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 ml-6">
            {navLinks.map((link) => 
              link.dropdown ? (
                <div key={link.name} className="relative group">
                  <button className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors py-2 px-1 rounded-md hover:bg-[#23234a]/50">
                    <span className="font-medium">{link.name}</span>
                    <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute top-full left-0 pt-2 w-[600px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="bg-[#161625] rounded-lg shadow-xl border border-[#2A2A40] flex overflow-hidden min-h-[220px]">
                      {/* Panel trái: danh mục lớn */}
                      <div className="w-1/3 border-r border-[#2A2A40] bg-[#18182c] py-2">
                      {link.items?.map((item) => (
                          <button
                          key={item.name}
                            className={`flex items-center w-full px-4 py-3 hover:bg-[#23234a] transition-colors text-left ${hoveredCategory === item.name ? 'bg-[#23234a]' : ''}`}
                            onMouseEnter={() => setHoveredCategory(item.name)}
                            onFocus={() => setHoveredCategory(item.name)}
                            onClick={() => router.push(`/categories/${categoryNameToSlug[item.name] || item.name}`)}
                            tabIndex={0}
                        >
                          {item.icon && <item.icon size={18} className="mr-2 text-[#00FFFF]" />}
                          <span>{item.name}</span>
                          </button>
                        ))}
                      </div>
                      {/* Panel phải: supplier động */}
                      <div className="w-2/3 p-4 flex flex-col flex-wrap">
                        {hoveredCategory && suppliers.length > 0 ? (
                          <>
                            <div className="font-semibold text-[#00FFFF] mb-2">Nhà cung cấp</div>
                            <div className="grid grid-cols-2 gap-2">
                              {suppliers.map((supplier) => (
                                <Link
                                  key={supplier}
                                  href={`/categories/${categoryNameToSlug[hoveredCategory!] || hoveredCategory}?supplier=${encodeURIComponent(supplier)}`}
                                  className="text-white hover:text-[#00FFFF] px-2 py-1 rounded transition-colors bg-[#23234a] hover:bg-[#00FFFF]/10"
                                >
                                  {supplier}
                        </Link>
                      ))}
                            </div>
                          </>
                        ) : (
                          <div className="text-muted-foreground italic">Di chuột vào danh mục để xem nhà cung cấp</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  key={link.name}
                  href={link.href}
                  className={`text-gray-300 hover:text-white transition-colors py-2 px-3 rounded-md hover:bg-[#23234a]/50 font-medium ${
                    isActive(link.href) ? 'text-white relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-gradient-to-r after:from-[#00FFFF] after:to-[#9D00FF]' : ''
                  }`}
                >
                  {link.name}
                </Link>
              )
            )}
          </nav>
          
          {/* Desktop Search & Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Tìm kiếm sản phẩm..." 
                className="pl-10 bg-[#23234a]/30 border-[#2A2A40] focus:border-[#00FFFF] transition-colors h-9" 
                value={headerSearch}
                onChange={e => setHeaderSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && headerSearch.trim()) {
                    router.push(`/products?search=${encodeURIComponent(headerSearch.trim())}`);
                  }
                }}
              />
            </div>
            
            {user ? (
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-[#23234a]/50 transition-colors"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <User size={18} className="mr-2" />
                  {user.name}
                </Button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#161625] border border-[#2A2A40] rounded-md shadow-lg z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 text-sm text-gray-300 border-b border-[#2A2A40]">
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-xs">{user.email}</div>
                      </div>
                      <Link href="/profile">
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#23234a] transition-colors">
                          Hồ sơ
                        </button>
                      </Link>
                      <button 
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#23234a] transition-colors"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
            <Link href="/auth">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-[#23234a]/50 transition-colors"
              >
                <User size={18} className="mr-2" />
                Đăng nhập
              </Button>
            </Link>
            )}
            
            <Link href="/cart" className="relative">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-[#23234a]/50 transition-colors"
              >
                <ShoppingCart size={18} />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] text-black text-xs font-bold">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
          
          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-[#23234a]/50 transition-colors"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
            </Button>
            
            <Link href="/cart" className="relative">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-[#23234a]/50 transition-colors"
              >
                <ShoppingCart size={18} />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] text-black text-xs font-bold">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            </Link>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-[#23234a]/50 transition-colors"
                >
                  <Menu size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-[#1A1A2E] border-l border-[#2A2A40]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <Link href="/" className="flex items-center space-x-2">
                      <span className="text-xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#9D00FF]">
                        ARENA
                      </span>
                    </Link>
                  </div>
                  
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input 
                      placeholder="Tìm kiếm sản phẩm..." 
                      className="pl-10 bg-[#23234a]/30 border-[#2A2A40] focus:border-[#00FFFF] transition-colors" 
                    />
                  </div>
                  
                  <nav className="space-y-1">
                    {navLinks.map((link) => 
                      link.dropdown ? (
                        <div key={link.name} className="py-2">
                          <p className="text-sm font-semibold text-muted-foreground mb-2">{link.name}</p>
                          <div className="pl-2 space-y-1 border-l border-[#2A2A40]">
                            {link.items?.map((item) => (
                              <Link 
                                key={item.name}
                                href={item.href}
                                className="flex items-center py-2 px-3 text-gray-300 hover:text-white transition-colors hover:bg-[#2A2A40] rounded"
                              >
                                {item.icon && <item.icon size={18} className="mr-2 text-[#00FFFF]" />}
                                <span>{item.name}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Link 
                          key={link.name}
                          href={link.href}
                          className={`flex items-center py-3 px-2 rounded ${
                            isActive(link.href) 
                              ? 'bg-gradient-to-r from-[#00FFFF]/10 to-[#9D00FF]/10 text-white font-medium' 
                              : 'text-gray-300 hover:text-white hover:bg-[#2A2A40]'
                          } transition-colors`}
                        >
                          {link.name}
                        </Link>
                      )
                    )}
                  </nav>
                  
                  <div className="mt-auto pt-6 border-t border-[#2A2A40]">
                    <Link href="/auth">
                      <Button className="w-full bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] hover:shadow-[0_0_15px_rgba(157,0,255,0.5)] transition-shadow text-black font-medium">
                        <User size={18} className="mr-2" />
                        Đăng nhập / Đăng ký
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* Mobile Search */}
        {mobileSearchOpen && (
          <div className="lg:hidden py-3 px-2 border-t border-[#2A2A40] animate-in fade-in slide-in-from-top duration-300">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Tìm kiếm sản phẩm..." 
                className="pl-10 bg-[#23234a]/30 border-[#2A2A40] focus:border-[#00FFFF] transition-colors" 
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}