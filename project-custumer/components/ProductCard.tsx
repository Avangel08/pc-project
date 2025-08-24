"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { getColorValue } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, getCartItemKey } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [showColorSelector, setShowColorSelector] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('');
  
  // Giá hiển thị luôn là product.price (đã là giá sau giảm)
  const displayPrice = product.price;
  
  // Determine if product is in stock based on quantity
  const isInStock = product.quantity > 0;
  
  // Get status display text
  const getStatusText = () => {
    if (product.quantity === 0) {
      switch (product.status) {
        case 'sap_ve':
          return 'Sắp về';
        case 'ngung_kinh_doanh':
          return 'Ngừng kinh doanh';
        case 'sap_het':
          return 'Sắp hết';
        case 'het_hang':
          return 'Hết hàng';
        case 'con_hang':
          return 'Còn hàng';
        default:
          return 'Hết hàng';
      }
    }
    if (product.quantity < 10) return 'Sắp hết';
    return 'Còn hàng';
  };

  // Auto-select first color if available
  React.useEffect(() => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0]);
    }
  }, [product.colors, selectedColor]);

  const handleAddToCart = () => {
    if (product.colors && product.colors.length > 0) {
      setShowColorSelector(true);
    } else {
      addToCart(product, 1);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    addToCart(product, 1, color);
    setShowColorSelector(false);
  };


  
  // Tag color mapping
  const tagColorMap: Record<string, string> = {
    'Mới về': 'bg-[#00FF66] text-black',
    'Bán chạy': 'bg-[#9D00FF] text-white',
    'Giảm giá': 'bg-[#FF0033] text-white',
    'Hot': 'bg-[#FF9900] text-white',
    'Limited': 'bg-[#00FFFF] text-black',
  };
  

  
  return (
    <div 
      className="group bg-gradient-to-b from-[#1A1A2E] to-[#161625] rounded-xl overflow-hidden border border-[#2A2A40] transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] hover:border-[#00FFFF]/50 hover:scale-[1.02] hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 md:h-60 overflow-hidden bg-gradient-to-br from-[#0D0D17] to-[#1A1A2E]">
        <Link href={`/products/${product.id}`}>
          <Image 
            src={isHovered && product.images.length > 1 ? product.images[1] : product.images[0]} 
            alt={product.name}
            fill
            className="object-contain p-4 transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {/* Product Tags on top left (above discount badge) */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag: string) => (
                <Badge
                  key={tag}
                  className={`text-xs font-semibold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm ${tagColorMap[tag] || 'bg-[#23234a] text-white'}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {product.discount && product.discount > 0 && (
            <Badge className="bg-gradient-to-r from-[#FF0033] to-[#FF3366] hover:from-[#FF0033] hover:to-[#FF3366] text-white shadow-lg backdrop-blur-sm">Giảm {product.discount}%</Badge>
          )}
          {product.isNew && (
            <Badge className="bg-gradient-to-r from-[#00FF66] to-[#00CC52] hover:from-[#00FF66] hover:to-[#00CC52] text-black shadow-lg backdrop-blur-sm">Mới</Badge>
          )}
          {!isInStock && (
            <Badge className="bg-gradient-to-r from-[#FF6B6B] to-[#FF5252] hover:from-[#FF6B6B] hover:to-[#FF5252] text-white shadow-lg backdrop-blur-sm">Hết hàng</Badge>
          )}
        </div>
        
        {/* Quick actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 transform translate-x-5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
          <Link href={`/products/${product.id}`}>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9 rounded-full bg-gradient-to-r from-[#121212]/90 to-[#1A1A2E]/90 backdrop-blur-md border-[#2A2A40] text-white hover:bg-gradient-to-r hover:from-[#00FFFF] hover:to-[#9D00FF] hover:text-black hover:border-[#00FFFF] transition-all duration-300 hover:scale-110"
            >
              <Eye size={18} />
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="px-4 pt-2 pb-1">
        <Link href={`/products/${product.id}`} className="block mb-0.5 hover:text-[#00FFFF] transition-colors duration-300">
          <h3 className="font-bold text-lg line-clamp-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{product.name}</h3>
        </Link>
        {/* Product Tags */}
        
        {/* Product Code + Quantity */}
        {(product.productCode || product.quantity > 0) && (
          <div className="flex items-center justify-between mb-1">
            {product.productCode ? (
              <p className="text-xs text-muted-foreground">Mã: {product.productCode}</p>
            ) : <span />}
            {product.quantity > 0 && (
              <span className="text-xs text-gray-400 font-medium bg-[#1A1A2E] px-2 py-1 rounded-full">Còn {product.quantity}</span>
            )}
          </div>
        )}
        

        
        <div className="flex items-start justify-between mb-2">
          <div className="flex flex-col">
          <span className="text-lg font-bold">{displayPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
          </div>
        <Button 
          onClick={handleAddToCart}
          disabled={!isInStock}
            className="bg-[#00FFFF] hover:bg-[#00e6e6] text-black font-medium p-2 h-8 w-8 rounded-full"
        >
          {isInStock ? (
              <ShoppingCart size={14} />
          ) : (
              <span className="text-xs">Hết</span>
          )}
        </Button>
        </div>
        
        {/* Status */}
        {/* Đã chuyển lên trên, xóa phần này */}

        {/* Color Selector Modal */}
        {showColorSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#161625] p-6 rounded-lg border border-[#2A2A40] max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">Chọn màu sắc</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {product.colors?.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      selectedColor === color 
                        ? 'border-[#00FFFF] bg-[#00FFFF]/10' 
                        : 'border-[#2A2A40] hover:border-[#00FFFF]/50'
                    }`}
                  >
                    <span 
                      className="w-6 h-6 rounded-full border-2 border-white" 
                      style={{ background: getColorValue(color) }}
                    ></span>
                    <span className="text-xs text-gray-300 text-center">
                      {color}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowColorSelector(false)}
                  variant="outline" 
                  className="flex-1 bg-[#2A2A40] border-[#2A2A40] text-white hover:bg-[#3A3A50]"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedColor) {
                      addToCart(product, 1, selectedColor);
                    }
                    setShowColorSelector(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] text-black"
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}