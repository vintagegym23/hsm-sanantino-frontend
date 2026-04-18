export interface Category {
  id: string;
  name: string;
  imageUrl?: string;
  subCategories?: string[];
  _count?: {
    items: number;
  };
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  subCategory?: string;
  category?: Category;
}

export interface Media {
  id: string;
  type: 'hero_video' | 'hero_image' | 'menu_bg' | 'special_section';
  url: string;
  isActive?: boolean;
}

export interface Ticker {
  id: string;
  text: string;
  sortOrder: number;
}

export interface Special {
  id: string;
  imageUrl: string;
  createdAt?: string;
}

export interface Stats {
  categoryCount: number;
  itemCount: number;
  recentItems: Item[];
}
