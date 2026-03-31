import { Schema, model, models } from "mongoose";

export type OtpPurpose = "sign-up" | "login" | "forgot-password";

export interface OtpChallengeDocument {
  email: string;
  purpose: OtpPurpose;
  codeHash: string;
  passwordHash?: string;
  expiresAt: Date;
  verifiedAt?: Date;
  resetToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const otpChallengeSchema = new Schema<OtpChallengeDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    purpose: {
      type: String,
      enum: ["sign-up", "login", "forgot-password"],
      required: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    passwordHash: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verifiedAt: {
      type: Date,
    },
    resetToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

otpChallengeSchema.index({ email: 1, purpose: 1 }, { unique: true });

const OtpChallengeModel =
  models.OtpChallenge ||
  model<OtpChallengeDocument>("OtpChallenge", otpChallengeSchema);

export default OtpChallengeModel;
