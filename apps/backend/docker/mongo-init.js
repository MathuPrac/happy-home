db = db.getSiblingDB('restaurant_db');

db.createCollection('users');
db.createCollection('restaurants');
db.createCollection('menu_items');
db.createCollection('orders');
db.createCollection('riders');

// Indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phone: 1 }, { unique: true });
db.restaurants.createIndex({ location: '2dsphere' });
db.orders.createIndex({ customerId: 1, createdAt: -1 });
db.orders.createIndex({ restaurantId: 1, status: 1 });
db.riders.createIndex({ location: '2dsphere' });

print('✅ MongoDB initialized with collections and indexes');
