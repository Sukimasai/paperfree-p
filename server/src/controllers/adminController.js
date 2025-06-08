import supabase from "../utils/supabaseClient.js";

export const verifyDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const adminId = req.user.id;

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", adminId)
      .single();

    if (userError || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can verify documents." });
    }

    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("verification_status", "pending")
      .single();

    if (fetchError || !document) {
      return res
        .status(404)
        .json({ message: "Document not found or already verified/rejected." });
    }

    const { data, error: updateError } = await supabase
      .from("documents")
      .update({
        verification_status: "verified",
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId)
      .select()
      .single();

    if (updateError) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to verify document",
          detail: updateError.message,
        });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Document verified successfully",
        document: data,
      });
  } catch (err) {
    next(err);
  }
};

export const rejectDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const adminId = req.user.id;

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", adminId)
      .single();

    if (userError || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can reject documents." });
    }

    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("verification_status", "pending")
      .single();

    if (fetchError || !document) {
      return res
        .status(404)
        .json({ message: "Document not found or already verified/rejected." });
    }

    const { data, error: updateError } = await supabase
      .from("documents")
      .update({
        verification_status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId)
      .select()
      .single();

    if (updateError) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to reject document",
          detail: updateError.message,
        });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Document rejected successfully",
        document: data,
      });
  } catch (err) {
    next(err);
  }
};

export const getPendingDocuments = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("verification_status", "pending");

    if (error) {
      return res.status(500).json({
        message: "Failed to fetch pending documents",
        detail: error.message,
      });
    }

    res.status(200).json({ documents: data });
  } catch (err) {
    next(err);
  }
};

export const getAdminRecentActivity = async (req, res, next) => {
  try {
    const { data: docs, error: docsError } = await supabase
      .from("documents")
      .select("filename, verification_status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(10);
    if (docsError) throw docsError;
    const activity = docs
      .map((doc) => {
        if (doc.verification_status === "verified")
          return `Verified document '${doc.filename}' at ${new Date(
            doc.updated_at
          ).toLocaleString()}`;
        if (doc.verification_status === "rejected")
          return `Rejected document '${doc.filename}' at ${new Date(
            doc.updated_at
          ).toLocaleString()}`;
        return null;
      })
      .filter(Boolean);
    res.json({ activity });
  } catch (err) {
    next(err);
  }
};

export const getRTAdminRecentActivity = async (req, res, next) => {
  try {
    const { data: reqs, error: reqsError } = await supabase
      .from("requests")
      .select("request_type, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(10);
    if (reqsError) throw reqsError;
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

export const getKelurahanAdminRecentActivity = async (req, res, next) => {
  try {
    const { data: reqs, error: reqsError } = await supabase
      .from("requests")
      .select("request_type, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(10);
    if (reqsError) throw reqsError;
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
