import { FastifyReply, FastifyRequest } from "fastify";
import { createClerkClient, verifyToken } from "@clerk/backend";
import handleResponse from "../service/handleResponse.service";
import OtpChallengeModel from "../models/otp-challenge.model";
import UserModel from "../models/user.model";
import {
  createDefaultName,
  createPasswordHash,
  createResetToken,
  generateOtp,
  getOtpExpiryDate,
  hashOtp,
  normalizeEmail,
  verifyOtp,
  verifyPasswordHash,
} from "../utils/auth.util";

type AuthBody = {
  email?: string;
  password?: string;
  otp?: string;
  resetToken?: string;
  name?: string;
  clerkId?: string;
};

const getClerkOauthProfile = async (clerkId: string) => {
  if (!process.env.CLERK_SECRET_KEY) {
    return null;
  }

  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });
  const clerkUser = await clerkClient.users.getUser(clerkId);
  const primaryEmailAddress =
    clerkUser.emailAddresses.find(
      (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ||
    clerkUser.emailAddresses[0]?.emailAddress;
  const externalProvider =
    clerkUser.externalAccounts.find((account) => account.provider === "google")?.provider ||
    undefined;

  return {
    email: primaryEmailAddress ? normalizeEmail(primaryEmailAddress) : undefined,
    authProvider: externalProvider === "google" ? "google" : "google",
    avatarImageUrl: clerkUser.imageUrl || undefined,
    name:
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
      clerkUser.username ||
      undefined,
  };
};

const OTP_PURPOSE_SIGN_UP = "sign-up";
const OTP_PURPOSE_LOGIN = "login";
const OTP_PURPOSE_FORGOT_PASSWORD = "forgot-password";

const getPreviewOtp = (otp: string) =>
  process.env.NODE_ENV === "production" ? undefined : otp;

const validateEmailAndPassword = (
  email: string | undefined,
  password: string | undefined,
) => {
  if (!email || !password) {
    return "Email and password are required.";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  return null;
};

const getBearerToken = (authorizationHeader?: string) => {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice("Bearer ".length).trim();
};

const verifyClerkUserFromRequest = async (
  authorizationHeader: string | undefined,
  clerkId: string | undefined,
) => {
  const token = getBearerToken(authorizationHeader);
  const jwtKey = process.env.CLERK_JWT_KEY;

  if (!token || !jwtKey || !clerkId) {
    return false;
  }

  const verifiedToken = await verifyToken(token, {
    jwtKey,
    authorizedParties: process.env.CLIENT_URL
      ? [process.env.CLIENT_URL]
      : undefined,
  });

  return verifiedToken.sub === clerkId;
};

export const requestSignupOtp = async (
  req: FastifyRequest<{ Body: AuthBody }>,
  rep: FastifyReply,
) => {
  const validationError = validateEmailAndPassword(
    req.body.email,
    req.body.password,
  );

  if (validationError) {
    return handleResponse(rep, 400, validationError);
  }

  const email = normalizeEmail(req.body.email!);
  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    return handleResponse(
      rep,
      409,
      "Account already exists. Please log in instead.",
    );
  }

  const otp = generateOtp();

  await OtpChallengeModel.findOneAndUpdate(
    { email, purpose: OTP_PURPOSE_SIGN_UP },
    {
      email,
      purpose: OTP_PURPOSE_SIGN_UP,
      codeHash: hashOtp(otp),
      passwordHash: createPasswordHash(req.body.password!),
      expiresAt: getOtpExpiryDate(),
      verifiedAt: undefined,
      resetToken: undefined,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return handleResponse(rep, 200, "Verification OTP sent successfully.", {
    previewOtp: getPreviewOtp(otp),
  });
};

export const verifySignupOtp = async (
  req: FastifyRequest<{ Body: AuthBody }>,
  rep: FastifyReply,
) => {
  const email = normalizeEmail(req.body.email || "");
  const otp = req.body.otp?.trim();

  if (!email || !otp) {
    return handleResponse(rep, 400, "Email and OTP are required.");
  }

  const challenge = await OtpChallengeModel.findOne({
    email,
    purpose: OTP_PURPOSE_SIGN_UP,
  });

  if (!challenge) {
    return handleResponse(rep, 404, "No sign up verification request found.");
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    await challenge.deleteOne();
    return handleResponse(rep, 400, "OTP has expired. Request a new one.");
  }

  if (!verifyOtp(otp, challenge.codeHash) || !challenge.passwordHash) {
    return handleResponse(rep, 400, "Invalid OTP.");
  }

  const user = await UserModel.create({
    email,
    name: req.body.name?.trim() || createDefaultName(email),
    passwordHash: challenge.passwordHash,
    isEmailVerified: true,
    authProviders: ["password"],
  });

  await challenge.deleteOne();

  return handleResponse(rep, 201, "Sign up completed successfully.", {
    user: {
      email: user.email,
      name: user.name,
    },
  });
};

export const loginWithPassword = async (
  req: FastifyRequest<{ Body: AuthBody }>,
  rep: FastifyReply,
) => {
  const validationError = validateEmailAndPassword(
    req.body.email,
    req.body.password,
  );

  if (validationError) {
    return handleResponse(rep, 400, validationError);
  }

  const email = normalizeEmail(req.body.email!);
  const user = await UserModel.findOne({ email });

  if (!user || !user.passwordHash) {
    return handleResponse(rep, 401, "Invalid email or password.");
  }

  const isValidPassword = verifyPasswordHash(
    req.body.password!,
    user.passwordHash,
  );

  if (!isValidPassword) {
    return handleResponse(rep, 401, "Invalid email or password.");
  }

  const otp = generateOtp();

  await OtpChallengeModel.findOneAndUpdate(
    { email, purpose: OTP_PURPOSE_LOGIN },
    {
      email,
      purpose: OTP_PURPOSE_LOGIN,
      codeHash: hashOtp(otp),
      expiresAt: getOtpExpiryDate(),
      verifiedAt: undefined,
      resetToken: undefined,
      passwordHash: undefined,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return handleResponse(rep, 200, "Login OTP sent successfully.", {
    previewOtp: getPreviewOtp(otp),
  });
};

export const verifyLoginOtp = async (
  req: FastifyRequest<{ Body: AuthBody }>,
  rep: FastifyReply,
) => {
  const email = normalizeEmail(req.body.email || "");
  const otp = req.body.otp?.trim();

  if (!email || !otp) {
    return handleResponse(rep, 400, "Email and OTP are required.");
  }

  const challenge = await OtpChallengeModel.findOne({
    email,
    purpose: OTP_PURPOSE_LOGIN,
  });

  if (!challenge) {
    return handleResponse(rep, 404, "No login verification request found.");
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    await challenge.deleteOne();
    return handleResponse(rep, 400, "OTP has expired. Request a new one.");
  }

  if (!verifyOtp(otp, challenge.codeHash)) {
    return handleResponse(rep, 400, "Invalid OTP.");
  }

  const user = await UserModel.findOne({ email });

  if (!user) {
    await challenge.deleteOne();
    return handleResponse(rep, 404, "Account not exist.");
  }

  await challenge.deleteOne();

  return handleResponse(rep, 200, "Login successful.", {
    user: {
      email: user.email,
      name: user.name,
    },
  });
};

export const requestForgotPasswordOtp = async (
  req: FastifyRequest<{ Body: AuthBody }>,
  rep: FastifyReply,
) => {
  const email = normalizeEmail(req.body.email || "");

  if (!email) {
    return handleResponse(rep, 400, "Email is required.");
  }

  const user = await UserModel.findOne({ email });

  if (!user || !user.passwordHash) {
    return handleResponse(rep, 404, "Account not exist.");
  }

  const otp = generateOtp();

  await OtpChallengeModel.findOneAndUpdate(
    { email, purpose: OTP_PURPOSE_FORGOT_PASSWORD },
    {
      email,
      purpose: OTP_PURPOSE_FORGOT_PASSWORD,
      codeHash: hashOtp(otp),
      expiresAt: getOtpExpiryDate(),
      verifiedAt: undefined,
      resetToken: undefined,
      passwordHash: undefined,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return handleResponse(rep, 200, "Password reset OTP sent successfully.", {
    previewOtp: getPreviewOtp(otp),
  });
};

export const verifyForgotPasswordOtp = async (
  req: FastifyRequest<{ Body: AuthBody }>,
  rep: FastifyReply,
) => {
  const email = normalizeEmail(req.body.email || "");
  const otp = req.body.otp?.trim();

  if (!email || !otp) {
    return handleResponse(rep, 400, "Email and OTP are required.");
  }

  const challenge = await OtpChallengeModel.findOne({
    email,
    purpose: OTP_PURPOSE_FORGOT_PASSWORD,
  });

  if (!challenge) {
    return handleResponse(rep, 404, "No forgot password request found.");
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    await challenge.deleteOne();
    return handleResponse(rep, 400, "OTP has expired. Request a new one.");
  }

  if (!verifyOtp(otp, challenge.codeHash)) {
    return handleResponse(rep, 400, "Invalid OTP.");
  }

  challenge.verifiedAt = new Date();
  challenge.resetToken = createResetToken();
  await challenge.save();

  return handleResponse(rep, 200, "OTP verified successfully.", {
    resetToken: challenge.resetToken,
  });
};

export const resetForgottenPassword = async (
  req: FastifyRequest<{ Body: AuthBody }>,
  rep: FastifyReply,
) => {
  const email = normalizeEmail(req.body.email || "");
  const password = req.body.password;
  const resetToken = req.body.resetToken?.trim();

  if (!email || !password || !resetToken) {
    return handleResponse(
      rep,
      400,
      "Email, reset token, and new password are required.",
    );
  }

  if (password.length < 6) {
    return handleResponse(rep, 400, "Password must be at least 6 characters.");
  }

  const challenge = await OtpChallengeModel.findOne({
    email,
    purpose: OTP_PURPOSE_FORGOT_PASSWORD,
  });

  if (
    !challenge ||
    !challenge.verifiedAt ||
    challenge.resetToken !== resetToken ||
    challenge.expiresAt.getTime() < Date.now()
  ) {
    return handleResponse(rep, 400, "Reset session is invalid or expired.");
  }

  const user = await UserModel.findOne({ email });

  if (!user) {
    return handleResponse(rep, 404, "Account not exist.");
  }

  user.passwordHash = createPasswordHash(password);

  if (!user.authProviders.includes("password")) {
    user.authProviders = [...user.authProviders, "password"];
  }

  await user.save();
  await challenge.deleteOne();

  return handleResponse(rep, 200, "Password updated successfully.");
};

export const syncOauthUser = async (
  req: FastifyRequest<{ Body: AuthBody }>,
  rep: FastifyReply,
) => {
  if (!req.body.clerkId) {
    return handleResponse(rep, 401, "Unauthorized request.");
  }

  try {
    const clerkId = req.body.clerkId?.trim();
    const fallbackEmail = normalizeEmail(req.body.email || "");
    const fallbackName = req.body.name?.trim();

    if (!clerkId) {
      return handleResponse(rep, 400, "Clerk ID is required.");
    }

    const isVerified = await verifyClerkUserFromRequest(
      req.headers.authorization,
      clerkId,
    );

    if (!isVerified) {
      return handleResponse(rep, 403, "Clerk user mismatch.");
    }

    const clerkProfile = await getClerkOauthProfile(clerkId);
    const email = clerkProfile?.email || fallbackEmail;
    const resolvedName = clerkProfile?.name || fallbackName;
    const authProvider = clerkProfile?.authProvider || "google";

    if (!email || !resolvedName) {
      return handleResponse(
        rep,
        400,
        "Unable to resolve Clerk profile details for this user.",
      );
    }

    let user = await UserModel.findOne({
      $or: [{ email }, { clerkId }],
    });

    if (!user) {
      user = await UserModel.create({
        email,
        clerkId,
        name: resolvedName,
        isEmailVerified: true,
        authProviders: [authProvider],
        authProvider,
        avatarImageUrl: clerkProfile?.avatarImageUrl,
      });
    } else {
      user.email = email;
      user.clerkId = clerkId;
      user.name = resolvedName;
      user.isEmailVerified = true;
      user.authProvider = authProvider;
      user.avatarImageUrl = clerkProfile?.avatarImageUrl;

      if (!user.authProviders.includes(authProvider)) {
        user.authProviders = [...user.authProviders, authProvider];
      }

      await user.save();
    }

    return handleResponse(rep, 200, "OAuth user synced successfully.", {
      user: {
        email: user.email,
        name: user.name,
      },
    });
  } catch {
    return handleResponse(rep, 401, "Invalid Clerk session.");
  }
};

export const syncProfile = async (req: FastifyRequest, rep: FastifyReply) => {
  try{
  }
  catch(err) {
    return handleResponse(rep, 401, "Invalid Clerk session.");
  }
}

export const updateProfile = async (
  req: FastifyRequest<{ Body: AuthBody }>,
  rep: FastifyReply,
) => {
  const email = normalizeEmail(req.body.email || "");
  const name = req.body.name?.trim();
  const clerkId = req.body.clerkId?.trim();

  if (!email || !name) {
    return handleResponse(rep, 400, "Email and name are required.");
  }

  if (clerkId) {
    try {
      const isVerified = await verifyClerkUserFromRequest(
        req.headers.authorization,
        clerkId,
      );

      if (!isVerified) {
        return handleResponse(rep, 403, "Clerk user mismatch.");
      }
    } catch {
      return handleResponse(rep, 401, "Invalid Clerk session.");
    }
  }

  const user = await UserModel.findOne({
    $or: [{ email }, ...(clerkId ? [{ clerkId }] : [])],
  });

  if (!user) {
    return handleResponse(rep, 404, "Account not exist.");
  }

  user.name = name;
  await user.save();

  return handleResponse(rep, 200, "Profile updated successfully.", {
    user: {
      email: user.email,
      name: user.name,
    },
  });
};

export const changePassword = async (
  req: FastifyRequest<{
    Body: AuthBody & { currentPassword?: string; newPassword?: string };
  }>,
  rep: FastifyReply,
) => {
  const email = normalizeEmail(req.body.email || "");
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;

  if (!email || !currentPassword || !newPassword) {
    return handleResponse(
      rep,
      400,
      "Email, current password, and new password are required.",
    );
  }

  if (newPassword.length < 6) {
    return handleResponse(rep, 400, "Password must be at least 6 characters.");
  }

  const user = await UserModel.findOne({ email });

  if (!user || !user.passwordHash) {
    return handleResponse(
      rep,
      400,
      "Password change is only available for email/password accounts.",
    );
  }

  const isValidPassword = verifyPasswordHash(currentPassword, user.passwordHash);

  if (!isValidPassword) {
    return handleResponse(rep, 401, "Current password is incorrect.");
  }

  user.passwordHash = createPasswordHash(newPassword);
  await user.save();

  return handleResponse(rep, 200, "Password updated successfully.");
};

export const deleteProfile = async (
  req: FastifyRequest<{ Body: AuthBody }>,
  rep: FastifyReply,
) => {
  const email = normalizeEmail(req.body.email || "");
  const clerkId = req.body.clerkId?.trim();

  if (!email) {
    return handleResponse(rep, 400, "Email is required.");
  }

  if (clerkId) {
    try {
      const isVerified = await verifyClerkUserFromRequest(
        req.headers.authorization,
        clerkId,
      );

      if (!isVerified) {
        return handleResponse(rep, 403, "Clerk user mismatch.");
      }

      if (process.env.CLERK_SECRET_KEY) {
        const clerkClient = createClerkClient({
          secretKey: process.env.CLERK_SECRET_KEY,
        });
        await clerkClient.users.deleteUser(clerkId);
      }
    } catch {
      return handleResponse(rep, 401, "Invalid Clerk session.");
    }
  }

  await OtpChallengeModel.deleteMany({ email });
  await UserModel.deleteMany({
    $or: [{ email }, ...(clerkId ? [{ clerkId }] : [])],
  });

  return handleResponse(rep, 200, "Account deleted successfully.");
};
