import supabase from "../utils/supabaseClient.js";

const generateFileName = (fileType, userId, originalName) => {
  const timestamp = Date.now();
  const fileExtension = originalName.split(".").pop();
  return `${userId}/${fileType}_${userId}_${timestamp}.${fileExtension}`;
};

const allowedTypes = {
  KK: ["image/jpeg", "image/png", "application/pdf"],
  KTP: ["image/jpeg", "image/png", "application/pdf"],
  SIMA: ["image/jpeg", "image/png", "application/pdf"],
  SIMB: ["image/jpeg", "image/png", "application/pdf"],
  SIMB1: ["image/jpeg", "image/png", "application/pdf"],
  SIMB2: ["image/jpeg", "image/png", "application/pdf"],
  SIMC: ["image/jpeg", "image/png", "application/pdf"],
  SIMC1: ["image/jpeg", "image/png", "application/pdf"],
  SIMC2: ["image/jpeg", "image/png", "application/pdf"],
  SIMC3: ["image/jpeg", "image/png", "application/pdf"],
  SIMD: ["image/jpeg", "image/png", "application/pdf"],
  SKCK: ["image/jpeg", "image/png", "application/pdf"],
  Ijazah: ["image/jpeg", "image/png", "application/pdf"],
  AktaKelahiran: ["image/jpeg", "image/png", "application/pdf"],
  Paspor: ["image/jpeg", "image/png", "application/pdf"],
  SuratNikah: ["image/jpeg", "image/png", "application/pdf"],
  SuratCerai: ["image/jpeg", "image/png", "application/pdf"],
  PasFoto: ["image/jpeg", "image/png"],
  CV: ["image/jpeg", "image/png", "application/pdf"],
  NPWP: ["image/jpeg", "image/png", "application/pdf"],
  SuratKematian: ["image/jpeg", "image/png", "application/pdf"],
  SuratPindah: ["image/jpeg", "image/png", "application/pdf"],
};

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const userId = req.user.id;
    const {
      file: { buffer: fileBuffer, originalname, mimetype },
    } = req;
    if (!fileBuffer)
      return res.status(400).json({ message: "No file uploaded" });
    const fileType = req.body.file_type || "unknown";

    const allowedFileTypes = allowedTypes[fileType];
    if (!allowedFileTypes) {
      return res.status(400).json({
        message: `Invalid file type category. Please provide a valid file type.`,
      });
    }
    if (!allowedFileTypes.includes(mimetype)) {
      return res.status(400).json({
        message: `Invalid file type. Allowed types for ${fileType}: ${allowedFileTypes.join(
          ", "
        )}`,
      });
    }

    const { data: existingDocs, error: checkError } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .eq("file_type", fileType);

    if (checkError) {
      return res.status(500).json({
        message: "Error checking existing documents",
        detail: checkError.message,
      });
    }

    if (existingDocs && existingDocs.length > 0) {
      return res.status(400).json({
        message: `You have already uploaded a document of type ${fileType}`,
      });
    }

    const uniqueFileName = generateFileName(fileType, userId, originalname);

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(uniqueFileName, fileBuffer, { contentType: mimetype });

    if (uploadError) {
      return res.status(500).json({
        message: "Failed to upload to storage",
        detail: uploadError.message,
      });
    }

    const newName = fileType + " " + req.user.full_name.replace(/\s+/g, "_");

    const { data, error: dbError } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        filename: newName,
        storage_path: uniqueFileName,
        mime_type: mimetype,
        file_type: fileType,
        verification_status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      return res.status(500).json({
        message: "Failed to save document metadata",
        detail: dbError.message,
      });
    }

    res.status(201).json({
      document: data,
      message: "Document uploaded and pending verification.",
    });
  } catch (err) {
    next(err);
  }
};

export const listDocuments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = supabase
      .from("documents")
      .select(
        "id, filename, mime_type, file_type, created_at, storage_path, verification_status"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("verification_status", status);
    }

    const { data, error } = await query;

    if (error) {
      return res
        .status(500)
        .json({ message: "Failed to fetch documents", detail: error.message });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const updateDocument = async (req, res, next) => {
  try {
    const { documentId, file_type } = req.body;
    if (!documentId)
      return res
        .status(400)
        .json({ message: "Document ID is required for updating." });
    const {
      file: {
        buffer: fileBuffer,
        originalname: originalName,
        mimetype: mimeType,
      },
    } = req;
    if (!fileBuffer)
      return res.status(400).json({ message: "No file uploaded" });
    const userId = req.user.id;
    const typeToCheck = file_type || "unknown";
    const allowedFileTypes = allowedTypes[typeToCheck];
    if (!allowedFileTypes) {
      return res.status(400).json({
        message: `Invalid file type category. Please provide a valid file type.`,
      });
    }
    if (!allowedFileTypes.includes(mimeType)) {
      return res.status(400).json({
        message: `Invalid file type. Allowed types for ${typeToCheck}: ${allowedFileTypes.join(
          ", "
        )}`,
      });
    }

    const { data: existingDoc, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !existingDoc) {
      return res
        .status(404)
        .json({ message: "Document not found or unauthorized access." });
    }

    const uniqueFileName = generateFileName(
      file_type || existingDoc.file_type,
      userId,
      originalName
    );

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(uniqueFileName, fileBuffer, { contentType: mimeType });

    if (uploadError) {
      return res.status(500).json({
        message: "Failed to upload the new file to storage",
        detail: uploadError.message,
      });
    }

    const { error: deleteError } = await supabase.storage
      .from("documents")
      .remove([existingDoc.storage_path]);

    if (deleteError) {
      return res.status(500).json({
        message: "Failed to delete the old file from storage",
        detail: deleteError.message,
      });
    }

    const { data, error: dbError } = await supabase
      .from("documents")
      .update({
        storage_path: uniqueFileName,
        mime_type: mimeType,
        file_type: file_type || existingDoc.file_type,
        updated_at: new Date().toISOString(),
        verification_status: "pending",
      })
      .eq("id", documentId)
      .eq("user_id", userId)
      .select()
      .single();

    if (dbError) {
      return res.status(500).json({
        message: "Failed to update document metadata",
        detail: dbError.message,
      });
    }

    res.status(200).json({ document: data });
  } catch (err) {
    next(err);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const { data: existingDoc, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !existingDoc) {
      return res
        .status(404)
        .json({ message: "Document not found or unauthorized access." });
    }

    const { error: deleteError } = await supabase.storage
      .from("documents")
      .remove([existingDoc.storage_path]);

    if (deleteError) {
      return res.status(500).json({
        message: "Failed to delete file from storage",
        detail: deleteError.message,
      });
    }

    const { error: dbError } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId)
      .eq("user_id", userId);

    if (dbError) {
      return res.status(500).json({
        message: "Failed to delete document metadata",
        detail: dbError.message,
      });
    }

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const listPendingDocuments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userError || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can view pending documents" });
    }

    const { data: pendingDocuments, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("verification_status", "pending")
      .order("created_at", { ascending: false });
    if (fetchError) {
      return res.status(500).json({
        message: "Failed to fetch documents",
        detail: fetchError.message,
      });
    }

    res.json(pendingDocuments);
  } catch (err) {
    next(err);
  }
};
