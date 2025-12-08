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
// REDIRECT LEGACY KIVO
// --------------------------------------------------
app.get("/kivo", (req, res) => res.redirect("/"));
app.get("/kivo/*", (req, res) => res.redirect("/"));

// --------------------------------------------------
// STATIC FRONTEND (WADI MAIN UI)
// --------------------------------------------------
const frontendPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendPath));

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------
app.use("/api", routes);
app.use("/api/kivo", kivoRoutes);
app.use("/system", monitoringRoutes);
app.use("/webhooks", webhookRoutes);

// --------------------------------------------------
// SPA CATCH-ALL (Frontend Routing)
// --------------------------------------------------
// Cualquier ruta no atrapada por API o estáticos -> index.html
app.get(/.*/, (req, res) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/kivo")) {
    return res.status(404).json({ error: "Not found" });
  }
  // Si existe el index.html lo enviamos, sino retornamos json básico info
  // (útil si no se ha hecho build)
  res.sendFile(path.join(frontendPath, "index.html"), (err) => {
    if (err) {
      res.json({
        service: "wadi-api",
        status: "online",
        note: "Frontend build not found. Please run build script.",
        endpoints: ["/api", "/kivo", "/system/health"],
      });
    }
  });
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`WADI API running on port ${PORT}`);
});
