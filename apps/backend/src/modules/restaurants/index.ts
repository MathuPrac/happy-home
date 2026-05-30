export { createRestaurantsRouter } from '@/modules/restaurants/restaurants.router';
export { RestaurantService } from './services/restaurant.service';
export { RestaurantRepository } from './repositories/restaurant.repository';
export { RestaurantModel, CuisineType } from './entities/restaurant.entity';
export type { IRestaurant, IAddress, IOpeningHours } from './entities/restaurant.entity';
export type { CreateRestaurantDto, UpdateRestaurantDto, AdminPatchRestaurantDto } from './dtos/restaurant.dto';
