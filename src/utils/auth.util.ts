import { randomBytes, randomInt, scryptSync, timingSafeEqual } from "crypto";

const OTP_LENGTH = 8;
const OTP_TTL_MINUTES = 10;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const createDefaultName = (email: string) => {
  const localPart = normalizeEmail(email).split("@")[0] || "Collector";

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const generateOtp = () =>
  Array.from({ length: OTP_LENGTH }, () => randomInt(0, 10)).join("");

const getOtpExpiryDate = () =>
  new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

const createPasswordHash = (value: string) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(value, salt, 64).toString("hex");

  return `${salt}:${hash}`;
};

const verifyPasswordHash = (value: string, storedHash: string) => {
  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const derivedHash = scryptSync(value, salt, 64);
  const storedBuffer = Buffer.from(hash, "hex");

  if (storedBuffer.length !== derivedHash.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, derivedHash);
};

const hashOtp = (otp: string) => createPasswordHash(otp);

const verifyOtp = (otp: string, storedHash: string) =>
  verifyPasswordHash(otp, storedHash);

const createResetToken = () => randomBytes(24).toString("hex");

export {
  createDefaultName,
  createPasswordHash,
  createResetToken,
  generateOtp,
  getOtpExpiryDate,
  hashOtp,
  normalizeEmail,
  verifyOtp,
  verifyPasswordHash,
};
