"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Star } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import ProductRowCarousel from '@/components/ProductRowCarousel';
import Banner from '@/components/Banner';
import { useEffect, useState } from 'react';
import { getProducts, transformProductData } from '@/lib/api';
import { Product } from '@/types/product';

export default function Home() {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then((data) => {
      const products = data.map(transformProductData);
      setAllProducts(products);
      // Lọc sản phẩm có tag 'Bán chạy'
      const bestSellerProducts = products.filter(
        (p) => Array.isArray(p.tags) && p.tags.includes('Bán chạy')
      );
      setBestSellers(bestSellerProducts.slice(0, 8));
    });
  }, []);

  // Lọc sản phẩm theo từng danh mục (dùng key tiếng Việt)
  const categories = [
    { key: 'Chuột', label: 'Chuột' },
    { key: 'Bàn phím', label: 'Bàn phím' },
    { key: 'Lót chuột', label: 'Lót chuột' },
    { key: 'Tai nghe', label: 'Tai nghe' },
    { key: 'Bàn', label: 'Bàn' },
    { key: 'Ghế', label: 'Ghế' },
    { key: 'Mô hình', label: 'Mô hình' },
    { key: 'Decor', label: 'Decor' },
  ];

  const getProductsByCategory = (cat: string) =>
    allProducts.filter((p) => p.category === cat);

  // Thêm mapping cho icon, image, href cho từng danh mục (icon đúng chuẩn lucide-react)
  const categoryMeta: Record<string, { label: string; image: string; href: string; icon: string }> = {
    'Chuột': {
      label: 'Chuột',
      image: 'https://uk.ghostkeyboards.com/cdn/shop/files/TMNT_M3_Scenario_Top2-Edited.webp?v=1735338202&width=800',
      href: '/categories/chuot',
      icon: 'MousePointer',
    },
    'Bàn phím': {
      label: 'Bàn phím',
      image: 'https://uk.ghostkeyboards.com/cdn/shop/files/TMNT_K68_Donnie_Mag_Switches_WASD-Edited.webp?v=1747337397&width=800',
      href: '/categories/ban-phim',
      icon: 'Keyboard',
    },
    'Lót chuột': {
      label: 'Lót chuột',
      image: 'https://uk.ghostkeyboards.com/cdn/shop/files/TMNT_Deskpad_Scenarios_Top-Edited_33b25cf0-339d-48f2-b4cf-e2b567befa32.webp?v=1735338210&width=1800',
      href: '/categories/lot-chuot',
      icon: 'RectangleHorizontal', // Đúng là icon hình chữ nhật
    },
    'Tai nghe': {
      label: 'Tai nghe',
      image: 'https://tainghe.com.vn/media/product/5855_tai_nghe_moondrop_may_xuan_vu_audio_15.jpg',
      href: '/categories/tai-nghe',
      icon: 'Headphones',
    },
    'Bàn': {
      label: 'Bàn',
      image: 'https://noithatfufutech.com/upload/sanpham/1-9214.jpg',
      href: '/categories/ban',
      icon: 'Table',
    },
    'Ghế': {
      label: 'Ghế',
      image: 'https://noithatfufutech.com/upload/sanpham/ghe-cong-thai-hoc-fufutech-evel7-2099.jpg',
      href: '/categories/ghe',
      icon: 'Armchair',
    },
    'Mô hình': {
      label: 'Mô hình',
      image: 'https://lacdau.com/media/product/6119-1.jpg',
      href: '/categories/mo-hinh',
      icon: 'Sparkles',
    },
    'Decor': {
      label: 'Decor',
      image: 'https://lacdau.com/media/product/2013-f880629b4394112f346f906c11ef3a59.png',
      href: '/categories/decor',
      icon: 'Monitor',
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1A1A2E] text-white">
      {/* Hero Banner */}
      <Banner position="hero" />

      {/* Categories Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-2 font-orbitron">Danh mục sản phẩm</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-[#00FFFF] to-[#9D00FF]"></div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.slice(0, 4).map((cat) => {
              const meta = categoryMeta[cat.key];
              return (
          <CategoryCard 
                  key={cat.key}
                  title={meta.label}
                  image={meta.image}
                  href={meta.href}
                  icon={meta.icon}
                />
              );
            })}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.slice(4, 8).map((cat) => {
              const meta = categoryMeta[cat.key];
              return (
          <CategoryCard 
                  key={cat.key}
                  title={meta.label}
                  image={meta.image}
                  href={meta.href}
                  icon={meta.icon}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Promotion Banner */}
      <Banner position="promotion" />

      {/* Best Sellers Section */}
      <section className="py-16 bg-[#0D0D17]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2 font-orbitron">Bán chạy nhất</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-[#00FFFF] to-[#9D00FF]"></div>
            </div>
            <Link href="/products" className="flex items-center text-[#00FFFF] hover:text-[#9D00FF] transition-colors duration-300">
              Xem tất cả <ChevronRight size={16} />
            </Link>
          </div>
          <div className="w-full">
            <ProductRowCarousel products={bestSellers} />
          </div>
        </div>
      </section>

      {/* Category Carousels */}
      {categories.map((cat) => {
        const products = getProductsByCategory(cat.key);
        return (
          <section key={cat.key} className="py-10 bg-[#161625] border-t border-[#23234a]">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold mb-1 font-orbitron">{cat.label}</h2>
                  <div className="h-1 w-16 bg-gradient-to-r from-[#00FFFF] to-[#9D00FF]"></div>
                </div>
                <Link href={`/categories/${cat.key}`} className="flex items-center text-[#00FFFF] hover:text-[#9D00FF] transition-colors duration-300 text-sm">
                  Xem tất cả <ChevronRight size={14} />
              </Link>
            </div>
              {products.length > 0 ? (
                <ProductRowCarousel products={products} />
              ) : (
                <div className="text-center text-gray-400 py-8">Chưa có sản phẩm</div>
              )}
        </div>
      </section>
        );
      })}

      {/* Feature Section */}
      <section className="py-16 bg-[#0D0D17]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 border border-gray-800 rounded-lg bg-[#161625] hover:border-[#00FFFF] transition-colors duration-300">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-[#00FFFF]/10 rounded-full">
                <svg className="w-8 h-8 text-[#00FFFF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Miễn phí vận chuyển</h3>
              <p className="text-gray-400">Cho mọi đơn hàng từ 2.500.000đ</p>
            </div>
            <div className="text-center p-6 border border-gray-800 rounded-lg bg-[#161625] hover:border-[#9D00FF] transition-colors duration-300">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-[#9D00FF]/10 rounded-full">
                <svg className="w-8 h-8 text-[#9D00FF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Bảo hành 2 năm</h3>
              <p className="text-gray-400">Áp dụng cho mọi thiết bị chơi game</p>
            </div>
            <div className="text-center p-6 border border-gray-800 rounded-lg bg-[#161625] hover:border-[#00FF66] transition-colors duration-300">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-[#00FF66]/10 rounded-full">
                <svg className="w-8 h-8 text-[#00FF66]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Hỗ trợ 24/7</h3>
              <p className="text-gray-400">Tư vấn trực tuyến và qua điện thoại</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}