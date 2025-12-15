"use client";

import { useState, useEffect } from 'react';
import ProductGrid from '@/components/ProductGrid';
import ProductPagination from '@/components/ProductPagination';
import CategoryBreadcrumb from '@/components/CategoryBreadcrumb';
import CategoryFilters from '@/components/CategoryFilters';
import { Product } from '@/types/product';
import { useSearchParams } from 'next/navigation';

interface CategoryPageClientProps {
  products: Product[];
  categoryName: string;
  categorySlug: string;
}

export default function CategoryPageClient({ 
  products, 
  categoryName, 
  categorySlug 
}: CategoryPageClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(40);
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [sortOption, setSortOption] = useState('featured');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const searchParams = useSearchParams();
  const supplier = searchParams.get('supplier');

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hàm loại bỏ dấu tiếng Việt
  function removeVietnameseTones(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // Filter and sort products
  useEffect(() => {
    let results = [...products];
    // Filter by supplier (query param)
    if (supplier) {
      results = results.filter(
        (product: Product) =>
          product.supplier &&
          product.supplier.trim().toLowerCase() === supplier.trim().toLowerCase()
      );
    }
    // Filter by price
    results = results.filter((product: Product) => 
      product.price >= priceRange[0] && 
      product.price <= priceRange[1]
    );
    
    // Sort products
    switch (sortOption) {
      case 'price-asc':
        results = [...results].sort((a: Product, b: Product) => a.price - b.price);
        break;
      case 'price-desc':
        results = [...results].sort((a: Product, b: Product) => b.price - a.price);
        break;
      case 'newest':
        results = [...results].sort((a: Product, b: Product) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'bestselling':
        // Sort by quantity (as a proxy for popularity)
        results = [...results].sort((a: Product, b: Product) => b.quantity - a.quantity);
        break;
      default:
        // featured - keep original order
        break;
    }
    
    setFilteredProducts(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, priceRange, sortOption, supplier]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1A1A2E] text-white pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <CategoryBreadcrumb 
          categoryName={categoryName} 
          categorySlug={categorySlug} 
          supplier={supplier || undefined}
        />

        {/* Category Header + Filters cùng 1 hàng */}
        <div className="mb-8 flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2 mb-0 leading-tight">
            {categoryName}
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-gray-700 text-sm font-semibold text-white align-middle">{filteredProducts.length}</span>
          </h1>
          <div className="align-middle w-full md:w-auto">
            <CategoryFilters
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              sortOption={sortOption}
              onSortChange={setSortOption}
              totalProducts={filteredProducts.length}
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-400 mb-4">
              Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn
            </p>
            <button
              onClick={() => {
                setPriceRange([0, 50000000]);
                setSortOption('featured');
              }}
              className="px-4 py-2 bg-[#00FFFF] text-black rounded-md hover:bg-[#00FFFF]/80 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <>
            <ProductGrid products={currentProducts} />
            {/* Items per page selector removed, luôn 40 sản phẩm mỗi trang */}
            <div className="mt-4 flex justify-center">
              <ProductPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={filteredProducts.length}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
} 