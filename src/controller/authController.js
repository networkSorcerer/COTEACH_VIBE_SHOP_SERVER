import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }
  return secret;
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const jwtSecret = getJwtSecret();
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email, user_type: user.user_type },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    const { password: _pw, ...safeUser } = user.toObject();
    res.json({ token, user: safeUser });
  } catch (err) {
    if (err.message.includes("JWT_SECRET is not set")) {
      return res.status(500).json({ message: err.message });
    }
    res.status(500).json({ message: "Login failed", error: err.message });
  }
}

export async function me(req, res) {
  try {
    const userId = req.userId || res.locals.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
}

