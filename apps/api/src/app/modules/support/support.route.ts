import { Router } from "express";
import { protect } from "../../middlewares/auth";
import { submitSupportMessage } from "./support.controller";

const router = Router();

// Submit a support message
router.post("/", protect, submitSupportMessage);

export default router;
