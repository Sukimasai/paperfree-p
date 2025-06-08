import jwt from "jsonwebtoken";
import supabase from "../utils/supabaseClient.js";
import setAnonymousContext from "./setAnonymousContext.js";

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      await setAnonymousContext(req, res, next);
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      const result = await supabase.rpc("set_config", {
        setting_name: "app.user_id",
        new_value: decoded.id,
        is_local: true,
      });

      if (result.error) {
        await setAnonymousContext(req, res, next);
        return;
      }

      next();
    } catch (jwtError) {
      await setAnonymousContext(req, res, next);
    }
  } catch (error) {
    await setAnonymousContext(req, res, next);
  }
};

export default optionalAuth;
