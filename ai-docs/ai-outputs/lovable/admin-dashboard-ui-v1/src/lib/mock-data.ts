export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "assigned"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "card" | "wallet";

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  payment: PaymentMethod;
  createdAt: string;
  channel: "Dine-in" | "Delivery" | "Takeaway";
  rider?: string;
  eta?: number;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  assigned: "Assigned to Rider",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const orders: Order[] = [
  {
    id: "HH1024",
    customer: "Nimal Perera",
    phone: "+94 77 234 1122",
    address: "14/B, Galle Road, Colombo 03",
    items: [
      { name: "Chicken Kottu", qty: 2, price: 1200 },
      { name: "Butter Chicken", qty: 1, price: 1450 },
      { name: "Mojito", qty: 3, price: 450 },
    ],
    total: 5200,
    status: "preparing",
    payment: "card",
    createdAt: "2 min ago",
    channel: "Delivery",
    eta: 22,
  },
  {
    id: "HH1025",
    customer: "Aisha Khan",
    phone: "+94 71 998 4423",
    address: "55, Marine Drive, Mount Lavinia",
    items: [
      { name: "Shawarma", qty: 2, price: 850 },
      { name: "Mixed Fried Rice", qty: 1, price: 1100 },
      { name: "Faluda", qty: 2, price: 550 },
    ],
    total: 3900,
    status: "ready",
    payment: "cod",
    createdAt: "6 min ago",
    channel: "Delivery",
    eta: 14,
  },
  {
    id: "HH1026",
    customer: "Ravi Sharma",
    phone: "+94 76 112 5588",
    address: "Table 7",
    items: [
      { name: "Paneer Tikka Masala", qty: 1, price: 1350 },
      { name: "Garlic Naan", qty: 4, price: 280 },
      { name: "Mango Lassi", qty: 2, price: 480 },
    ],
    total: 3430,
    status: "accepted",
    payment: "card",
    createdAt: "9 min ago",
    channel: "Dine-in",
  },
  {
    id: "HH1027",
    customer: "Sahan Fernando",
    phone: "+94 70 445 2211",
    address: "201, Havelock Road, Colombo 05",
    items: [
      { name: "Devilled Chicken", qty: 1, price: 1550 },
      { name: "Egg Fried Rice", qty: 2, price: 950 },
    ],
    total: 3450,
    status: "out_for_delivery",
    payment: "card",
    createdAt: "18 min ago",
    channel: "Delivery",
    rider: "Kamal R.",
    eta: 8,
  },
  {
    id: "HH1028",
    customer: "Priya Menon",
    phone: "+94 78 332 9988",
    address: "9, Park Street, Colombo 02",
    items: [
      { name: "Masala Dosa", qty: 2, price: 720 },
      { name: "Filter Coffee", qty: 2, price: 280 },
    ],
    total: 2000,
    status: "pending",
    payment: "cod",
    createdAt: "Just now",
    channel: "Takeaway",
  },
  {
    id: "HH1029",
    customer: "Imran Hussain",
    phone: "+94 75 221 1188",
    address: "32, Duplication Rd, Colombo 04",
    items: [
      { name: "Biryani Chicken", qty: 3, price: 1280 },
      { name: "Raita", qty: 2, price: 220 },
    ],
    total: 4280,
    status: "delivered",
    payment: "card",
    createdAt: "1 hr ago",
    channel: "Delivery",
    rider: "Sunil P.",
  },
  {
    id: "HH1030",
    customer: "Tharushi Silva",
    phone: "+94 77 887 4321",
    address: "Table 3",
    items: [
      { name: "String Hoppers", qty: 10, price: 60 },
      { name: "Pol Sambol", qty: 1, price: 180 },
      { name: "Dhal Curry", qty: 1, price: 320 },
    ],
    total: 1100,
    status: "assigned",
    payment: "wallet",
    createdAt: "12 min ago",
    channel: "Delivery",
    rider: "Anjana T.",
    eta: 18,
  },
];

export interface Rider {
  id: string;
  name: string;
  phone: string;
  status: "available" | "busy" | "offline";
  activeOrder?: string;
  deliveries: number;
  rating: number;
  vehicle: string;
  zone: string;
}

