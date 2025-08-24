"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCardSmall from './ProductCardSmall';
import { Product } from '@/types/product';

interface ProductCarouselProps {
  products: Product[];
  title: string;
  showViewAll?: boolean;
}

export default function ProductCarousel({ products, title, showViewAll = true }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = Math.max(0, products.length - 5);
        return prevIndex >= maxIndex ? 0 : prevIndex + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, products.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, products.length - 5);
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
    setIsAutoPlaying(false);
    // Resume auto-play after manual interaction
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, products.length - 5);
      return prevIndex <= 0 ? maxIndex : prevIndex - 1;
    });
    setIsAutoPlaying(false);
    // Resume auto-play after manual interaction
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  if (products.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        Chưa có sản phẩm bán chạy
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-black/70 to-black/50 hover:from-[#00FFFF]/20 hover:to-[#00FFFF]/10 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-6 hover:scale-110 hover:shadow-lg hover:shadow-[#00FFFF]/30 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-l from-black/70 to-black/50 hover:from-[#00FFFF]/20 hover:to-[#00FFFF]/10 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 -mr-6 hover:scale-110 hover:shadow-lg hover:shadow-[#00FFFF]/30 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Carousel Container */}
      <div className="overflow-hidden relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0D0D17] to-transparent z-5 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0D0D17] to-transparent z-5 pointer-events-none"></div>
        
        <div 
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / 5)}%)`,
            width: `${products.length * (100 / 5)}%`
          }}
        >
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className="w-1/5 flex-shrink-0 px-2"
              style={{ minWidth: '20%' }}
            >
              <div className="transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#00FFFF]/20 hover:-translate-y-2">
                <ProductCardSmall product={product} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {products.length > 5 && (
        <div className="flex justify-center mt-8 space-x-3">
          {Array.from({ length: Math.ceil(products.length / 5) }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index * 5);
                setIsAutoPlaying(false);
                setTimeout(() => setIsAutoPlaying(true), 5000);
              }}
              className={`w-4 h-4 rounded-full transition-all duration-300 hover:scale-125 ${
                index === Math.floor(currentIndex / 5)
                  ? 'bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] scale-125 shadow-lg shadow-[#00FFFF]/50'
                  : 'bg-gray-600 hover:bg-gray-400 hover:shadow-md'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 