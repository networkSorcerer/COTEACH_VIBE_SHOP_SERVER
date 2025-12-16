import { Router } from "express";
import userRouter from "./users.js";
import authRouter from "./auth.js";
import productRouter from "./products.api.js";
const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "API root" });
});

router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/products", productRouter);

export default router;

