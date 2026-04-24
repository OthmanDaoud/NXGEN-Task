import { Router } from "express";
import {
  createDeviceController,
  listDevicesController,
} from "../controller/device.controller.js";

const router = Router();

router.post("/devices", createDeviceController);
router.get("/devices", listDevicesController);

export const deviceRoutes = router;
