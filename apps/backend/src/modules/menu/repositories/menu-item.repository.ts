import type { PaginationQuery } from '@restaurant/shared-types';
import { BaseRepository } from '../../../infrastructure/database/mongodb/base.repository';
import { MenuItemModel, type IMenuItem, MenuCategory } from '../entities/menu-item.entity';

// Kept separate from PaginationQuery to avoid exactOptionalPropertyTypes
// inheritance conflicts — menu-specific filters are composed at call sites.
export interface MenuItemFilters {
  category?: MenuCategory | undefined;
  isAvailable?: boolean | undefined;
  search?: string | undefined;
}

export type MenuItemListQuery = PaginationQuery & MenuItemFilters;

export class MenuItemRepository extends BaseRepository<IMenuItem> {
  constructor() {
    super(MenuItemModel);
  }

  async findByRestaurant(restaurantId: string, query: MenuItemListQuery) {
    const { category, isAvailable, search, ...paginationQuery } = query;

    const filter: Record<string, unknown> = { restaurantId };

    if (category !== undefined) {
      filter['category'] = category;
    }

    if (isAvailable !== undefined) {
      filter['isAvailable'] = isAvailable;
    }

    if (search !== undefined && search.length > 0) {
      filter['$or'] = [
        { name:        { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags:        { $in: [new RegExp(search, 'i')] } },
      ];
    }

    return this.findMany(filter, paginationQuery);
  }

  async findByRestaurantAndId(restaurantId: string, itemId: string) {
    return this.findOne({ _id: itemId, restaurantId });
  }

  async existsByNameAndRestaurant(
    name: string,
    restaurantId: string,
    excludeId?: string | undefined,
  ) {
    const filter: Record<string, unknown> = {
      name: { $regex: `^${name}$`, $options: 'i' },
      restaurantId,
    };
    if (excludeId !== undefined) {
      filter['_id'] = { $ne: excludeId };
    }
    return this.exists(filter);
  }

  /**
   * Look up price and availability for a set of menu item IDs.
   * When restaurantId is provided it is added to the query as an extra
   * safety constraint; omit (or pass undefined) to query by _id alone.
   */
  async findByIds(
    ids: string[],
    restaurantId?: string,
  ): Promise<Array<{ id: string; price: number; isAvailable: boolean }>> {
    const filter: Record<string, unknown> = { _id: { $in: ids } };
    if (restaurantId) {
      filter['restaurantId'] = restaurantId;
    }
    const docs = await this.model
      .find(filter)
      .select('_id price isAvailable')
      .lean()
      .exec();
    return docs.map((doc) => {
      const d = doc as unknown as { _id: unknown; price: number; isAvailable: boolean };
      return { id: String(d._id), price: d.price, isAvailable: d.isAvailable };
    });
  }
}
