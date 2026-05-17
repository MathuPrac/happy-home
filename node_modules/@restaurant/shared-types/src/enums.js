"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.RiderStatus = exports.PaymentMethod = exports.PaymentStatus = exports.OrderStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "customer";
    UserRole["RESTAURANT_OWNER"] = "restaurant_owner";
    UserRole["RIDER"] = "rider";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["CONFIRMED"] = "confirmed";
    OrderStatus["PREPARING"] = "preparing";
    OrderStatus["READY_FOR_PICKUP"] = "ready_for_pickup";
    OrderStatus["OUT_FOR_DELIVERY"] = "out_for_delivery";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PROCESSING"] = "processing";
    PaymentStatus["COMPLETED"] = "completed";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CARD"] = "card";
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["WALLET"] = "wallet";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var RiderStatus;
(function (RiderStatus) {
    RiderStatus["AVAILABLE"] = "available";
    RiderStatus["ON_DELIVERY"] = "on_delivery";
    RiderStatus["OFFLINE"] = "offline";
})(RiderStatus || (exports.RiderStatus = RiderStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["ORDER_UPDATE"] = "order_update";
    NotificationType["PAYMENT"] = "payment";
    NotificationType["PROMOTION"] = "promotion";
    NotificationType["SYSTEM"] = "system";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
//# sourceMappingURL=enums.js.map