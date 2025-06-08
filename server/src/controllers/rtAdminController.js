import supabase from "../utils/supabaseClient.js";

export const approveRequestRt = async (req, res, next) => {
  try {
    const { requestRtId } = req.params;
    const rtId = req.user.rt_id;

    const { data: existingRequest, error: fetchError } = await supabase
      .from("requests")
      .select("*")
      .eq("id", requestRtId)
      .eq("rt_id", rtId)
      .single();

    if (fetchError) {
      return res.status(500).json({
        message: "Failed to find the request",
        detail: fetchError.message,
      });
    }
    if (!existingRequest) {
      return res
        .status(404)
        .json({ message: "Request not found or does not belong to this RT" });
    }
    if (
      existingRequest.status === "approved" ||
      existingRequest.status === "rejected"
    ) {
      return res
        .status(400)
        .json({ message: "This request has already been processed" });
    }

    const { data: request, error } = await supabase
      .from("requests")
      .update({ status: "approved" })
      .eq("id", requestRtId)
      .eq("rt_id", rtId)
      .select()
      .single();

    if (error) {
      return res
        .status(500)
        .json({ message: "Failed to approve request", detail: error.message });
    }

    res.status(200).json({
      message: "Request approved successfully",
      request: { ...request, status: "approved" },
    });
  } catch (err) {
    next(err);
  }
};

export const rejectRequestRt = async (req, res, next) => {
  try {
    const { requestRtId } = req.params;
    const rtId = req.user.rt_id;

    const { data, error } = await supabase
      .from("requests")
      .update({ status: "rejected" })
      .eq("id", requestRtId)
      .eq("rt_id", rtId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        message: "Failed to reject Surat Pengantar",
        detail: error.message,
      });
    }

    res.status(200).json({ message: "Surat rejected", surat: data });
  } catch (err) {
    next(err);
  }
};

export const fetchRequests = async (req, res, next) => {
  try {
    const rtId = req.user.rt_id;

    if (!rtId) {
      return res
        .status(400)
        .json({ message: "RT ID is required to fetch requests for RT Admin." });
    }

    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .eq("status", "pending")
      .eq("rt_id", rtId);

    if (error) {
      return res
        .status(500)
        .json({ message: "Failed to fetch requests", detail: error.message });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const fetchRecentActivity = async (req, res, next) => {
  try {
    const rtId = req.user.rt_id;
    if (!rtId) {
      return res
        .status(400)
        .json({ message: "RT ID is required to fetch recent activity." });
    }
    const { data: reqs, error } = await supabase
      .from("requests")
      .select("request_type, status, updated_at")
      .eq("rt_id", rtId)
      .order("updated_at", { ascending: false })
      .limit(10);
    if (error) {
      return res.status(500).json({
        message: "Failed to fetch recent activity",
        detail: error.message,
      });
    }
    const activity = reqs
      .map((r) => {
        if (r.status === "approved")
          return `Approved request '${r.request_type}' at ${new Date(
            r.updated_at
          ).toLocaleString()}`;
        if (r.status === "rejected")
          return `Rejected request '${r.request_type}' at ${new Date(
            r.updated_at
          ).toLocaleString()}`;
        return null;
      })
      .filter(Boolean);
    res.json({ activity });
  } catch (err) {
    next(err);
  }
};
