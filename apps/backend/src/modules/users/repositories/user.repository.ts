import { User, type IUser } from 'backend/dist/modules/users/models/user.model';
import type { ListUsersQuery } from '../dtos/user.dto';
import type { PaginationMeta } from '@/types';
import { UserRole } from '@restaurant/shared-types';

export class UserRepository {
  // ── Find ──────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return User.findById(id).select('+passwordHash');
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  // ── List (admin) ──────────────────────────────────────────────────────────

  async findAll(
    query: ListUsersQuery,
  ): Promise<{ data: IUser[]; meta: PaginationMeta }> {
    const { page, limit, role, status, search } = query;
    const filter: Record<string, unknown> = {};

    if (role   !== undefined) filter['role']   = role;
    if (status !== undefined) filter['status'] = status;

    if (search !== undefined && search.length > 0) {
      filter['$or'] = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } },
      ];
    }

    const skip  = (page - 1) * limit;
    const total = await User.countDocuments(filter);
    const data  = await User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async updateById(
    id:     string,
    fields: Partial<Pick<IUser, 'firstName' | 'lastName' | 'phone' | 'avatarUrl' | 'role' | 'status' | 'passwordHash'>>,
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, fields, { new: true });
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async deleteById(id: string): Promise<void> {
    await User.findByIdAndDelete(id);
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  async countByRole(): Promise<Record<string, number>> {
    const results = await User.aggregate<{ _id: UserRole; count: number }>([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    return Object.fromEntries(results.map((r: { _id: UserRole; count: number }) => [r._id, r.count]));
  }
}
