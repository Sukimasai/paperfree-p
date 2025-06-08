import { Router } from "express";
import auth from "../middleware/auth.js";
import { rtAdminAuth } from "../middleware/rtAdminAuth.js";
import {
  approveRequestRt,
  rejectRequestRt,
  fetchRequests,
  fetchRecentActivity,
} from "../controllers/rtAdminController.js";

const router = Router();

router.put(
  "/requests/approve/:requestRtId",
  auth,
  rtAdminAuth,
  approveRequestRt
);

router.put("/requests/reject/:requestRtId", auth, rtAdminAuth, rejectRequestRt);

router.get("/requests", auth, rtAdminAuth, fetchRequests);

router.get("/recent-activity", auth, rtAdminAuth, fetchRecentActivity);

export default router;
