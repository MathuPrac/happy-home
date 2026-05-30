import type { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import type { PaginationMeta, PaginationQuery } from '@restaurant/shared-types';

export abstract class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findMany(
    filter: FilterQuery<T> = {},
    query: PaginationQuery = {},
  ): Promise<{ data: T[]; meta: PaginationMeta }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;
    const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'status', 'name', 'basePrice', 'total', 'category'];
    const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const sort: Record<string, 1 | -1> = { [safeSortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: hasNextPage,
        hasPrev: hasPrevPage,
        hasNextPage,
        hasPrevPage,
      } as unknown as PaginationMeta,
    };
  }

  async create(data: Partial<T>): Promise<T> {
    const doc = new this.model(data);
    return doc.save();
  }

  async update(id: string, data: UpdateQuery<T>, options?: QueryOptions): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true, ...options }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async softDelete(id: string): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, { isActive: false, deletedAt: new Date() }, { new: true })
      .exec();
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).exec();
    return count > 0;
  }
}
