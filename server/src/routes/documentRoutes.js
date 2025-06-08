import { Router } from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  uploadDocument,
  listDocuments,
  updateDocument,
  deleteDocument,
} from "../controllers/documentController.js";

const router = Router();

router.use(auth);

router.post("/", upload.single("file"), uploadDocument);
router.get("/", listDocuments);
router.post("/update", upload.single("file"), updateDocument);
router.delete("/delete/:documentId", deleteDocument);

export default router;
