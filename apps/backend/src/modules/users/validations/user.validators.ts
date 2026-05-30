import { z } from 'zod';
export {
  updateProfileSchema,
  changePasswordSchema,
  adminUpdateUserSchema,
  listUsersQuerySchema,
} from '../dtos/user.dto';

export const userParamsSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
});

export type UserParams = z.infer<typeof userParamsSchema>;
