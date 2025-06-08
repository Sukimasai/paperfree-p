import jwt from "jsonwebtoken";
import supabase from "../utils/supabaseClient.js";

const setUserContext = async (user) => {
  try {
    await supabase.rpc("set_config", {
      setting_name: "app.user_id",
      new_value: user.id,
      is_local: true,
    });

    await supabase.rpc("set_config", {
      setting_name: "app.user_role",
      new_value: user.role,
      is_local: true,
    });

    if (user.rt_id) {
      await supabase.rpc("set_config", {
        setting_name: "app.user_rt_id",
        new_value: user.rt_id,
        is_local: true,
      });
    }

    if (user.kelurahan_id) {
      await supabase.rpc("set_config", {
        setting_name: "app.user_kelurahan_id",
        new_value: user.kelurahan_id,
        is_local: true,
      });
    }
  } catch (error) {
    throw error;
  }
};

export default async function auth(req, res, next) {
  try {
    let token = req.cookies.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        if (!req.cookies.accessToken) {
          return res
            .status(401)
            .json({ message: "Token expired. Please login again." });
        }

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
        return res.status(401).json({ message: "Unauthorized" });
      }
    }

    req.user = {
      id: payload.id,
      full_name: payload.full_name,
      role: payload.role,
      rt_id: payload.rt_id,
      kelurahan_id: payload.kelurahan_id,
    };

    await setUserContext(req.user);

    next();
  } catch (err) {
    next(err);
  }
}
