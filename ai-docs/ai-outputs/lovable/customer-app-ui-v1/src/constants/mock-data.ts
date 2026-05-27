import kottu from "@/assets/food/kottu.jpg";
import butterChicken from "@/assets/food/butter-chicken.jpg";
import biriyani from "@/assets/food/biriyani.jpg";
import tandoori from "@/assets/food/tandoori.jpg";
import devilled from "@/assets/food/devilled-chicken.jpg";
import cuttlefish from "@/assets/food/cuttlefish.jpg";
import cheeseKottu from "@/assets/food/cheese-kottu.jpg";
import tikka from "@/assets/food/tikka.jpg";
import shawarma from "@/assets/food/shawarma.jpg";
import friedRice from "@/assets/food/fried-rice.jpg";
import paneer from "@/assets/food/paneer.jpg";
import grill from "@/assets/food/grill-platter.jpg";
import naan from "@/assets/food/naan.jpg";
import masalaFries from "@/assets/food/masala-fries.jpg";
import mojito from "@/assets/food/mojito.jpg";
import faluda from "@/assets/food/faluda.jpg";

import type {
  Category,
  FoodItem,
  Order,
  Promotion,
  NotificationItem,
  Reservation,
  SavedCard,
  UserProfile,
} from "@/types";

export const FOOD_IMAGES = {
  kottu,
  butterChicken,
  biriyani,
  tandoori,
  devilled,
  cuttlefish,
  cheeseKottu,
  tikka,
  shawarma,
  friedRice,
  paneer,
  grill,
  naan,
  masalaFries,
  mojito,
  faluda,
};

export const CATEGORIES: Category[] = [
  { id: "biriyani", name: "Biriyani", emoji: "🍛", count: 8 },
  { id: "kottu", name: "Kottu", emoji: "🥘", count: 6 },
  { id: "indian", name: "Indian", emoji: "🫓", count: 12 },
  { id: "grill", name: "Grill & BBQ", emoji: "🔥", count: 9 },
  { id: "seafood", name: "Seafood", emoji: "🦐", count: 7 },
  { id: "shortEats", name: "Short Eats", emoji: "🍟", count: 10 },
  { id: "drinks", name: "Drinks", emoji: "🍹", count: 11 },
  { id: "desserts", name: "Desserts", emoji: "🍨", count: 5 },
];

