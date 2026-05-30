# Integration Patches
# Apply these two small edits after dropping the restaurants module in.

## 1. apps/backend/src/modules/index.ts
# Add one export line:

+ export { createRestaurantsRouter } from './restaurants';


## 2. apps/backend/src/app.ts (or wherever routes are mounted)
# Add alongside the other router mounts:

+ import { createRestaurantsRouter } from './modules/restaurants';
+ app.use(`${config.apiPrefix}/restaurants`, createRestaurantsRouter());


## 3. apps/backend/src/modules/menu/services/menu-item.service.ts
# Inject RestaurantService so createMenuItem validates the restaurantId exists.
# Changes shown as diff:

### Constructor — add restaurantService param:

  constructor(
    private readonly menuItemRepo: MenuItemRepository,
    private readonly cache: CacheService,
+   private readonly restaurantService: RestaurantService,
  ) {}

### createMenuItem — add existence check before duplicate check:

  async createMenuItem(restaurantId: string, dto: CreateMenuItemDto, actorId: string) {
+   // Guard: restaurant must exist before we create a menu item for it
+   await this.restaurantService.assertRestaurantExists(restaurantId);
+
    const duplicate = await this.menuItemRepo.existsByNameAndRestaurant(dto.name, restaurantId);
    ...
  }

### menu.router.ts — pass restaurantService into MenuItemService:

  const menuItemRepo    = new MenuItemRepository();
  const cache           = new CacheService();
+ const restaurantRepo  = new RestaurantRepository();
+ const restaurantSvc   = new RestaurantService(restaurantRepo, cache);
- const service         = new MenuItemService(menuItemRepo, cache);
+ const service         = new MenuItemService(menuItemRepo, cache, restaurantSvc);
  const controller      = new MenuItemController(service);

# Also add these imports at the top of menu.router.ts:
+ import { RestaurantRepository } from '../restaurants/repositories/restaurant.repository';
+ import { RestaurantService }    from '../restaurants/services/restaurant.service';
