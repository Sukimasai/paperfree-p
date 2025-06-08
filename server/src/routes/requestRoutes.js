import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  requestSurat,
  getUserRequests,
  deleteRequest,
} from "../controllers/requestController.js";

const router = Router();

router.post("/", auth, requestSurat);
router.get("/", auth, getUserRequests);
router.delete("/:id", auth, deleteRequest);

export default router;
