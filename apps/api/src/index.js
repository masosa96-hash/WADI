// WADI API – static + API routing OK for Render

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import routes from "./routes.js";
import kivoRoutes from "./routes/kivo.js";
import monitoringRoutes from "./routes/monitoring.js";
import webhookRoutes from "./routes/webhooks.js";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: "../../.env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// --------------------------------------------------
// STATIC FRONTEND KIVO
// --------------------------------------------------
const kivoPath = path.join(__dirname, "../../kivo/www");
app.use("/kivo", express.static(kivoPath)); // sirve index.html + css + js

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------
app.use("/api", routes);
app.use("/kivo", kivoRoutes);
app.use("/system", monitoringRoutes);
app.use("/webhooks", webhookRoutes);

// ROOT DEBUG
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

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`WADI API running on port ${PORT}`);
});