export const riders: Rider[] = [
  { id: "R-01", name: "Kamal Rajapaksa", phone: "+94 77 111 2222", status: "busy", activeOrder: "HH1027", deliveries: 124, rating: 4.8, vehicle: "Bike", zone: "Colombo 05" },
  { id: "R-02", name: "Sunil Perera", phone: "+94 71 333 4444", status: "available", deliveries: 98, rating: 4.6, vehicle: "Bike", zone: "Colombo 03" },
  { id: "R-03", name: "Anjana Tissera", phone: "+94 76 555 6666", status: "busy", activeOrder: "HH1030", deliveries: 211, rating: 4.9, vehicle: "Scooter", zone: "Mount Lavinia" },
  { id: "R-04", name: "Roshan De Silva", phone: "+94 70 777 8888", status: "available", deliveries: 67, rating: 4.5, vehicle: "Bike", zone: "Dehiwala" },
  { id: "R-05", name: "Nuwan Bandara", phone: "+94 78 999 0000", status: "offline", deliveries: 142, rating: 4.7, vehicle: "Scooter", zone: "Colombo 04" },
];

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  loyaltyPoints: number;
  lastOrder: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
}

export const customers: Customer[] = [
  { id: "C-1001", name: "Nimal Perera", email: "nimal@example.lk", phone: "+94 77 234 1122", orders: 42, spent: 184500, loyaltyPoints: 1840, lastOrder: "2 min ago", tier: "Gold" },
  { id: "C-1002", name: "Aisha Khan", email: "aisha.k@example.lk", phone: "+94 71 998 4423", orders: 18, spent: 62300, loyaltyPoints: 620, lastOrder: "6 min ago", tier: "Silver" },
  { id: "C-1003", name: "Ravi Sharma", email: "ravi@example.lk", phone: "+94 76 112 5588", orders: 73, spent: 312800, loyaltyPoints: 3120, lastOrder: "9 min ago", tier: "Platinum" },
  { id: "C-1004", name: "Sahan Fernando", email: "sahan.f@example.lk", phone: "+94 70 445 2211", orders: 9, spent: 24500, loyaltyPoints: 245, lastOrder: "18 min ago", tier: "Bronze" },
  { id: "C-1005", name: "Priya Menon", email: "priya@example.lk", phone: "+94 78 332 9988", orders: 31, spent: 98700, loyaltyPoints: 985, lastOrder: "Just now", tier: "Silver" },
  { id: "C-1006", name: "Imran Hussain", email: "imran@example.lk", phone: "+94 75 221 1188", orders: 56, spent: 221400, loyaltyPoints: 2210, lastOrder: "1 hr ago", tier: "Gold" },
];

export interface Reservation {
  id: string;
  guest: string;
  phone: string;
  partySize: number;
  date: string;
  time: string;
  table: string;
  status: "confirmed" | "pending" | "seated" | "cancelled";
  note?: string;
}

export const reservations: Reservation[] = [
  { id: "RV-301", guest: "Dilani Wickrema", phone: "+94 77 555 1212", partySize: 4, date: "Today", time: "7:30 PM", table: "T-08", status: "confirmed", note: "Window seat" },
  { id: "RV-302", guest: "Mahesh Kumar", phone: "+94 71 222 8989", partySize: 2, date: "Today", time: "8:00 PM", table: "T-03", status: "seated" },
  { id: "RV-303", guest: "Fathima R.", phone: "+94 76 671 4501", partySize: 6, date: "Tomorrow", time: "1:00 PM", table: "T-11", status: "pending", note: "Birthday cake" },
  { id: "RV-304", guest: "Lakshan Silva", phone: "+94 70 884 2210", partySize: 3, date: "Tomorrow", time: "7:45 PM", table: "T-05", status: "confirmed" },
  { id: "RV-305", guest: "Sanduni P.", phone: "+94 78 230 6611", partySize: 2, date: "Today", time: "9:15 PM", table: "T-02", status: "cancelled" },
];

export interface MenuCategory {
  id: string;
  name: string;
  items: number;
  emoji: string;
}

export const categories: MenuCategory[] = [
  { id: "cat-sl", name: "Sri Lankan", items: 24, emoji: "🥥" },
  { id: "cat-in", name: "Indian", items: 31, emoji: "🍛" },
  { id: "cat-bbq", name: "BBQ & Grill", items: 12, emoji: "🔥" },
  { id: "cat-bev", name: "Beverages", items: 18, emoji: "🥤" },
  { id: "cat-des", name: "Desserts", items: 9, emoji: "🍮" },
  { id: "cat-kid", name: "Kids", items: 7, emoji: "🧒" },
];

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  popular: boolean;
  prepTime: number;
  stock: "high" | "medium" | "low";
}

