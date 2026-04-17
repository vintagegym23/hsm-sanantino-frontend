export interface Category {
  id: string;
  name: string;
  imageUrl?: string;
  subCategories?: string[] | null;
  _count?: {
    items: number;
  };
}

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  category?: Category;
  subCategory?: string;
}

export interface Media {
  id: string;
  type: 'hero_video' | 'hero_image' | 'menu_bg' | 'special_section';
  url: string;
}

export interface Stats {
  categoryCount: number;
  itemCount: number;
  recentItems: Item[];
}
