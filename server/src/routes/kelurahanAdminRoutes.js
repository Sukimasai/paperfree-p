import { Router } from "express";
import auth from "../middleware/auth.js";
import { kelurahanAdminAuth } from "../middleware/kelurahanAdminAuth.js";
import {
  approveRequestKelurahan,
  rejectRequestKelurahan,
  fetchRequests,
  fetchRecentActivity,
} from "../controllers/kelurahanAdminController.js";

const router = Router();

router.put(
  "/requests/approve/:requestKelurahanId",
  auth,
  kelurahanAdminAuth,
  approveRequestKelurahan
);

router.put(
  "/requests/reject/:requestKelurahanId",
  auth,
  kelurahanAdminAuth,
  rejectRequestKelurahan
);

router.get("/requests", auth, kelurahanAdminAuth, fetchRequests);

router.get("/recent-activity", auth, kelurahanAdminAuth, fetchRecentActivity);

export default router;
