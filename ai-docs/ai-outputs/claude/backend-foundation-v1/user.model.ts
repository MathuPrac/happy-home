import mongoose, { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { BaseDocument, UserRole, UserStatus } from '../../types';

const bcryptRounds = parseInt(process.env['BCRYPT_ROUNDS'] ?? '12', 10);

export interface IUser extends BaseDocument {
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  refreshTokenFamily?: string;
  lastLoginAt?: Date;
  emailVerifiedAt?: Date;
  passwordChangedAt?: Date;
  comparePassword(plain: string): Promise<boolean>;
  fullName(): string;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.CUSTOMER, index: true },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.PENDING_VERIFICATION, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    phone:     { type: String, trim: true, sparse: true },
    avatarUrl: { type: String },
    refreshTokenFamily: { type: String, select: false },
    lastLoginAt:        { type: Date },
    emailVerifiedAt:    { type: Date },
    passwordChangedAt:  { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret['passwordHash'];
        delete ret['refreshTokenFamily'];
        delete ret['__v'];
        return ret;
      },
    },
  },
);

userSchema.index({ role: 1, status: 1 });

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, bcryptRounds);
  this.passwordChangedAt = new Date();
  next();
});

userSchema.methods.comparePassword = async function (this: IUser, plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.fullName = function (this: IUser): string {
  return `${this.firstName} ${this.lastName}`;
};

export const User = model<IUser>('User', userSchema);
