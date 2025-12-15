"use client";
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types/product';
import { ColorDisplay, SelectedColorDisplay } from '@/components/ui/color-display';
import React from 'react';
import { getColorValue } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProductReviews from '@/components/ProductReviews';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');



  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };
  const increaseQuantity = () => setQuantity(quantity + 1);
  const handleAddToCart = () => addToCart(product, quantity, selectedColor);

  // Giá hiển thị luôn là product.price (đã là giá sau giảm)
  const displayPrice = product.price;

  // Determine if product is in stock
  const isInStock = product.quantity > 0;

  // Get status display text
  const getStatusText = () => {
    if (product.quantity === 0) return 'Hết hàng';
    if (product.quantity < 10) return 'Sắp hết';
    return 'Còn hàng';
  };

  // Auto-select first color if available and no color is selected
  React.useEffect(() => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0]);
    }
  }, [product.colors, selectedColor]);

  // Helper: Lấy tên danh mục từ category
  function categoryName(category: string) {
    return category;
  }
  function categoryUrl(category: string) {
    switch (category) {
      case 'Bàn phím': return 'ban-phim';
      case 'Chuột': return 'chuot';
      case 'Tai nghe': return 'tai-nghe';
      case 'Lót chuột': return 'lot-chuot';
      case 'Mô hình': return 'mo-hinh';
      case 'Ghế': return 'ghe';
      case 'Bàn': return 'ban';
      case 'Decor': return 'decor';
      default: return category;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1A1A2E] text-white pt-24 px-2 md:px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Carousel ảnh */}
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-md aspect-square bg-[#161625] rounded-xl overflow-hidden mb-4">
            {product.images && product.images.length > 0 && (
              <Image
                src={product.images[activeImageIndex]}
                alt={product.name}
                fill
                className="object-contain transition-all duration-300"
                priority
              />
            )}
            {/* Nút chuyển ảnh */}
            {product.images && product.images.length > 1 && (
              <>
                <button onClick={() => setActiveImageIndex((activeImageIndex - 1 + product.images.length) % product.images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 p-2 rounded-full">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={() => setActiveImageIndex((activeImageIndex + 1) % product.images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 p-2 rounded-full">
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
          {/* Thumbnail */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 mt-2 flex-wrap justify-center">
              {product.images.map((img: string, idx: number) => (
                <button key={img} onClick={() => setActiveImageIndex(idx)} className={`w-14 h-14 rounded-lg overflow-hidden border-2 ${activeImageIndex === idx ? 'border-[#00FFFF]' : 'border-[#23234a]'}`}> 
                  <Image src={img} alt={product.name} width={56} height={56} className="object-contain w-full h-full" />
                </button>
              ))}
            </div>
          )}
         
       {/* Đánh giá & Nhận xét - Về lại cột trái */}
         <div className="w-full mt-12">
            <ProductReviews productId={product.id} productName={product.name} />
         </div>
        </div>
        {/* Thông tin sản phẩm */}
        <div className="flex flex-col h-full justify-between">
          {/* Breadcrumb */}
          <div className="mb-3 text-sm text-white flex items-center gap-2">
            <Link href="/" className="hover:text-[#00FFFF]">Trang chủ</Link>
            <span>/</span>
            <Link href={`/categories/${categoryUrl(product.category)}`} className="hover:text-[#00FFFF] capitalize">{categoryName(product.category)}</Link>
            <span>/</span>
            <span className="text-white font-medium">{product.name}</span>
          </div>
          {/* Tên sản phẩm */}
          <h1 className="text-2xl md:text-3xl font-bold mb-2 leading-tight text-[#00FFFF]">{product.name}</h1>
          {/* Mã sản phẩm */}
          <p className="text-xs mb-2 text-[#00FFFF]">Mã: {product.productCode || product.id}</p>
          {/* Giá và badge */}
          <div className="flex items-end gap-3 mb-3 flex-wrap">
            <span className="text-xl font-bold text-[#00FFFF]">
              {displayPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-base text-white/60 line-through">
                {product.oldPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </span>
            )}
            {product.discount && product.discount > 0 && (
              <Badge className="bg-[#FF0033] hover:bg-[#FF0033] text-white">Giảm {product.discount}%</Badge>
            )}
            {product.isNew && (
              <Badge className="bg-[#00FF66] hover:bg-[#00FF66] text-black">Mới</Badge>
            )}
          </div>
          {/* Mô tả */}
          <p className="text-white mb-4 text-sm leading-relaxed">{product.description}</p>
          {/* Chọn màu sắc */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-4">
              <span className="font-medium text-white">Chọn màu sắc:</span>
              <div className="flex gap-2 mt-2 flex-wrap">
                {product.colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`flex flex-col items-center gap-1 p-1 rounded-lg border-2 transition-all ${
                      selectedColor === color 
                        ? 'border-[#00FFFF] bg-[#00FFFF]/10' 
                        : 'border-[#23234a] hover:border-[#00FFFF]/50'
                    }`}
                    style={{ minWidth: 36 }}
                  >
                    <span 
                      className="w-5 h-5 rounded-full border border-white shadow" 
                      style={{ background: getColorValue(color) }}
                      title={color}
                    ></span>
                    <span className="text-[10px] text-white text-center max-w-12 truncate">
                      {color}
                    </span>
                  </button>
                ))}
              </div>
              {selectedColor && (
                <div className="mt-2">
                  <SelectedColorDisplay color={selectedColor} small />
                </div>
              )}
            </div>
          )}
          {/* Số lượng và trạng thái */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
              <span className="font-medium text-white">Số lượng:</span>
              <button onClick={decreaseQuantity} className="px-2 py-1 bg-[#23234a] text-white rounded-l disabled:opacity-50" disabled={quantity <= 1}>-</button>
              <input type="number" min={1} max={product.quantity} value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-16 px-2 py-1 bg-[#161625] border border-[#2A2A40] text-white text-center" />
              <button onClick={increaseQuantity} className="px-2 py-1 bg-[#23234a] text-white rounded-r" disabled={quantity >= product.quantity}>+</button>
            </div>
            <span className={`text-sm text-white`}>{getStatusText()} {isInStock && <span className="text-[#00FFFF]">({product.quantity} sản phẩm)</span>}</span>
          </div>
          {/* Nút hành động */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <Button 
              onClick={handleAddToCart} 
              disabled={!isInStock}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition-colors"
            >
              <ShoppingCart size={20} /> 
              {isInStock ? 'Thêm vào giỏ' : 'Hết hàng'}
            </Button>

          </div>
          {/* Nhà cung cấp */}
          {product.supplier && (
            <div className="mb-4">
              <span className="font-medium text-white">Nhà cung cấp:</span>
              <span className="ml-2 text-white">{product.supplier}</span>
            </div>
          )}
          {/* Thông số kỹ thuật (table) */}
          {product.specs && product.specs.length > 0 && (
            <div className="mb-6">
              <span className="font-medium text-white">Thông số kỹ thuật:</span>
              <table className="w-full mt-2 text-sm border border-[#23234a] rounded-lg overflow-hidden">
                <tbody>
                  {product.specs.map((spec: any, idx: number) => (
                    <tr key={idx} className="border-b border-[#23234a] last:border-b-0">
                      <td className="py-2 px-4 font-medium text-white w-1/3 bg-[#18182c]">{spec.name}</td>
                      <td className="py-2 px-4 text-white">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Policies */}
          <div className="flex flex-wrap gap-6 text-sm text-white mb-8">
            <div className="flex items-center gap-2"><span className="text-[#00FFFF]">↩</span> Đổi trả 7 ngày</div>
            <div className="flex items-center gap-2"><span className="text-[#9D00FF]">🛡</span> Bảo hành 2 năm</div>
            <div className="flex items-center gap-2"><span className="text-[#00FF66]">🚚</span> Giao hàng toàn quốc</div>
          </div>
        </div>
      </div>
      {/* Sản phẩm liên quan */}
      {relatedProducts.length > 0 && (
        <div className="container mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-4 font-orbitron text-white">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 