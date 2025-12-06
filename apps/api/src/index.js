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

const app = express();
app.use(cors());
app.use(express.json());

// Necesario para obtener rutas absolutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta a los archivos del frontend Kivo
const kivoPath = path.resolve(__dirname, "../../kivo/www");

// Servir frontend
app.use("/kivo", express.static(kivoPath));

// Endpoints backend
app.use("/api", routes);
app.use("/kivo-api", kivoRoutes);
app.use("/system", monitoringRoutes);
app.use("/webhooks", webhookRoutes);

// Root debug
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
  console.log(`WADI API running on port ${PORT}`);
});
