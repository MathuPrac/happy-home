export const USER = {
  name: 'Priya Fernando',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
};

export const CATEGORIES = [
  { id: '1', name: 'Sri Lankan', emoji: '🍛', count: 24 },
  { id: '2', name: 'Indian', emoji: '🫓', count: 18 },
  { id: '3', name: 'Seafood', emoji: '🦐', count: 12 },
  { id: '4', name: 'Desserts', emoji: '🍮', count: 8 },
  { id: '5', name: 'Drinks', emoji: '🥤', count: 14 },
] as const;

export const FOODS = [
  {
    id: '1',
    name: 'Butter Chicken',
    description: 'Tandoor-charred chicken, tomato-fenugreek velouté',
    price: 2800,
    category: 'Indian',
    popular: true,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82bbed7a0?w=400',
  },
  {
    id: '2',
    name: 'Cheese Kottu',
    description: 'Shredded roti, vegetables, melted cheese',
    price: 1200,
    category: 'Sri Lankan',
    popular: true,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
  },
  {
    id: '3',
    name: 'Jaffna Black Pork',
    description: 'Slow-braised pork, roasted curry paste',
    price: 3200,
    category: 'Sri Lankan',
    popular: false,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
  },
] as const;

export const PROMOTIONS = [
  { id: '1', title: '20% off first order', subtitle: 'Use code WELCOME20', color: '#d4a853' },
  { id: '2', title: 'Free delivery', subtitle: 'Orders above LKR 3000', color: '#c45c3e' },
] as const;
