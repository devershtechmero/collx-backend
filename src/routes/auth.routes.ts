import { FastifyInstance } from "fastify";
import {
  changePassword,
  deleteProfile,
  loginWithPassword,
  requestForgotPasswordOtp,
  requestSignupOtp,
  resetForgottenPassword,
  syncOauthUser,
  updateProfile,
  verifyLoginOtp,
  verifyForgotPasswordOtp,
  verifySignupOtp,
} from "../controllers/auth.controller";

const authRoutes = async (app: FastifyInstance) => {
  app.post("/sign-up/request-otp", requestSignupOtp);
  app.post("/sign-up/verify", verifySignupOtp);
  app.post("/login/request-otp", loginWithPassword);
  app.post("/login/verify", verifyLoginOtp);
  app.post("/oauth/sync", syncOauthUser);
  app.patch("/profile", updateProfile);
  app.patch("/profile/password", changePassword);
  app.delete("/profile", deleteProfile);
  app.post("/forgot-password/request-otp", requestForgotPasswordOtp);
  app.post("/forgot-password/verify", verifyForgotPasswordOtp);
  app.post("/forgot-password/reset", resetForgottenPassword);
};

export default authRoutes;