export const foodItems: FoodItem[] = [
  { id: "F-101", name: "Chicken Kottu", category: "Sri Lankan", price: 1200, available: true, popular: true, prepTime: 18, stock: "high" },
  { id: "F-102", name: "Butter Chicken", category: "Indian", price: 1450, available: true, popular: true, prepTime: 22, stock: "medium" },
  { id: "F-103", name: "Shawarma", category: "BBQ & Grill", price: 850, available: true, popular: true, prepTime: 12, stock: "high" },
  { id: "F-104", name: "Mixed Fried Rice", category: "Sri Lankan", price: 1100, available: true, popular: false, prepTime: 15, stock: "high" },
  { id: "F-105", name: "Faluda", category: "Beverages", price: 550, available: true, popular: false, prepTime: 6, stock: "medium" },
  { id: "F-106", name: "Paneer Tikka Masala", category: "Indian", price: 1350, available: true, popular: true, prepTime: 20, stock: "low" },
  { id: "F-107", name: "Masala Dosa", category: "Indian", price: 720, available: true, popular: false, prepTime: 14, stock: "high" },
  { id: "F-108", name: "Devilled Chicken", category: "Sri Lankan", price: 1550, available: false, popular: true, prepTime: 18, stock: "low" },
  { id: "F-109", name: "Biryani Chicken", category: "Indian", price: 1280, available: true, popular: true, prepTime: 25, stock: "medium" },
  { id: "F-110", name: "String Hoppers (10)", category: "Sri Lankan", price: 600, available: true, popular: false, prepTime: 10, stock: "high" },
];

export const revenueSeries = [
  { day: "Mon", revenue: 142000, orders: 86 },
  { day: "Tue", revenue: 168000, orders: 102 },
  { day: "Wed", revenue: 151000, orders: 94 },
  { day: "Thu", revenue: 198000, orders: 121 },
  { day: "Fri", revenue: 246000, orders: 158 },
  { day: "Sat", revenue: 312000, orders: 196 },
  { day: "Sun", revenue: 274000, orders: 172 },
];

export const channelMix = [
  { name: "Delivery", value: 58 },
  { name: "Dine-in", value: 28 },
  { name: "Takeaway", value: 14 },
];

export const paymentMix = [
  { name: "Card", value: 64 },
  { name: "COD", value: 28 },
  { name: "Wallet", value: 8 },
];

export const topItems = [
  { name: "Chicken Kottu", sold: 312, revenue: 374400 },
  { name: "Butter Chicken", sold: 248, revenue: 359600 },
  { name: "Biryani Chicken", sold: 221, revenue: 282880 },
  { name: "Shawarma", sold: 198, revenue: 168300 },
  { name: "Paneer Tikka Masala", sold: 142, revenue: 191700 },
];

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "order" | "kitchen" | "rider" | "system";
  unread: boolean;
}

export const notifications: Notification[] = [
  { id: "n1", title: "New order #HH1028", body: "Priya Menon · Takeaway · Rs 2,000", time: "Just now", type: "order", unread: true },
  { id: "n2", title: "Order #HH1025 ready", body: "Kitchen marked ready for pickup", time: "2 min", type: "kitchen", unread: true },
  { id: "n3", title: "Rider Kamal accepted #HH1027", body: "ETA 8 min to customer", time: "5 min", type: "rider", unread: true },
  { id: "n4", title: "Low stock: Paneer", body: "Inventory dropped below threshold", time: "22 min", type: "system", unread: false },
  { id: "n5", title: "5-star review from Ravi S.", body: "\"Best butter chicken in town!\"", time: "1 hr", type: "system", unread: false },
];

export interface Feedback {
  id: string;
  customer: string;
  rating: number;
  comment: string;
  order: string;
  time: string;
}

export const feedback: Feedback[] = [
  { id: "fb1", customer: "Ravi Sharma", rating: 5, comment: "Best butter chicken in town! Kottu was perfect.", order: "HH1019", time: "1 hr ago" },
  { id: "fb2", customer: "Aisha Khan", rating: 4, comment: "Delivery was fast. Faluda could be colder.", order: "HH1015", time: "3 hr ago" },
  { id: "fb3", customer: "Sahan Fernando", rating: 3, comment: "Food was good but arrived 15 min late.", order: "HH1011", time: "6 hr ago" },
  { id: "fb4", customer: "Priya Menon", rating: 5, comment: "Authentic dosa, just like home!", order: "HH1008", time: "Yesterday" },
];

