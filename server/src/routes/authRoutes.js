import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  getOptionalUserData,
  verifyPassword,
} from "../controllers/authController.js";
import auth from "../middleware/auth.js";
import optionalAuth from "../middleware/optionalAuth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.get("/me", optionalAuth, getOptionalUserData);
router.post("/logout", logout);
router.post("/verify-password", auth, verifyPassword);

export default router;
