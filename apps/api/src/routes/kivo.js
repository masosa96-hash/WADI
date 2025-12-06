import express from "express";
const router = express.Router();

// GET /kivo
router.get("/", (req, res) => {
  res.json({
    service: "kivo",
    status: "ready",
    message: "Kivo module online"
  });
});

// POST /kivo/run  (endpoint real usado por el frontend)
router.post("/run", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    return res.json({
      reply: `Kivo recibió: ${message}`
    });

  } catch (err) {
    return res.status(500).json({ error: "Internal error" });
  }
});

// REQUIRED: default export
export default router;