export interface Ticket {
  id: string;
  subject: string;
  customer: string;
  priority: "low" | "medium" | "high";
  status: "open" | "pending" | "resolved";
  updated: string;
}

export const tickets: Ticket[] = [
  { id: "T-441", subject: "Missing item in order #HH1019", customer: "Ravi Sharma", priority: "high", status: "open", updated: "10 min ago" },
  { id: "T-440", subject: "Refund request for #HH1011", customer: "Sahan Fernando", priority: "medium", status: "pending", updated: "2 hr ago" },
  { id: "T-439", subject: "Wrong address delivered", customer: "Nuwan B.", priority: "high", status: "open", updated: "3 hr ago" },
  { id: "T-438", subject: "App crash during checkout", customer: "Tharushi Silva", priority: "low", status: "resolved", updated: "Yesterday" },
];

export interface ActivityLog {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  time: string;
}

export const activityLogs: ActivityLog[] = [
  { id: "a1", actor: "Admin Saman", role: "Admin", action: "updated price", target: "Butter Chicken → Rs 1,450", time: "5 min ago" },
  { id: "a2", actor: "Reception Niluka", role: "Receptionist", action: "accepted order", target: "#HH1026", time: "9 min ago" },
  { id: "a3", actor: "Kitchen Lead", role: "Kitchen", action: "marked ready", target: "#HH1025", time: "11 min ago" },
  { id: "a4", actor: "Coord. Janaka", role: "Delivery", action: "assigned rider", target: "Kamal R. → #HH1027", time: "14 min ago" },
  { id: "a5", actor: "Admin Saman", role: "Admin", action: "created coupon", target: "WEEKEND20", time: "1 hr ago" },
];

export interface StaffMember {
  id: string;
  name: string;
  role: "Admin" | "Receptionist" | "Kitchen" | "Order Manager" | "Delivery Coordinator";
  email: string;
  status: "active" | "inactive";
  lastSeen: string;
}

export const staff: StaffMember[] = [
  { id: "S-01", name: "Saman Wijesekara", role: "Admin", email: "saman@happyhome.lk", status: "active", lastSeen: "Online" },
  { id: "S-02", name: "Niluka Dias", role: "Receptionist", email: "niluka@happyhome.lk", status: "active", lastSeen: "Online" },
  { id: "S-03", name: "Chef Pradeep", role: "Kitchen", email: "pradeep@happyhome.lk", status: "active", lastSeen: "2 min ago" },
  { id: "S-04", name: "Janaka Herath", role: "Delivery Coordinator", email: "janaka@happyhome.lk", status: "active", lastSeen: "Online" },
  { id: "S-05", name: "Madhavi R.", role: "Order Manager", email: "madhavi@happyhome.lk", status: "inactive", lastSeen: "Yesterday" },
];

export interface Coupon {
  id: string;
  code: string;
  discount: string;
  uses: number;
  limit: number;
  expires: string;
  status: "active" | "expired" | "scheduled";
}

export const coupons: Coupon[] = [
  { id: "c1", code: "WEEKEND20", discount: "20% off", uses: 142, limit: 500, expires: "May 31, 2026", status: "active" },
  { id: "c2", code: "FIRSTBITE", discount: "Rs 300 off", uses: 87, limit: 200, expires: "Jun 15, 2026", status: "active" },
  { id: "c3", code: "FAMILYFEAST", discount: "15% off · min Rs 5,000", uses: 34, limit: 100, expires: "Jul 01, 2026", status: "scheduled" },
  { id: "c4", code: "DIWALI25", discount: "25% off", uses: 412, limit: 412, expires: "Nov 12, 2025", status: "expired" },
];

export const inventoryItems = [
  { id: "i1", name: "Chicken Breast", qty: 48, unit: "kg", threshold: 20, status: "ok" as const },
  { id: "i2", name: "Basmati Rice", qty: 120, unit: "kg", threshold: 40, status: "ok" as const },
  { id: "i3", name: "Paneer", qty: 4, unit: "kg", threshold: 8, status: "low" as const },
  { id: "i4", name: "Coconut Milk", qty: 32, unit: "L", threshold: 15, status: "ok" as const },
  { id: "i5", name: "Garam Masala", qty: 1.2, unit: "kg", threshold: 2, status: "low" as const },
  { id: "i6", name: "Yogurt", qty: 22, unit: "L", threshold: 10, status: "ok" as const },
  { id: "i7", name: "Ghee", qty: 0.8, unit: "kg", threshold: 3, status: "critical" as const },
];
