import bcrypt from "bcryptjs";
import User from "../models/User.js";

const SALT_ROUNDS = 10;

export async function createUser(req, res) {
  try {
    const { email, name, password, user_type, address } = req.body;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      user_type,
      address,
    });
    const { password: _pw, ...safeUser } = user.toObject();
    res.status(201).json(safeUser);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(400).json({ message: "Failed to create user", error: err.message });
  }
}

export async function getUsers(_req, res) {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
}

export async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "Failed to fetch user", error: err.message });
  }
}

export async function updateUser(req, res) {
  try {
    const { email, name, password, user_type, address } = req.body;
    const updateData = { email, name, user_type, address };

    if (password) {
      updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    // remove undefined fields to avoid overwriting with undefined
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const updated = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
      overwrite: false,
    }).select("-password");
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(400).json({ message: "Failed to update user", error: err.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id).select("-password");
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(deleted);
  } catch (err) {
    res.status(400).json({ message: "Failed to delete user", error: err.message });
  }
}

