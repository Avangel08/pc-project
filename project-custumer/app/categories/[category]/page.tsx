import { notFound } from 'next/navigation';
import { getCategoryProducts, transformProductData } from '@/lib/api';
import ProductGrid from '@/components/ProductGrid';
import ProductPagination from '@/components/ProductPagination';
import CategoryBreadcrumb from '@/components/CategoryBreadcrumb';
import { Keyboard, MousePointer, Sparkles, Cpu, Armchair, Table } from 'lucide-react';
import { Product } from '@/types/product';
import CategoryPageClient from '@/components/CategoryPageClient';

const categoryMeta: Record<string, { name: string; description: string; icon: any }> = {
  'gaming-gear': {
    name: 'Thiết bị chơi game',
    description: 'Khám phá các thiết bị gaming cao cấp giúp bạn chiến thắng mọi trận đấu.',
    icon: Keyboard,
  },
  'mouse-pads': {
    name: 'Lót chuột',
    description: 'Lót chuột chất lượng cao cho trải nghiệm mượt mà.',
    icon: MousePointer,
  },
  'anime-figures': {
    name: 'Mô hình Anime',
    description: 'Sưu tầm các mô hình anime độc đáo và đẹp mắt.',
    icon: Sparkles,
  },
  'pc-accessories': {
    name: 'Phụ kiện PC',
    description: 'Phụ kiện PC đa dạng, hiện đại cho mọi nhu cầu.',
    icon: Cpu,
  },
  'gaming-chairs': {
    name: 'Ghế chơi game',
    description: 'Ghế gaming êm ái, hỗ trợ tối đa cho game thủ.',
    icon: Armchair,
  },
  'gaming-desks': {
    name: 'Bàn chơi game',
    description: 'Bàn gaming thiết kế tối ưu cho không gian chơi game.',
    icon: Table,
  },
};

// Mapping từ category trên URL sang category trong dữ liệu (đồng bộ với admin-core)
const categoryMap: Record<string, string> = {
  'chuot': 'Chuột',
  'ban-phim': 'Bàn phím',
  'tai-nghe': 'Tai nghe',
  'lot-chuot': 'Lót chuột',
  'mo-hinh': 'Mô hình',
  'ghe': 'Ghế',
  'ban': 'Bàn',
  'decor': 'Decor',
};

interface CategoryPageProps {
  params: { category: string }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  try {
    const backendCategory = categoryMap[params.category] || params.category;
    const data = await getCategoryProducts(backendCategory);
    const products = data.map(transformProductData);
    
    if (products.length === 0) {
      return notFound();
    }

    return (
      <CategoryPageClient 
        products={products}
        categoryName={backendCategory}
        categorySlug={params.category}
      />
    );
  } catch (error) {
    return notFound();
  }
} 