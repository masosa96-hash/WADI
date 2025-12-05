import express from "express";
const router = express.Router();

// Liveness Probe
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Readiness Probe
router.get("/ready", async (req, res) => {
  // TODO: Add actual DB/Redis check here
  const dbStatus = "ok"; // Simulate DB connection

  if (dbStatus === "ok") {
    res.json({
      status: "ready",
      integrations: { database: "connected", openai: "connected" },
    });
  } else {
    res.status(503).json({ status: "not_ready" });
  }
});

// Basic Admin Metrics (Protected)
router.get("/admin/metrics", (req, res) => {
  const authHeader = req.headers["x-admin-key"];
  if (authHeader !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const memory = process.memoryUsage();
  res.json({
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memory.rss / 1024 / 1024) + "MB",
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + "MB",
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + "MB",
    },
    load: process.cpuUsage(),
  });
});

export default router;
