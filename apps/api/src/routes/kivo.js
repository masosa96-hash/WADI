import express from "express";
const router = express.Router();

// GET /kivo (status)
router.get("/", (req, res) => {
  res.json({
    service: "kivo",
    status: "ready",
    message: "Kivo module is online",
  });
});

// POST /kivo/run
// POST /chat (Frontend endpoint)
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Placeholder response until OpenAI is connected here
    return res.json({
      reply: `[Kivo]: Recibido: "${message}"`,
    });
  } catch (err) {
    console.error("Kivo error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /run (Legacy/Internal)
router.post("/run", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    return res.json({
      reply: `You said: ${message}`,
    });
  } catch (err) {
    console.error("Kivo error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /kivo/session
router.post("/session", (req, res) => {
  res.json({
    session: true,
    timestamp: Date.now(),
  });
});

export default router;
