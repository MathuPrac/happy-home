import { z } from 'zod';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/types';
import { ValidationError } from '@/core/errors/app-error';
import { ok, noContent, paginated, buildPaginationMeta } from '@/shared/http/response';
import type { UserService } from '../services/user.service';
import type { PaginationMeta } from '@/types';
import {
  updateProfileSchema,
  changePasswordSchema,
  adminUpdateUserSchema,
  listUsersQuerySchema,
  userParamsSchema,
} from '../validations/user.validators';

function parseOrThrow<S extends z.ZodSchema>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((issue) => ({
        field:   issue.path.join('.') || 'root',
        message: issue.message,
        code:    'VALIDATION_ERROR',
      })),
    );
  }
  return result.data as z.output<S>;
}

export class UserController {
  constructor(private readonly userService: UserService) {}

  // GET /users/me
  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = await this.userService.getMe(req.user.sub);
    ok(res, user);
  }

  // PATCH /users/me
  async updateMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    const dto  = parseOrThrow(updateProfileSchema, req.body);
    const user = await this.userService.updateMe(dto, req.user.sub);
    ok(res, user);
  }

  // PATCH /users/me/password
  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    const dto = parseOrThrow(changePasswordSchema, req.body);
    await this.userService.changePassword(dto, req.user.sub);
    noContent(res);
  }

  // GET /users — ADMIN
  async listUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = parseOrThrow(listUsersQuerySchema, req.query);

    const query = { page: parsed.page, limit: parsed.limit } as typeof parsed;
    if (parsed.role   !== undefined) query.role   = parsed.role;
    if (parsed.status !== undefined) query.status = parsed.status;
    if (parsed.search !== undefined) query.search = parsed.search;

    const result = await this.userService.listUsers(query);
    const { data, meta } = result as { data: unknown[]; meta: PaginationMeta };
    paginated(res, data, buildPaginationMeta(meta.page, meta.limit, meta.total));
  }

  // GET /users/:userId — ADMIN
  async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = parseOrThrow(userParamsSchema, req.params);
    const user = await this.userService.getUserById(userId);
    ok(res, user);
  }

  // PATCH /users/:userId — ADMIN
  async adminUpdateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = parseOrThrow(userParamsSchema, req.params);
    const dto        = parseOrThrow(adminUpdateUserSchema, req.body);
    const user = await this.userService.adminUpdateUser(
      userId, dto, req.user.sub, req.user.role,
    );
    ok(res, user);
  }

  // DELETE /users/:userId — ADMIN
  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = parseOrThrow(userParamsSchema, req.params);
    await this.userService.deleteUser(userId, req.user.sub, req.user.role);
    noContent(res);
  }

  // GET /users/stats — ADMIN
  async getUserStats(_req: AuthenticatedRequest, res: Response): Promise<void> {
    const stats = await this.userService.getUserStats();
    ok(res, stats);
  }
}
