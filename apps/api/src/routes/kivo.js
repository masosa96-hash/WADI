import express from "express";
const router = express.Router();

// GET /kivo  (status endpoint)
router.get("/", (req, res) => {
  res.json({
    service: "kivo",
    status: "ready",
    message: "Kivo module is online"
  });
});

// POST /kivo/chat
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Placeholder response
    return res.json({
      reply: `You said: ${message}`
    });

  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /kivo/session
router.post("/session", (req, res) => {
  res.json({
    session: true,
    timestamp: Date.now()
  });
});

export default router;
