import { Schema, model, models } from "mongoose";

export type AuthProvider = "password" | "google";

export interface UserDocument {
  email: string;
  name: string;
  passwordHash?: string;
  isEmailVerified: boolean;
  authProviders: AuthProvider[];
  authProvider?: AuthProvider;
  clerkId?: string;
  avatarImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    authProviders: {
      type: [String],
      enum: ["password", "google"],
      default: [],
    },
    authProvider: {
      type: String,
      enum: ["password", "google"],
      trim: true,
    },
    clerkId: {
      type: String,
      trim: true,
    },
    avatarImageUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const UserModel = models.User || model<UserDocument>("User", userSchema);

export default UserModel;
