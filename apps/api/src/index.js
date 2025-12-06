// force deploy 4
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes.js";

dotenv.config({ path: "../../.env" });

const app = express();
app.use(cors());
app.use(express.json());

import kivoRoutes from "./routes/kivo.js";
import monitoringRoutes from "./routes/monitoring.js";
import webhookRoutes from "./routes/webhooks.js";

app.use("/api", routes);
app.use("/kivo", kivoRoutes);
app.use("/system", monitoringRoutes);
app.use("/webhooks", webhookRoutes);

// Root Debug Route
app.get("/", (req, res) => {
  res.json({
    service: "wadi-api",
    status: "online",
    endpoints: [
      "/api",
      "/kivo",
      "/system/health",
      "/system/ready",
      "/webhooks/whatsapp",
    ],
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API v1.0.1 running on port ${PORT}`);
  console.log(
    `Health check available at: http://0.0.0.0:${PORT}/system/health`
  );
});
