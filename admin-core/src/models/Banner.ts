export interface BannerImage {
  url: string;
  alt?: string;
  title?: string;
}

export interface Banner {
  _id?: string;
  title: string;
  description?: string;
  images: BannerImage[];
  linkUrl?: string;
  position: 'hero' | 'promotion' | 'sidebar' | 'category';
  status: 'active' | 'inactive' | 'draft';
  startDate: string;
  endDate: string;
  priority: number;
  clicks: number;
  views: number;
  autoPlay?: boolean;
  autoPlaySpeed?: number; // seconds
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBannerRequest {
  title: string;
  description?: string;
  images: BannerImage[];
  linkUrl?: string;
  position: 'hero' | 'promotion' | 'sidebar' | 'category';
  status: 'active' | 'inactive' | 'draft';
  startDate: string;
  endDate: string;
  priority: number;
  autoPlay?: boolean;
  autoPlaySpeed?: number;
}

export interface UpdateBannerRequest extends Partial<CreateBannerRequest> {
  _id: string;
} 