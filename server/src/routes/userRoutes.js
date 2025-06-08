import supabase from "../utils/supabaseClient.js";
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";

const router = Router();

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("users")
      .select("full_name, role")
      .eq("id", id)
      .single();
    if (error || !data) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post("/update-phone", auth, async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    const userId = payload.id;
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ message: "Phone and password required" });
    const { data: user, error } = await supabase
      .from("users")
      .select("id, password_hash")
      .eq("id", userId)
      .single();
    if (error || !user)
      return res.status(404).json({ message: "User not found" });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: "Incorrect password" });
    const { error: updateError } = await supabase
      .from("users")
      .update({ phone })
      .eq("id", userId);
    if (updateError)
      return res.status(500).json({ message: "Failed to update phone number" });
    res.json({ message: "Phone number updated" });
  } catch (err) {
    next(err);
  }
});

export default router;
