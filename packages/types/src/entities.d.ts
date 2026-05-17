import type { UserRole, OrderStatus, PaymentStatus, PaymentMethod, RiderStatus } from './enums';
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}
export interface User extends BaseEntity {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatar?: string;
    isVerified: boolean;
    isActive: boolean;
}
export interface Restaurant extends BaseEntity {
    ownerId: string;
    name: string;
    description: string;
    cuisine: string[];
    address: Address;
    coverImage?: string;
    logo?: string;
    rating: number;
    totalRatings: number;
    isActive: boolean;
    isOpen: boolean;
    openingHours: OpeningHours[];
    deliveryRadius: number;
    minimumOrder: number;
    deliveryFee: number;
    estimatedDeliveryTime: number;
}
export interface OpeningHours {
    day: number;
    open: string;
    close: string;
    isClosed: boolean;
}
export interface MenuCategory extends BaseEntity {
    restaurantId: string;
    name: string;
    description?: string;
    sortOrder: number;
    isActive: boolean;
}
export interface MenuItem extends BaseEntity {
    restaurantId: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    isAvailable: boolean;
    isVegetarian: boolean;
    isVegan: boolean;
    allergens: string[];
    nutritionInfo?: NutritionInfo;
    customizations: MenuItemCustomization[];
}
export interface NutritionInfo {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}
export interface MenuItemCustomization {
    id: string;
    name: string;
    required: boolean;
    maxSelections: number;
    options: CustomizationOption[];
}
export interface CustomizationOption {
    id: string;
    name: string;
    price: number;
}
export interface Order extends BaseEntity {
    customerId: string;
    restaurantId: string;
    riderId?: string;
    items: OrderItem[];
    status: OrderStatus;
    subtotal: number;
    deliveryFee: number;
    tax: number;
    discount: number;
    total: number;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    deliveryAddress: Address;
    notes?: string;
    estimatedDeliveryTime?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
    cancelReason?: string;
}
export interface OrderItem {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    customizations: SelectedCustomization[];
    subtotal: number;
}
export interface SelectedCustomization {
    customizationId: string;
    optionId: string;
    name: string;
    price: number;
}
export interface Rider extends BaseEntity {
    userId: string;
    vehicleType: string;
    vehicleNumber: string;
    licenseNumber: string;
    status: RiderStatus;
    currentLocation?: {
        lat: number;
        lng: number;
    };
    rating: number;
    totalDeliveries: number;
    totalEarnings: number;
    isVerified: boolean;
}
//# sourceMappingURL=entities.d.ts.map