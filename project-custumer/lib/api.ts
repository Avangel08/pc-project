import { Product } from '@/types/product';
import { getColorValue } from '@/lib/utils';

const API_URL = 'http://localhost:3001/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products`);
  return handleResponse<Product[]>(response);
}

export async function getProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_URL}/products/${id}`);
  return handleResponse<Product>(response);
}

export async function getCategories(): Promise<string[]> {
  const response = await fetch(`${API_URL}/categories`);
  return handleResponse<string[]>(response);
}

export async function getCategoryProducts(category: string): Promise<Product[]> {
  const response = await fetch(`${API_URL}/categories/${category}`, { cache: 'no-store' });
  return handleResponse<Product[]>(response);
}

// Helper function to transform admin data to customer format
export function transformProductData(product: any): Product {
  // Transform colors from names to hex codes
  const transformedColors = (product.colors || []).map((color: string) => {
    // If it's already a hex code, keep it
    if (color.startsWith('#')) {
      return color;
    }
    // Otherwise, convert from name to hex code
    return getColorValue(color);
  });

  return {
    id: product.id,
    productCode: product.productCode,
    name: product.name,
    description: product.description,
    price: product.price,
    oldPrice: product.oldPrice,
    discount: product.discount,
    category: product.category,
    images: product.images || [],
    status: product.status,
    quantity: product.stock ?? product.quantity ?? 0,
    colors: transformedColors,
    tags: product.tags || [],
    specs: product.specs || [],
    supplier: product.supplier,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    // Legacy fields
    rating: product.rating || 0,
    reviews: product.reviews || 0,
    inStock: (product.stock ?? product.quantity ?? 0) > 0,
    isNew: product.isNew || false
  };
} 