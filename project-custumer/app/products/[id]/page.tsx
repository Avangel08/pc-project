export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import { getProduct, getProducts, transformProductData } from '@/lib/api';
import ProductDetailClient from '@/components/ProductDetailClient';
import { Product } from '@/types/product';

interface ProductPageProps {
  params: { id: string }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  try {
    const productData = await getProduct(params.id);
    const allProductsData = await getProducts();

    // Transform data from admin format to customer format
    const product = transformProductData(productData);
    const allProducts = allProductsData.map(transformProductData);

    // Lấy các sản phẩm liên quan (cùng category, khác id)
    const relatedProducts = allProducts.filter(
      (p: Product) => p.category === product.category && p.id !== product.id
    ).slice(0, 4);

    return (
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    );
  } catch (error) {
    return notFound();
  }
}

// Helper: Lấy tên danh mục từ category
function categoryName(category: string) {
  switch (category) {
    case 'keyboards': return 'Thiết bị chơi game';
    case 'mice': return 'Chuột';
    case 'headsets': return 'Tai nghe';
    case 'mousepads': return 'Lót chuột';
    case 'figures': return 'Mô hình Anime';
    case 'accessories': return 'Phụ kiện PC';
    case 'chairs': return 'Ghế chơi game';
    case 'desks': return 'Bàn chơi game';
    default: return category;
  }
}

// Helper: Lấy url danh mục từ category
function categoryUrl(category: string) {
  switch (category) {
    case 'keyboards': return 'gaming-gear';
    case 'mice': return 'mice';
    case 'headsets': return 'headsets';
    case 'mousepads': return 'mouse-pads';
    case 'figures': return 'anime-figures';
    case 'accessories': return 'pc-accessories';
    case 'chairs': return 'gaming-chairs';
    case 'desks': return 'gaming-desks';
    default: return category;
  }
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ id: p.id }));
}