export const FOODS: FoodItem[] = [
  { id: "f1", name: "Chicken Kottu", description: "Hand-chopped roti tossed with marinated chicken, egg, leeks and our house chili masala.", price: 1450, image: kottu, category: "kottu", rating: 4.8, reviews: 412, prepMinutes: 18, spicyLevel: 2, isVeg: false, tags: ["Signature", "Bestseller"], calories: 720, popular: true },
  { id: "f2", name: "Cheese Kottu", description: "Classic kottu folded with mozzarella & cheddar for a melt-pull finish.", price: 1650, image: cheeseKottu, category: "kottu", rating: 4.7, reviews: 256, prepMinutes: 20, spicyLevel: 1, isVeg: false, tags: ["Chef's Pick"], calories: 860, popular: true },
  { id: "f3", name: "Butter Chicken", description: "Slow-cooked chicken in a velvety tomato-cream gravy, finished with kasuri methi.", price: 2150, image: butterChicken, category: "indian", rating: 4.9, reviews: 980, prepMinutes: 22, spicyLevel: 1, isVeg: false, tags: ["Signature"], calories: 640, popular: true },
  { id: "f4", name: "Chicken Biriyani", description: "Saffron-laced basmati layered with marinated chicken, fried onions & mint.", price: 1850, image: biriyani, category: "biriyani", rating: 4.9, reviews: 1240, prepMinutes: 25, spicyLevel: 2, isVeg: false, tags: ["Hyderabadi", "Bestseller"], calories: 780, popular: true },
  { id: "f5", name: "Tandoori Chicken (Half)", description: "Yogurt & spice marinated, charred in a clay tandoor. Served sizzling.", price: 1950, image: tandoori, category: "grill", rating: 4.8, reviews: 530, prepMinutes: 28, spicyLevel: 2, isVeg: false, calories: 520 },
  { id: "f6", name: "Chicken Tikka", description: "Boneless cubes marinated in hung curd, ginger & garlic, char-grilled.", price: 1750, image: tikka, category: "grill", rating: 4.7, reviews: 387, prepMinutes: 20, spicyLevel: 2, isVeg: false, calories: 450 },
  { id: "f7", name: "Devilled Chicken", description: "Sri Lankan stir-fry with bell peppers, green chili & a sticky chili glaze.", price: 1650, image: devilled, category: "indian", rating: 4.8, reviews: 612, prepMinutes: 18, spicyLevel: 3, isVeg: false, tags: ["Spicy"], calories: 540 },
  { id: "f8", name: "Hot Butter Cuttlefish", description: "Crispy fried squid tossed in garlic butter with curry leaf & chili.", price: 2250, image: cuttlefish, category: "seafood", rating: 4.7, reviews: 298, prepMinutes: 22, spicyLevel: 2, isVeg: false, calories: 520 },
  { id: "f9", name: "Chicken Shawarma", description: "Slow-roasted chicken with garlic toum, pickles, wrapped in soft pita.", price: 950, image: shawarma, category: "shortEats", rating: 4.6, reviews: 421, prepMinutes: 12, spicyLevel: 1, isVeg: false, calories: 580 },
  { id: "f10", name: "Mixed Fried Rice", description: "Wok-tossed jasmine rice with prawns, chicken, egg & seasonal vegetables.", price: 1550, image: friedRice, category: "biriyani", rating: 4.5, reviews: 234, prepMinutes: 20, spicyLevel: 1, isVeg: false, calories: 690 },
  { id: "f11", name: "Paneer Butter Masala", description: "Cottage cheese simmered in a rich cashew-tomato gravy.", price: 1650, image: paneer, category: "indian", rating: 4.7, reviews: 312, prepMinutes: 20, spicyLevel: 1, isVeg: true, tags: ["Vegetarian"], calories: 520 },
  { id: "f12", name: "Royal Grill Platter", description: "BBQ chicken, lamb chops, seekh kebab, grilled veg & two naans. Serves 2.", price: 4850, image: grill, category: "grill", rating: 4.9, reviews: 178, prepMinutes: 35, spicyLevel: 2, isVeg: false, tags: ["For Two", "Premium"], calories: 1840, popular: true },
  { id: "f13", name: "Garlic Butter Naan", description: "Hand-stretched naan brushed with garlic butter & coriander.", price: 350, image: naan, category: "indian", rating: 4.6, reviews: 540, prepMinutes: 8, spicyLevel: 0, isVeg: true, calories: 280 },
  { id: "f14", name: "Masala Fries", description: "Crispy fries dusted with house chaat masala & tangy chili drizzle.", price: 650, image: masalaFries, category: "shortEats", rating: 4.5, reviews: 198, prepMinutes: 10, spicyLevel: 2, isVeg: true, calories: 460 },
  { id: "f15", name: "Classic Mint Mojito", description: "Fresh lime, muddled mint, cane sugar & soda over crushed ice.", price: 750, image: mojito, category: "drinks", rating: 4.7, reviews: 421, prepMinutes: 6, spicyLevel: 0, isVeg: true, calories: 140 },
  { id: "f16", name: "Rose Faluda", description: "Layered rose syrup, vermicelli, basil seeds & vanilla ice cream.", price: 950, image: faluda, category: "desserts", rating: 4.8, reviews: 287, prepMinutes: 8, spicyLevel: 0, isVeg: true, tags: ["Sweet"], calories: 380 },
];

export const PROMOTIONS: Promotion[] = [
  { id: "p1", title: "Welcome to Happy Home", subtitle: "Get 20% off your first order over Rs. 2,000", code: "WELCOME20", discountLabel: "20% OFF", accent: "amber" },
  { id: "p2", title: "Friday Night Feast", subtitle: "Free Faluda with any Grill Platter", code: "FRIDAYFEAST", discountLabel: "FREE DESSERT", accent: "spice" },
  { id: "p3", title: "Loyalty Double Points", subtitle: "Earn 2× points on orders above Rs. 3,500", code: "DOUBLE2X", discountLabel: "2× POINTS", accent: "gold" },
];

