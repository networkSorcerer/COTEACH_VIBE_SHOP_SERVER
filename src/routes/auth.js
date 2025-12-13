import { Router } from "express";
import { login, me } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Debug middleware - log all requests to auth routes
router.use((req, res, next) => {
  console.log(`[Auth Router] ${req.method} ${req.path}`);
  next();
});

router.post("/login", login);
router.get("/me", authenticate, me);

export default router;

