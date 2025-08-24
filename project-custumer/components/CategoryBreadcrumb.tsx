import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface CategoryBreadcrumbProps {
  categoryName: string;
  categorySlug: string;
  supplier?: string;
}

export default function CategoryBreadcrumb({ categoryName, categorySlug, supplier }: CategoryBreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
      <Link 
        href="/" 
        className="flex items-center hover:text-[#00FFFF] transition-colors duration-200"
      >
        <Home size={16} className="mr-1" />
        Trang chủ
      </Link>
      <ChevronRight size={16} />
      <Link 
        href="/categories" 
        className="hover:text-[#00FFFF] transition-colors duration-200"
      >
        Danh mục
      </Link>
      <ChevronRight size={16} />
      <Link 
        href={`/categories/${categorySlug}`}
        className="hover:text-[#00FFFF] transition-colors duration-200 text-white font-medium capitalize"
      >
        {categoryName}
      </Link>
      {supplier && (
        <>
          <ChevronRight size={16} />
          <span className="text-white font-medium capitalize">{supplier}</span>
        </>
      )}
    </nav>
  );
} 