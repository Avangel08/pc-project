"use client";

import { useState, useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { getProducts, transformProductData } from '@/lib/api';
import { Product } from '@/types/product';
import ProductPagination from '@/components/ProductPagination';
import { useSearchParams } from 'next/navigation';

// Hàm loại bỏ dấu tiếng Việt
function removeVietnameseTones(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(40);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const priceDropdownRef = useRef<HTMLDivElement>(null);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);
  // Lấy danh sách supplier duy nhất từ products
  const suppliers = Array.from(new Set(products.map((p) => p.supplier).filter((s): s is string => !!s && s.length > 0)));
  const categories = [
    { id: 'Bàn phím', name: 'Bàn phím' },
    { id: 'Chuột', name: 'Chuột' },
    { id: 'Tai nghe', name: 'Tai nghe' },
    { id: 'Lót chuột', name: 'Lót chuột' },
    { id: 'Mô hình', name: 'Mô hình' },
    { id: 'Ghế', name: 'Ghế' },
    { id: 'Bàn', name: 'Bàn' },
    { id: 'Decor', name: 'Decor' },
  ];

  useEffect(() => {
    getProducts().then((data) => {
      // Transform data from admin format to customer format
      const transformedProducts = data.map(transformProductData);
      setProducts(transformedProducts);
    });
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

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

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value);
    // setItemsPerPage(newItemsPerPage); // Removed since itemsPerPage is now constant
    setCurrentPage(1); // Reset to first page
  };

  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category');
  const urlSupplier = searchParams.get('supplier');

  useEffect(() => {
    let results = products;
    
    // Filter by price
    results = results.filter((product: Product) => 
      product.price >= priceRange[0] && 
      product.price <= priceRange[1]
    );
    

    
    // Filter by categories
    if (selectedCategories.length > 0) {
      results = results.filter((product: Product) => 
        selectedCategories.includes(product.category)
      );
    }
    
    // Filter by category from URL
    if (urlCategory) {
      results = results.filter((product: Product) => product.category === urlCategory);
    }

    // Filter by supplier from URL
    if (urlSupplier) {
      results = results.filter((product: Product) => product.supplier === urlSupplier);
    }
    
    // Filter by supplier (dropdown)
    if (selectedSupplier) {
      results = results.filter((product: Product) => product.supplier === selectedSupplier);
    }
    
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
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [products, priceRange, selectedCategories, sortOption, urlCategory, urlSupplier, selectedSupplier]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(event.target as Node)) {
        setShowPriceDropdown(false);
      }
      if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(event.target as Node)) {
        setShowSupplierDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1A1A2E] text-white">
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0 mb-8">
          <h1 className="text-3xl font-bold font-orbitron">Tất cả sản phẩm</h1>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            
            {/* Category Dropdown */}
            <div className="relative" ref={categoryDropdownRef}>
              <Button 
                variant="outline" 
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="h-9 text-sm bg-[#161625] border-[#2A2A40] text-white rounded-md focus:border-[#00FFFF] transition-colors"
              >
                Danh mục
                <ChevronDown size={16} className="ml-2" />
              </Button>
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-[#161625] border border-[#2A2A40] rounded-md shadow-lg z-10 p-3">
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`category-${category.id}`} 
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => handleCategoryChange(category.id)}
                className="data-[state=checked]:bg-[#00FFFF] data-[state=checked]:text-black"
              />
              <Label 
                htmlFor={`category-${category.id}`}
                          className="text-sm cursor-pointer text-white"
              >
                {category.name}
              </Label>
            </div>
          ))}
        </div>
                </div>
              )}
            </div>

            {/* Supplier Dropdown */}
            <div className="relative" ref={supplierDropdownRef}>
              <Button 
                variant="outline" 
                onClick={() => setShowSupplierDropdown(!showSupplierDropdown)}
                className="h-9 text-sm bg-[#161625] border-[#2A2A40] text-white rounded-md focus:border-[#00FFFF] transition-colors"
              >
                Nhà cung cấp
                <ChevronDown size={16} className="ml-2" />
              </Button>
              {showSupplierDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-[#161625] border border-[#2A2A40] rounded-md shadow-lg z-10 p-3 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {suppliers.length === 0 && <div className="text-gray-400 italic text-sm">Không có nhà cung cấp</div>}
                    {suppliers.map((supplier) => (
                      <div key={supplier} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`supplier-${supplier}`} 
                          checked={selectedSupplier === supplier}
                          onCheckedChange={() => setSelectedSupplier(selectedSupplier === supplier ? null : supplier)}
                          className="data-[state=checked]:bg-[#00FFFF] data-[state=checked]:text-black"
                        />
                        <Label 
                          htmlFor={`supplier-${supplier}`}
                          className="text-sm cursor-pointer text-white"
                        >
                          {supplier}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
      </div>
      
            {/* Price Range Dropdown */}
            <div className="relative" ref={priceDropdownRef}>
              <Button 
                variant="outline" 
                onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                className="h-9 text-sm bg-[#161625] border-[#2A2A40] text-white rounded-md focus:border-[#00FFFF] transition-colors"
              >
                Khoảng giá
                <ChevronDown size={16} className="ml-2" />
              </Button>
              {showPriceDropdown && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-[#161625] border border-[#2A2A40] rounded-md shadow-lg z-10 p-4">
                  <div className="space-y-4">
        <div className="px-2">
          <Slider
            value={priceRange}
            min={0}
            max={50000000}
            step={500000}
            onValueChange={setPriceRange}
                        className="my-4"
          />
          <div className="flex items-center justify-between">
                        <div className="bg-muted/30 px-3 py-1 rounded text-sm text-white">
              {priceRange[0].toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})}
            </div>
                        <div className="bg-muted/30 px-3 py-1 rounded text-sm text-white">
              {priceRange[1].toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})}
            </div>
          </div>
        </div>
      </div>
    </div>
              )}
            </div>

            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[130px] h-9 text-sm bg-[#161625] border-[#2A2A40] text-white rounded-md focus:border-[#00FFFF] transition-colors">
                <SelectValue placeholder="Bộ lọc" />
              </SelectTrigger>
              <SelectContent className="bg-[#161625] border-[#2A2A40] text-sm">
                <SelectItem value="featured" className="text-white hover:bg-[#23234a]">Bộ lọc</SelectItem>
                <SelectItem value="price-asc" className="text-white hover:bg-[#23234a]">Giá: Thấp đến cao</SelectItem>
                <SelectItem value="price-desc" className="text-white hover:bg-[#23234a]">Giá: Cao đến thấp</SelectItem>
                <SelectItem value="newest" className="text-white hover:bg-[#23234a]">Mới nhất</SelectItem>
                <SelectItem value="bestselling" className="text-white hover:bg-[#23234a]">Bán chạy nhất</SelectItem>
              </SelectContent>
            </Select>

          </div>
        </div>

        <div className="mb-4 text-sm text-[#00FFFF]">
          {filteredProducts.length > 0 ? (
            <>Tìm thấy {filteredProducts.length} sản phẩm</>
          ) : (
            <>Không tìm thấy sản phẩm nào phù hợp</>
          )}
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Không tìm thấy sản phẩm nào phù hợp</p>
              </div>
            ) : (
          <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            {/* Items per page selector removed, always 40 per page */}
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