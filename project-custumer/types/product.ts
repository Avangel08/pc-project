export interface Product {
  id: string;
  productCode: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  category: string;
  images: string[];
  status: string;
  quantity: number;
  colors?: string[];
  tags?: string[];
  specs?: {
    name: string;
    value: string;
  }[];
  supplier?: string;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  isNew?: boolean;
}