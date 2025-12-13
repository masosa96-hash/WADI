// WADI API – static + API routing OK for Render

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import routes from "./routes.js";
import kivoRoutes from "./routes/kivo.js";
import monitoringRoutes from "./routes/monitoring.js";

import { requestLogger } from "./middleware/requestLogger.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: "../../.env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import helmet from "helmet";

const app = express();
app.use(helmet());
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://wadi-wxg7.onrender.com",
  "https://ideal-essence-production.up.railway.app", // Kivo/WADI prod
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(requestLogger);
app.use("/api", rateLimiter); // Only rate limit API

// --------------------------------------------------
// REDIRECT LEGACY KIVO
// --------------------------------------------------
app.get(/^\/kivo(\/.*)?$/, (req, res) => res.redirect("/"));

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

// Error Handler
app.use(errorHandler);

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`WADI API running on port ${PORT}`);
});
