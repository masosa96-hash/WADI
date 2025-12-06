import express from "express";
const router = express.Router();

// MUST HAVE for Render Healthcheck
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Optional: readiness
router.get("/ready", (req, res) => {
  res.status(200).json({ ready: true });
});

export default router;
