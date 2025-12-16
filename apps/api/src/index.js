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

// --------------------------------------------------
// SECURITY: CSP (Content Security Policy)
// --------------------------------------------------
// --------------------------------------------------
// SECURITY: CSP (Content Security Policy)
// --------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://js.hcaptcha.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://hcaptcha.com"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://*.supabase.co",
          "https://*.supabase.in",
        ],
        fontSrc: ["'self'", "data:"],
        connectSrc: [
          "'self'",
          "https://smkbiguvgiscojwxgbae.supabase.co", // Explicit Supabase Project
          "https://*.supabase.co", // Wildcard fallback
          "https://*.supabase.in",
          "https://api.openai.com",
          "https://api.groq.com",
          "https://*.hcaptcha.com",
          "https://hcaptcha.com",
        ],
        frameSrc: [
          "'self'",
          "https://*.hcaptcha.com",
          "https://newassets.hcaptcha.com",
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);
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

// 1. Servir assets ANTES de cualquier catch-all
app.use(
  "/assets",
  express.static(path.join(frontendPath, "assets"), {
    setHeaders(res, filePath) {
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
      if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);

// 2. Servir archivos estáticos base
app.use(express.static(frontendPath));

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------
app.use("/api", routes);
app.use("/api/kivo", kivoRoutes);
app.use("/system", monitoringRoutes);

// 3. SPA fallback FINAL (solo después de assets)
app.get("*", (req, res) => {
  // If it's an API route or ASSET that wasn't caught (404), return JSON
  if (
    req.path.startsWith("/api") ||
    req.path.startsWith("/kivo") ||
    req.path.startsWith("/system") ||
    req.path.startsWith("/assets")
  ) {
    return res.status(404).json({ error: "Not found" });
  }

  // SPA Fallback
  res.sendFile(path.join(frontendPath, "index.html"), (err) => {
    if (err) {
      res.json({
        service: "wadi-api",
        status: "online",
        note: "Frontend build not found. Please run build script.",
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
