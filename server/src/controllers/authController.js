import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import supabase from "../utils/supabaseClient.js";

const saveRefreshToken = async (userId, token) => {
  await supabase.from("refresh_tokens").insert({ user_id: userId, token });
};

const deleteRefreshToken = async (token) => {
  await supabase.from("refresh_tokens").delete().eq("token", token);
};

const checkRefreshToken = async (userId, token) => {
  const { data, error } = await supabase
    .from("refresh_tokens")
    .select("*")
    .eq("user_id", userId)
    .eq("token", token)
    .single();

  return data && !error;
};

export const register = async (req, res, next) => {
  try {
    const { fullName, phone, password, role, rt_id, kelurahan_id } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([
        {
          full_name: fullName,
          phone: phone,
          password_hash: hashedPassword,
          role: role,
          rt_id: rt_id,
          kelurahan_id: kelurahan_id,
        },
      ])
      .select()
      .single();

    if (userError) {
      return res.status(400).json({
        message: "Failed to register user",
        detail: userError.message,
      });
    }

    if (role === "rt_admin" && rt_id) {
      const { error: rtAdminError } = await supabase
        .from("users")
        .upsert([
          {
            id: userData.id,
            role: "rt_admin",
            rt_id: rt_id,
          },
        ])
        .single();

      if (rtAdminError) {
        return res.status(500).json({
          message: "Failed to assign RT Admin role",
          detail: rtAdminError.message,
        });
      }
    }

    if (role === "kelurahan_admin" && kelurahan_id) {
      const { error: kelurahanAdminError } = await supabase
        .from("users")
        .upsert([
          {
            id: userData.id,
            role: "kelurahan_admin",
            kelurahan_id: kelurahan_id,
          },
        ])
        .single();

      if (kelurahanAdminError) {
        return res.status(500).json({
          message: "Failed to assign Kelurahan Admin role",
          detail: kelurahanAdminError.message,
        });
      }
    }

    res
      .status(201)
      .json({ message: "User registered successfully", user: userData });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    const { data: user, error } = await supabase
      .from("users")
      .select("id, full_name, phone, role, password_hash, rt_id, kelurahan_id")
      .eq("phone", phone)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        rt_id: user.rt_id,
        kelurahan_id: user.kelurahan_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await saveRefreshToken(user.id, refreshToken);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.json({
      role: user.role,
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        rt_id: user.rt_id,
        kelurahan_id: user.kelurahan_id,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ message: "Refresh token required" });

    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token" });
    }

    const valid = await checkRefreshToken(payload.id, refreshToken);
    if (!valid)
      return res.status(403).json({ message: "Refresh token not recognized" });

    const { data: user, error } = await supabase
      .from("users")
      .select("id, full_name, phone, role, rt_id, kelurahan_id")
      .eq("id", payload.id)
      .single();

    if (error || !user)
      return res.status(404).json({ message: "User not found" });

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        rt_id: user.rt_id,
        kelurahan_id: user.kelurahan_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    let refreshToken = req.body.refreshToken || req.cookies.refreshToken;

    if (!refreshToken) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        return res.json({ message: "Logged out successfully" });
      }
    }

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    await deleteRefreshToken(refreshToken);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

export const getUserData = async (req, res, next) => {
  try {
    let token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
          return res
            .status(401)
            .json({ message: "Unauthorized. Please login again." });
        }
        let refreshPayload;
        try {
          refreshPayload = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
          );
        } catch (err2) {
          return res
            .status(403)
            .json({ message: "Invalid or expired refresh token" });
        }

        const { data: user, error } = await supabase
          .from("users")
          .select("id, full_name, phone, role, rt_id, kelurahan_id")
          .eq("id", refreshPayload.id)
          .single();
        if (error || !user) {
          return res.status(404).json({ message: "User not found" });
        }
        const newAccessToken = jwt.sign(
          {
            id: user.id,
            full_name: user.full_name,
            phone: user.phone,
            role: user.role,
            rt_id: user.rt_id,
            kelurahan_id: user.kelurahan_id,
          },
          process.env.JWT_SECRET,
          { expiresIn: "15m" }
        );
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          secure: process.env.NODE_ENV === "production",
        });
        payload = jwt.verify(newAccessToken, process.env.JWT_SECRET);
      } else {
        return next(err);
      }
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, full_name, phone, role, rt_id, kelurahan_id")
      .eq("id", payload.id)
      .single();
    if (error || !user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const verifyPassword = async (req, res, next) => {
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
    const { password } = req.body;
    if (!password)
      return res.status(400).json({ message: "Password required" });
    const { data: user, error } = await supabase
      .from("users")
      .select("id, password_hash")
      .eq("id", userId)
      .single();
    if (error || !user)
      return res.status(404).json({ message: "User not found" });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: "Incorrect password" });
    res.json({ message: "Password verified" });
  } catch (err) {
    next(err);
  }
};

export const getOptionalUserData = async (req, res, next) => {
  try {
    if (req.user) {
      const { data: user, error } = await supabase
        .from("users")
        .select("id, full_name, phone, role, rt_id, kelurahan_id")
        .eq("id", req.user.id)
        .single();

      if (error) {
        return res.status(500).json({ message: "Failed to fetch user data" });
      }

      return res.json({ user });
    }

    res.json({ user: null });
  } catch (err) {
    next(err);
  }
};
