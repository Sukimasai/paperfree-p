import { Router } from "express";
import auth from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";
import {
  verifyDocument,
  rejectDocument,
  getPendingDocuments,
  getAdminRecentActivity,
} from "../controllers/adminController.js";

const router = Router();

router.put("/verify/:documentId", auth, adminAuth, verifyDocument);
router.put("/reject/:documentId", auth, adminAuth, rejectDocument);
router.get("/pending-documents", auth, adminAuth, getPendingDocuments);
router.get("/recent-activity", auth, adminAuth, getAdminRecentActivity);

export default router;
