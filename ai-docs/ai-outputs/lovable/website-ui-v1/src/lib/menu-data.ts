import dish1 from "@/assets/dish-1.jpg";
import dish2 from "@/assets/dish-2.jpg";
import dish3 from "@/assets/dish-3.jpg";

export type Dish = {
  name: string;
  description: string;
  price: string;
  cuisine: "Sri Lankan" | "Indian";
  category: "Starters" | "Mains" | "Breads & Rice" | "Desserts";
  signature?: boolean;
  image?: string;
};

export const dishes: Dish[] = [
  { name: "Egg Hopper & Lunu Miris", description: "Bowl-shaped rice-flour crêpe, soft-set egg, chilli–onion sambol.", price: "14", cuisine: "Sri Lankan", category: "Starters", signature: true, image: dish1 },
  { name: "Crab Cutlets", description: "Galle-style spiced crab, panko crust, curry-leaf aioli.", price: "16", cuisine: "Sri Lankan", category: "Starters" },
  { name: "Tandoori Scallops", description: "Hand-dived scallops, smoked yoghurt, fenugreek oil.", price: "22", cuisine: "Indian", category: "Starters", signature: true },
  { name: "Papdi Chaat", description: "Crisp wafers, tamarind, mint, pomegranate pearls.", price: "12", cuisine: "Indian", category: "Starters" },

  { name: "Jaffna Black Pork Curry", description: "Slow-braised pork, roasted curry paste, toddy vinegar.", price: "32", cuisine: "Sri Lankan", category: "Mains", signature: true, image: dish3 },
  { name: "Negombo Prawn Curry", description: "Tiger prawns in coconut milk, pandan, drumstick.", price: "34", cuisine: "Sri Lankan", category: "Mains" },
  { name: "Butter Chicken", description: "Tandoor-charred chicken, tomato-fenugreek velouté.", price: "28", cuisine: "Indian", category: "Mains", signature: true, image: dish2 },
  { name: "Lamb Rogan Josh", description: "Kashmiri lamb shoulder, ratan jot, slow simmered.", price: "36", cuisine: "Indian", category: "Mains" },
  { name: "Paneer Makhani", description: "House-made paneer, cashew cream, kasuri methi.", price: "24", cuisine: "Indian", category: "Mains" },

  { name: "String Hoppers", description: "Steamed rice noodles, kiri hodi, pol sambol.", price: "9", cuisine: "Sri Lankan", category: "Breads & Rice" },
  { name: "Garlic Naan", description: "Tandoor-baked, cultured butter, sea salt.", price: "6", cuisine: "Indian", category: "Breads & Rice" },
  { name: "Saffron Basmati", description: "Aged basmati, Iranian saffron, fried shallot.", price: "8", cuisine: "Indian", category: "Breads & Rice" },

  { name: "Watalappan", description: "Kithul jaggery & coconut custard, cardamom, cashew praline.", price: "12", cuisine: "Sri Lankan", category: "Desserts", signature: true },
  { name: "Gulab Jamun", description: "Rose-scented syrup, pistachio, vanilla bean ice cream.", price: "11", cuisine: "Indian", category: "Desserts" },
];

export const categories = ["Starters", "Mains", "Breads & Rice", "Desserts"] as const;
