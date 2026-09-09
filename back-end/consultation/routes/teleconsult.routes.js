import express from "express";
import { getToken, endConsultation } from "../controllers/teleconsult.controller.js";

const router = express.Router();

// POST /api/v1/consultation/token — generate a LiveKit room token
router.post("/token", getToken);

// POST /api/v1/consultation/end — acknowledge consultation end
router.post("/end", endConsultation);

export default router;
