import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  createShare,
  getShareDetails,
  createRequestShare,
  getRequestShare,
  activateShareQR,
  activateRequestShareQR,
} from "../controllers/shareController.js";

const router = Router();

router.post("/", auth, createShare);
router.get("/:token", getShareDetails);
router.post("/request", auth, createRequestShare);
router.get("/request/:token", getRequestShare);
router.post("/:token/activate", activateShareQR);
router.post("/request/:token/activate", activateRequestShareQR);

export default router;
