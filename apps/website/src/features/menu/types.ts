export type DishCuisine = 'Sri Lankan' | 'Indian';

export type DishCategory = 'Starters' | 'Mains' | 'Breads & Rice' | 'Desserts';

export interface Dish {
  name: string;
  description: string;
  price: string;
  cuisine: DishCuisine;
  category: DishCategory;
  signature?: boolean;
  image?: string;
}
