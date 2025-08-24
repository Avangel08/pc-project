import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Product } from '@/types/product';
import ProductCard from './ProductCard';

interface ProductRowCarouselProps {
  products: Product[];
}

const ProductRowCarousel: React.FC<ProductRowCarouselProps> = ({ products }) => {
  return (
    <Swiper
      modules={[Navigation, Autoplay]}
      spaceBetween={20}
      slidesPerView="auto"
      navigation
      autoplay={{ delay: 2000, disableOnInteraction: false }}
      loop={products.length > 5}
      className="w-full"
      style={{ padding: '8px 0' }}
    >
      {products.map((product) => (
        <SwiperSlide key={product.id} className="min-w-[260px] max-w-[280px] w-full">
          <ProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ProductRowCarousel; 