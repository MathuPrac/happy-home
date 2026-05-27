export declare enum UserRole {
    CUSTOMER = "customer",
    RESTAURANT_OWNER = "restaurant_owner",
    RIDER = "rider",
    ADMIN = "admin"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    PENDING_VERIFICATION = "pending_verification"
}
export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PREPARING = "preparing",
    READY_FOR_PICKUP = "ready_for_pickup",
    OUT_FOR_DELIVERY = "out_for_delivery",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export declare enum PaymentMethod {
    CARD = "card",
    CASH = "cash",
    WALLET = "wallet"
}
export declare enum RiderStatus {
    AVAILABLE = "available",
    ON_DELIVERY = "on_delivery",
    OFFLINE = "offline"
}
export declare enum NotificationType {
    ORDER_UPDATE = "order_update",
    PAYMENT = "payment",
    PROMOTION = "promotion",
    SYSTEM = "system"
}
//# sourceMappingURL=enums.d.ts.map