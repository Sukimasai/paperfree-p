import { Router } from "express";
import {
  searchLocations,
  getLocationNames,
} from "../controllers/locationController.js";

const router = Router();

router.get("/search", searchLocations);
router.get("/", getLocationNames);

export default router;