export const USER: UserProfile = {
  name: "Aanya Perera",
  phone: "+94 77 234 8821",
  email: "aanya.perera@gmail.com",
  avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Aanya&backgroundColor=f4d35e",
  loyaltyPoints: 1840,
  tier: "Gold",
};

export const SAVED_CARDS: SavedCard[] = [
  { id: "c1", brand: "visa", last4: "4821", holder: "A. PERERA", expiry: "08/27", isDefault: true },
  { id: "c2", brand: "mastercard", last4: "9134", holder: "A. PERERA", expiry: "11/26", isDefault: false },
];

export const ORDERS: Order[] = [
  {
    id: "o1",
    code: "HH-2841",
    items: [
      { name: "Chicken Kottu", qty: 1, price: 1450, image: kottu },
      { name: "Garlic Butter Naan", qty: 2, price: 350, image: naan },
      { name: "Classic Mint Mojito", qty: 1, price: 750, image: mojito },
    ],
    subtotal: 2900,
    delivery: 250,
    total: 3150,
    status: "out_for_delivery",
    placedAt: "Today, 7:24 PM",
    etaMinutes: 12,
    address: "Apt 14B, Cinnamon Gardens, Colombo 07",
    rider: {
      id: "r1",
      name: "Ruwan Silva",
      phone: "+94 76 112 3344",
      avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Ruwan&backgroundColor=e07a5f",
      rating: 4.9,
      vehicle: "Honda Click",
      plate: "WP CAB-2841",
    },
  },
  {
    id: "o2",
    code: "HH-2710",
    items: [
      { name: "Chicken Biriyani", qty: 2, price: 1850, image: biriyani },
      { name: "Rose Faluda", qty: 1, price: 950, image: faluda },
    ],
    subtotal: 4650,
    delivery: 250,
    total: 4900,
    status: "delivered",
    placedAt: "Yesterday, 1:12 PM",
    etaMinutes: 0,
    address: "Apt 14B, Cinnamon Gardens, Colombo 07",
  },
  {
    id: "o3",
    code: "HH-2655",
    items: [
      { name: "Royal Grill Platter", qty: 1, price: 4850, image: grill },
    ],
    subtotal: 4850,
    delivery: 0,
    total: 4850,
    status: "delivered",
    placedAt: "May 12, 8:40 PM",
    etaMinutes: 0,
    address: "Apt 14B, Cinnamon Gardens, Colombo 07",
  },
];

export const NOTIFICATIONS: NotificationItem[] = [
  { id: "n1", title: "Your rider is on the way 🛵", body: "Ruwan is 12 minutes away with order HH-2841.", time: "2m ago", type: "order", unread: true },
  { id: "n2", title: "Friday Feast unlocked", body: "Free Rose Faluda with any Grill Platter tonight.", time: "1h ago", type: "promo", unread: true },
  { id: "n3", title: "You earned 145 points", body: "Order HH-2710 added to your Gold tier balance.", time: "Yesterday", type: "loyalty", unread: false },
  { id: "n4", title: "Reservation confirmed", body: "Saturday, 8:00 PM · Table for 4.", time: "2d ago", type: "system", unread: false },
];

export const RESERVATIONS: Reservation[] = [
  { id: "r1", date: "Sat, May 23", time: "8:00 PM", guests: 4, status: "confirmed" },
  { id: "r2", date: "Apr 12", time: "7:30 PM", guests: 2, status: "past" },
];

export const FAVORITE_IDS = ["f3", "f4", "f12", "f15"];

export const RESTAURANT = {
  name: "Happy Home",
  tagline: "Sri Lankan · Indian · Casual Luxury",
  address: "42 Bagatalle Road, Colombo 03",
  rating: 4.8,
  reviews: 3210,
  deliveryMinutes: "25–35 min",
  deliveryFee: "Rs. 250",
  deliveryRadiusKm: 8,
};
