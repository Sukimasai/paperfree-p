import supabase from "../utils/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

export const requestSurat = async (req, res, next) => {
  try {
    const { tujuan_surat, request_type, rt_id, kelurahan_id } = req.body;
    const userId = req.user.id;

    if (!["RT", "Kelurahan"].includes(request_type)) {
      return res
        .status(400)
        .json({ message: "Invalid request type. Choose RT or Kelurahan" });
    }
    if (request_type === "RT") {
      if (!rt_id) {
        return res
          .status(400)
          .json({ message: "rt_id is required for RT requests" });
      }
      const { data: rtData, error: rtError } = await supabase
        .from("rt")
        .select("*")
        .eq("rt_id", rt_id)
        .single();
      if (rtError || !rtData) {
        return res.status(400).json({ message: "Invalid rt_id provided" });
      }
    }

    if (request_type === "Kelurahan") {
      if (!kelurahan_id) {
        return res
          .status(400)
          .json({ message: "kelurahan_id is required for Kelurahan requests" });
      }
      const { data: kelData, error: kelError } = await supabase
        .from("kelurahan_desa")
        .select("*")
        .eq("kelurahan_desa_id", kelurahan_id)
        .single();
      if (kelError || !kelData) {
        return res
          .status(400)
          .json({ message: "Invalid kelurahan_id provided" });
      }
    }

    const nomorSurat = `SURAT-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${uuidv4().slice(0, 6)}`;

    const { data, error } = await supabase
      .from("requests")
      .insert([
        {
          user_id: userId,
          tujuan_surat,
          nomor_surat: nomorSurat,
          request_type,
          status: "pending",
          rt_id,
          kelurahan_id,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        message: "Failed to raise Surat Pengantar request",
        detail: error.message,
      });
    }

    res.status(201).json({
      message: "Surat Pengantar request raised successfully",
      surat: data,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = supabase.from("requests").select("*").eq("user_id", userId);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        message: "Failed to retrieve requests",
        detail: error.message,
      });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const deleteRequest = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;

    const { data: existingRequest, error: fetchError } = await supabase
      .from("requests")
      .select("*")
      .eq("id", requestId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !existingRequest) {
      return res
        .status(404)
        .json({ message: "Request not found or unauthorized access." });
    }

    const { error: deleteError } = await supabase
      .from("requests")
      .delete()
      .eq("id", requestId)
      .eq("user_id", userId);

    if (deleteError) {
      return res.status(500).json({
        message: "Failed to delete request",
        detail: deleteError.message,
      });
    }

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (err) {
    next(err);
  }
};
