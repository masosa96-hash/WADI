import express from "express";
import whatsapp from "../connectors/whatsapp.js";
import telegram from "../connectors/telegram.js";

const router = express.Router();

// WhatsApp Routes
router.get("/whatsapp", whatsapp.verifyWebhook);
router.post("/whatsapp", whatsapp.handleIncomingMessage);

// Telegram Routes
router.post("/telegram", telegram.handleWebhook);

export default router;
