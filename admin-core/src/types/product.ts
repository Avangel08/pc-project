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
  status: 'sap_ve' | 'con_hang' | 'sap_het' | 'het_hang' | 'ngung_kinh_doanh';
  stock: number;
  colors?: string[];
  tags?: string[];
  specs?: {
    name: string;
    value: string;
  }[];
  supplier?: string;
  sales?: number;
  isNew?: boolean;
  createdAt?: string;
  updatedAt?: string;
} 