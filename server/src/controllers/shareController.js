import bcrypt from "bcrypt";
import crypto from "crypto";
import supabase from "../utils/supabaseClient.js";
import mime from "mime-types";

export const createShare = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { documentIds, password } = req.body;

    if (
      !documentIds ||
      !Array.isArray(documentIds) ||
      documentIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "No documents selected for sharing." });
    }
    if (!password) {
      return res
        .status(400)
        .json({ message: "Password confirmation required." });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("password_hash")
      .eq("id", ownerId)
      .single();

    if (userError || !user) {
      return res.status(401).json({ message: "User not found." });
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res
        .status(401)
        .json({ message: "Invalid password confirmation." });
    }

    const { data: docs, error: docsError } = await supabase
      .from("documents")
      .select("id")
      .in("id", documentIds)
      .eq("user_id", ownerId);

    if (docsError) {
      return res.status(500).json({
        message: "Error verifying documents.",
        detail: docsError.message,
      });
    }
    if (docs.length !== documentIds.length) {
      return res
        .status(404)
        .json({ message: "One or more documents not found or unauthorized." });
    }

    const { data: dbNowResult, error: dbNowError } = await supabase.rpc(
      "get_utc_now"
    );
    if (dbNowError) {
      return res.status(500).json({
        message: "Failed to get DB time.",
        detail: dbNowError.message,
      });
    }
    const dbNow = new Date(dbNowResult);
    const token = crypto.randomBytes(16).toString("base64url");
    const qrExpiresAt = new Date(dbNow.getTime() + 1 * 60 * 1000);
    const downloadExpiresAt = new Date(
      dbNow.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    const { data: share, error: shareError } = await supabase
      .from("shares")
      .insert({
        user_id: ownerId,
        token,
        qr_expires_at: qrExpiresAt.toISOString(),
        download_expires_at: downloadExpiresAt.toISOString(),
      })
      .select()
      .single();

    if (shareError) {
      return res.status(500).json({
        message: "Failed to create share.",
        detail: shareError.message,
      });
    }

    const shareDocs = documentIds.map((docId) => ({
      share_id: share.id,
      document_id: docId,
    }));

    const { error: shareDocsError } = await supabase
      .from("share_docs")
      .insert(shareDocs);
    if (shareDocsError) {
      return res.status(500).json({
        message: "Failed to link documents to share.",
        detail: shareDocsError.message,
      });
    }

    res.status(201).json({
      token,
      qrExpiresAt: qrExpiresAt.toISOString(),
      downloadExpiresAt: downloadExpiresAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

export const getShareDetails = async (req, res, next) => {
  try {
    const { token } = req.params;

    const { data: share, error: shareError } = await supabase
      .from("shares")
      .select("*")
      .eq("token", token)
      .single();

    if (shareError || !share) {
      return res.status(404).json({ message: "Share token not found." });
    }

    const { data: dbNowResult, error: dbNowError } = await supabase.rpc(
      "get_utc_now"
    );
    if (dbNowError) {
      return res.status(500).json({
        message: "Failed to get DB time.",
        detail: dbNowError.message,
      });
    }
    const dbNow = new Date(dbNowResult);

    if (!share.qr_activated_at) {
      if (dbNow > new Date(share.qr_expires_at)) {
        return res.status(410).json({ message: "QR code expired." });
      }
    } else {
      if (dbNow > new Date(share.download_expires_at)) {
        return res.status(410).json({ message: "Download period expired." });
      }
    }

    const { data: shareDocs, error: shareDocsError } = await supabase
      .from("share_docs")
      .select("document_id")
      .eq("share_id", share.id);

    if (shareDocsError || !shareDocs || shareDocs.length === 0) {
      return res
        .status(404)
        .json({ message: "No documents found for this share." });
    }

    const documentIds = shareDocs.map((sd) => sd.document_id);

    const { data: documents, error: docsError } = await supabase
      .from("documents")
      .select("id, filename, file_type, storage_path")
      .in("id", documentIds);

    if (docsError) {
      return res.status(500).json({
        message: "Failed to fetch documents.",
        detail: docsError.message,
      });
    }

    const secondsUntilExpiry = Math.floor(
      (new Date(share.download_expires_at) - dbNow) / 1000
    );

    const filesWithUrls = await Promise.all(
      documents.map(async (doc) => {
        if (!doc || !doc.storage_path) {
          return {
            error: `Missing storage path for document: ${
              doc ? doc.filename : "unknown"
            }`,
          };
        }

        const { data: urlData, error: urlError } = await supabase.storage
          .from("documents")
          .createSignedUrl(doc.storage_path, secondsUntilExpiry);

        if (urlError) {
          return {
            error: `Failed to generate signed URL for file: ${doc.filename}`,
          };
        }

        return {
          id: doc.id,
          filename: doc.filename,
          file_type: doc.file_type,
          downloadUrl: urlData.signedUrl,
          storage_path: doc.storage_path,
          MIMEType: mime.lookup(doc.storage_path) || "application/octet-stream",
        };
      })
    );

    const files = filesWithUrls.filter((f) => !f.error);

    if (files.length === 0) {
      return res
        .status(404)
        .json({ message: "No accessible documents found." });
    }

    res.json({
      token,
      files,
      downloadExpiresAt: share.download_expires_at,
    });
  } catch (err) {
    next(err);
  }
};

export const createRequestShare = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { requestId, password } = req.body;
    if (!requestId) {
      return res.status(400).json({ message: "requestId is required" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ message: "Password confirmation required." });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("password_hash")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return res.status(401).json({ message: "User not found." });
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res
        .status(401)
        .json({ message: "Invalid password confirmation." });
    }

    const { data: request, error: reqError } = await supabase
      .from("requests")
      .select("*")
      .eq("id", requestId)
      .single();
    if (reqError || !request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (request.user_id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (request.status !== "approved") {
      return res
        .status(400)
        .json({ message: "Request must be approved to be shared" });
    }
    const { data: dbNowResult, error: dbNowError } = await supabase.rpc(
      "get_utc_now"
    );
    if (dbNowError) {
      return res.status(500).json({
        message: "Failed to get DB time",
        detail: dbNowError.message,
      });
    }
    const dbNow = new Date(dbNowResult);
    const token = crypto.randomBytes(16).toString("base64url");
    const qrExpiresAt = new Date(dbNow.getTime() + 1 * 60 * 1000);
    const downloadExpiresAt = new Date(
      dbNow.getTime() + 7 * 24 * 60 * 60 * 1000
    );
    const { data: share, error: shareError } = await supabase
      .from("request_shares")
      .insert({
        user_id: userId,
        request_id: requestId,
        token,
        qr_expires_at: qrExpiresAt.toISOString(),
        download_expires_at: downloadExpiresAt.toISOString(),
      })
      .select()
      .single();
    if (shareError) {
      return res.status(500).json({
        message: "Failed to create request share",
        detail: shareError.message,
      });
    }
    res.status(201).json({
      token,
      qrExpiresAt: qrExpiresAt.toISOString(),
      downloadExpiresAt: downloadExpiresAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

export const getRequestShare = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { data: share, error: shareError } = await supabase
      .from("request_shares")
      .select("*")
      .eq("token", token)
      .single();
    if (shareError || !share) {
      return res.status(404).json({ message: "Share token not found." });
    }
    const { data: dbNowResult, error: dbNowError } = await supabase.rpc(
      "get_utc_now"
    );
    if (dbNowError) {
      return res.status(500).json({
        message: "Failed to get DB time.",
        detail: dbNowError.message,
      });
    }
    const dbNow = new Date(dbNowResult);
    if (!share.qr_activated_at) {
      if (dbNow > new Date(share.qr_expires_at)) {
        return res.status(410).json({ message: "QR code expired." });
      }
    } else {
      if (dbNow > new Date(share.download_expires_at)) {
        return res.status(410).json({ message: "Share link expired." });
      }
    }
    const { data: request, error: reqError } = await supabase
      .from("requests")
      .select("*")
      .eq("id", share.request_id)
      .single();
    if (reqError || !request) {
      return res.status(404).json({ message: "Request not found." });
    }
    res.json({
      token,
      request,
      downloadExpiresAt: share.download_expires_at,
    });
  } catch (err) {
    next(err);
  }
};

export const activateShareQR = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { data: dbNowResult, error: dbNowError } = await supabase.rpc(
      "get_utc_now"
    );
    if (dbNowError) {
      return res.status(500).json({
        message: "Failed to get DB time.",
        detail: dbNowError.message,
      });
    }
    const dbNow = new Date(dbNowResult);
    const { data: share, error: shareError } = await supabase
      .from("shares")
      .select("*")
      .eq("token", token)
      .single();
    if (shareError || !share) {
      return res.status(404).json({ message: "Share token not found." });
    }

    if (!share.qr_activated_at && dbNow <= new Date(share.qr_expires_at)) {
      await supabase
        .from("shares")
        .update({ qr_activated_at: dbNow.toISOString() })
        .eq("id", share.id);
      return res.json({ message: "QR activated." });
    } else if (!share.qr_activated_at) {
      return res.status(410).json({ message: "QR code expired." });
    } else if (
      share.qr_activated_at &&
      dbNow <= new Date(share.download_expires_at)
    ) {
      return res.json({ message: "QR already activated." });
    } else {
      return res.status(410).json({ message: "Download period expired." });
    }
  } catch (err) {
    next(err);
  }
};

export const activateRequestShareQR = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { data: dbNowResult, error: dbNowError } = await supabase.rpc(
      "get_utc_now"
    );
    if (dbNowError) {
      return res.status(500).json({
        message: "Failed to get DB time.",
        detail: dbNowError.message,
      });
    }
    const dbNow = new Date(dbNowResult);
    const { data: share, error: shareError } = await supabase
      .from("request_shares")
      .select("*")
      .eq("token", token)
      .single();
    if (shareError || !share) {
      return res.status(404).json({ message: "Share token not found." });
    }

    if (!share.qr_activated_at && dbNow <= new Date(share.qr_expires_at)) {
      await supabase
        .from("request_shares")
        .update({ qr_activated_at: dbNow.toISOString() })
        .eq("id", share.id);
      return res.json({ message: "QR activated." });
    } else if (
      share.qr_activated_at &&
      dbNow <= new Date(share.download_expires_at)
    ) {
      return res.json({ message: "QR already activated." });
    } else if (!share.qr_activated_at) {
      return res.status(410).json({ message: "QR code expired." });
    } else {
      return res.status(410).json({ message: "Download period expired." });
    }
  } catch (err) {
    next(err);
  }
};
