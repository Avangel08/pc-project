"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';

interface Banner {
  _id: string;
  title: string;
  description?: string;
  images: { url: string; alt?: string; title?: string }[];
  linkUrl?: string;
  position: 'hero' | 'promotion' | 'sidebar' | 'category';
  status: 'active' | 'inactive' | 'draft';
  startDate: string;
  endDate: string;
  priority: number;
  clicks: number;
  views: number;
}

interface BannerProps {
  position: 'hero' | 'promotion';
  className?: string;
}

export default function Banner({ position, className = '' }: BannerProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const transitionDuration = 500;

  // Fetch banners
  const fetchBanners = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/banners/position/${position}`);
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBannerView = async (bannerId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/banners/${bannerId}/view`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error tracking banner view:', error);
    }
  };

  useEffect(() => {
    fetchBanners();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [position]);

  // --- Carousel truyền thống cho nhiều ảnh trong 1 banner ---
  useEffect(() => {
    if (banners.length === 1 && banners[0].images && banners[0].images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % banners[0].images.length);
      }, 3000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [banners, currentImageIndex]);

  // --- Carousel truyền thống cho nhiều banner ---
  useEffect(() => {
    if (banners.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 3000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [banners.length, currentBannerIndex]);

  // --- Render carousel truyền thống cho nhiều ảnh trong 1 banner ---
  if (position === 'hero' && banners.length === 1 && banners[0].images && banners[0].images.length > 1) {
    const images = banners[0].images;
    const linkUrl = banners[0].linkUrl;
    return (
      <section className={`relative h-[70vh] flex items-center overflow-hidden ${className}`}>
        <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
          <div
            className="flex h-full w-full transition-transform duration-500"
            style={{
              width: `${images.length * 100}%`,
              transform: `translateX(-${currentImageIndex * (100 / images.length)}%)`,
            }}
          >
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative h-full"
                style={{ width: `${100 / images.length}%`, minWidth: `${100 / images.length}%` }}
              >
                {linkUrl ? (
                  <Link href={linkUrl} tabIndex={-1} className="block w-full h-full">
                    <Image
                      src={img.url || '/placeholder.svg'}
                      alt={img.alt || ''}
                      fill
                      className="object-cover w-full h-full absolute cursor-pointer"
                      priority={idx === currentImageIndex}
                      onLoad={() => idx === currentImageIndex && handleBannerView(banners[0]._id)}
                    />
                  </Link>
                ) : (
                  <Image
                    src={img.url || '/placeholder.svg'}
                    alt={img.alt || ''}
                    fill
                    className="object-cover w-full h-full absolute"
                    priority={idx === currentImageIndex}
                    onLoad={() => idx === currentImageIndex && handleBannerView(banners[0]._id)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${idx === currentImageIndex ? 'bg-[#00FFFF]' : 'bg-white/50 hover:bg-white/75'}`}
              aria-label={`Chuyển đến ảnh ${idx + 1}`}
            />
          ))}
        </div>
      </section>
    );
  }

  // --- Render carousel truyền thống cho nhiều banner ---
  if (position === 'hero' && banners.length > 1) {
    return (
      <section className={`relative h-[70vh] flex items-center overflow-hidden ${className}`}>
        <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
          <div
            className="flex h-full w-full transition-transform duration-500"
            style={{
              width: `${banners.length * 100}%`,
              transform: `translateX(-${currentBannerIndex * (100 / banners.length)}%)`,
            }}
          >
            {banners.map((banner, idx) => (
              <div
                key={banner._id}
                className="relative h-full"
                style={{ width: `${100 / banners.length}%`, minWidth: `${100 / banners.length}%` }}
              >
                {banner.linkUrl ? (
                  <Link href={banner.linkUrl} tabIndex={-1} className="block w-full h-full">
                    <Image
                      src={banner.images && banner.images[0]?.url ? banner.images[0].url : '/placeholder.svg'}
                      alt={banner.images && banner.images[0]?.alt ? banner.images[0].alt : ''}
                      fill
                      className="object-cover w-full h-full absolute cursor-pointer"
                      priority={idx === currentBannerIndex}
                      onLoad={() => idx === currentBannerIndex && handleBannerView(banner._id)}
                    />
                  </Link>
                ) : (
                  <Image
                    src={banner.images && banner.images[0]?.url ? banner.images[0].url : '/placeholder.svg'}
                    alt={banner.images && banner.images[0]?.alt ? banner.images[0].alt : ''}
                    fill
                    className="object-cover w-full h-full absolute"
                    priority={idx === currentBannerIndex}
                    onLoad={() => idx === currentBannerIndex && handleBannerView(banner._id)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBannerIndex(idx)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${idx === currentBannerIndex ? 'bg-[#00FFFF]' : 'bg-white/50 hover:bg-white/75'}`}
              aria-label={`Chuyển đến banner ${idx + 1}`}
            />
          ))}
        </div>
      </section>
    );
  }

  // --- Promotion giữ nguyên ---
  let currentBanner: Banner | undefined = undefined;
  if (banners.length > 0) {
    currentBanner = banners[currentBannerIndex];
  }
  if (position === 'promotion' && currentBanner && currentBanner.images) {
    return (
      <section className={`py-16 container mx-auto px-4 ${className}`}>
        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
          {currentBanner.linkUrl ? (
            <Link href={currentBanner.linkUrl} tabIndex={-1} className="block w-full h-full">
              <Image 
                src={currentBanner.images[0]?.url ? currentBanner.images[0].url : '/placeholder.svg'} 
                alt={currentBanner.images[0]?.alt ? currentBanner.images[0].alt : currentBanner.title}
                fill
                className="object-cover cursor-pointer"
                onLoad={() => handleBannerView(currentBanner._id)}
              />
            </Link>
          ) : (
            <Image 
              src={currentBanner.images[0]?.url ? currentBanner.images[0].url : '/placeholder.svg'} 
              alt={currentBanner.images[0]?.alt ? currentBanner.images[0].alt : currentBanner.title}
              fill
              className="object-cover"
              onLoad={() => handleBannerView(currentBanner._id)}
            />
          )}
        </div>
      </section>
    );
  }

  // --- Trường hợp chỉ có 1 banner 1 ảnh hoặc không có banner ---
  if (position === 'hero' && banners.length === 1 && banners[0].images && banners[0].images.length === 1) {
    const img = banners[0].images[0];
    const linkUrl = banners[0].linkUrl;
    return (
      <section className={`relative h-[70vh] flex items-center overflow-hidden ${className}`}>
        <div className="absolute inset-0 z-0 w-full h-full">
          {linkUrl ? (
            <Link href={linkUrl} tabIndex={-1} className="block w-full h-full">
              <Image
                src={img?.url || '/placeholder.svg'}
                alt={img?.alt || ''}
                fill
                className="object-cover w-full h-full absolute cursor-pointer"
                priority
                onLoad={() => handleBannerView(banners[0]._id)}
              />
            </Link>
          ) : (
            <Image
              src={img?.url || '/placeholder.svg'}
              alt={img?.alt || ''}
              fill
              className="object-cover w-full h-full absolute"
              priority
              onLoad={() => handleBannerView(banners[0]._id)}
            />
          )}
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <div className={`relative ${position === 'hero' ? 'h-[70vh]' : 'h-64 md:h-80'} bg-gray-800 animate-pulse ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">Đang tải...</div>
        </div>
      </div>
    );
  }

  return null;
} 