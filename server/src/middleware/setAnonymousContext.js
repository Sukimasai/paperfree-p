import supabase from "../utils/supabaseClient.js";

export default async function setAnonymousContext(req, res, next) {
  try {
    const result = await supabase.rpc("set_config", {
      setting_name: "app.user_role",
      new_value: "anonymous",
      is_local: true,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    next();
  } catch (err) {
    next(err);
  }
}
