import { Router } from "express";
import {
  createDataController,
  listDataController,
} from "../controller/data.controller.js";

const router = Router();

router.post("/devices/:id/data", createDataController);
router.get("/devices/:id/data", listDataController);

export const dataRoutes = router;
