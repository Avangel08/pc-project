"use client";

import { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CategoryFiltersProps {
  priceRange: number[];
  onPriceRangeChange: (value: number[]) => void;
  sortOption: string;
  onSortChange: (value: string) => void;
  totalProducts: number;
}

export default function CategoryFilters({
  priceRange,
  onPriceRangeChange,
  sortOption,
  onSortChange,
  totalProducts
}: CategoryFiltersProps) {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);

  const handlePriceRangeChange = (value: number[]) => {
    onPriceRangeChange(value);
  };

  return (
    <div className="mb-4">
      {/* Desktop Filters - 1 hàng */}
      <div className="hidden md:flex items-end gap-3 mb-2 w-full justify-end">
        {/* Group all filter controls to the right */}
        <div className="flex items-end gap-3">
          {/* Sort */}
          <Select value={sortOption} onValueChange={onSortChange}>
            <SelectTrigger className="w-[130px] h-9 text-sm bg-[#161625] border-[#2A2A40] text-white focus:border-[#00FFFF] transition-colors">
              <SelectValue placeholder="Bộ lọc" />
            </SelectTrigger>
            <SelectContent className="bg-[#161625] border-[#2A2A40] text-sm">
              <SelectItem value="featured" className="text-white hover:bg-[#23234a]">Bộ lọc</SelectItem>
              <SelectItem value="price-asc" className="text-white hover:bg-[#23234a]">Giá tăng</SelectItem>
              <SelectItem value="price-desc" className="text-white hover:bg-[#23234a]">Giá giảm</SelectItem>
              <SelectItem value="newest" className="text-white hover:bg-[#23234a]">Mới nhất</SelectItem>
              <SelectItem value="bestselling" className="text-white hover:bg-[#23234a]">Bán chạy</SelectItem>
            </SelectContent>
          </Select>
          {/* Price Range Dropdown (Popover) */}
          <Popover open={openPrice} onOpenChange={setOpenPrice}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-9 px-4 text-sm bg-[#161625] border-[#2A2A40] text-white flex items-center gap-2 min-w-[120px]"
              >
                Khoảng giá
                <ChevronDown size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[320px] bg-[#161625] border-[#2A2A40] p-4 rounded-lg">
              <div className="mb-2 text-xs font-medium text-white">Chọn khoảng giá</div>
              <div className="flex items-center gap-2">
                <Slider
                  value={priceRange}
                  min={0}
                  max={50000000}
                  step={500000}
                  onValueChange={handlePriceRangeChange}
                  className="h-3 flex-1"
                />
                <span className="text-xs text-white w-16 text-right">
                  {priceRange[0].toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})}
                </span>
                <span className="text-xs text-white w-16 text-right">
                  {priceRange[1].toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})}
                </span>
              </div>
              <div className="flex justify-end mt-3">
                <Button size="sm" className="bg-[#00FFFF] text-black hover:bg-[#00FFFF]/80" onClick={() => setOpenPrice(false)}>
                  Áp dụng
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {/* Mobile Filters giữ nguyên */}
      <div className="md:hidden">
        <div className="flex items-center gap-2 mb-2">
          <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="bg-[#161625] border-[#2A2A40] text-white hover:bg-[#23234a] transition-colors h-9 px-3 text-sm">
                <Filter size={16} className="mr-2" /> Bộ lọc
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-[#1A1A2E] border-r border-[#2A2A40]">
              <div className="py-6">
                <h2 className="text-xl font-bold mb-6 font-orbitron text-white">Bộ lọc</h2>
                {/* Mobile filter content giữ nguyên */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold mb-2 text-white">Khoảng giá</h3>
                    <div className="px-1">
                      <Slider
                        value={priceRange}
                        min={0}
                        max={50000000}
                        step={500000}
                        onValueChange={handlePriceRangeChange}
                        className="my-2 h-4 [&>span]:h-3"
                      />
                      <div className="flex items-center justify-between mt-1">
                        <div className="bg-[#161625] px-2 py-0.5 rounded text-xs text-white border border-[#2A2A40]">
                          {priceRange[0].toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})}
                        </div>
                        <div className="bg-[#161625] px-2 py-0.5 rounded text-xs text-white border border-[#2A2A40]">
                          {priceRange[1].toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-2 text-white">Sắp xếp theo</h3>
                    <Select value={sortOption} onValueChange={onSortChange}>
                      <SelectTrigger className="w-full h-9 text-sm bg-[#161625] border-[#2A2A40] text-white focus:border-[#00FFFF] transition-colors">
                        <SelectValue placeholder="Chọn cách sắp xếp" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#161625] border-[#2A2A40] text-sm">
                        <SelectItem value="featured" className="text-white hover:bg-[#23234a]">Nổi bật</SelectItem>
                        <SelectItem value="price-asc" className="text-white hover:bg-[#23234a]">Giá tăng</SelectItem>
                        <SelectItem value="price-desc" className="text-white hover:bg-[#23234a]">Giá giảm</SelectItem>
                        <SelectItem value="newest" className="text-white hover:bg-[#23234a]">Mới nhất</SelectItem>
                        <SelectItem value="bestselling" className="text-white hover:bg-[#23234a]">Bán chạy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-2 border-t border-[#2A2A40]">
                    <p className="text-xs text-gray-400">
                      Tìm thấy {totalProducts} sản phẩm
                    </p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
} 