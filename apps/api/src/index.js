// WADI API – static + API routing OK for Render (Deploy Trigger)

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
import fs from "fs";
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
// --------------------------------------------------
// 109: STATIC FRONTEND (WADI MAIN UI)
// --------------------------------------------------
const frontendPath = path.resolve(__dirname, "../../frontend/dist");
console.log("Frontend Path:", frontendPath);

// Debug: Log directory contents on startup to verify build on Render
try {
  if (fs.existsSync(frontendPath)) {
    console.log("Check dist:", fs.readdirSync(frontendPath));
    const assetsDebug = path.join(frontendPath, "assets");
    if (fs.existsSync(assetsDebug)) {
      console.log("Check assets:", fs.readdirSync(assetsDebug));
    } else {
      console.log("⚠️ Assets folder missing at:", assetsDebug);
    }
  } else {
    console.log("⚠️ Frontend dist missing at:", frontendPath);
  }
} catch (err) {
  console.error("Debug Log Error:", err);
}

// 1. Static Files (Assets + Root)
// Serve everything in 'dist' (includes index.html, assets/*, favicon.ico)
app.use(express.static(frontendPath));

// 2. Asset 404 Handling (Fixed for Express 5 regexp)
// Explicitly serve /assets from the dist/assets folder to avoid ambiguity
app.use(
  "/assets",
  express.static(path.join(__dirname, "../../frontend/dist/assets"))
);

// Fallback for missing assets (if not found in static above)
app.use("/assets", (req, res) => {
  res.status(404).send("Asset not found");
});

// 3. API
app.use("/api", routes);
app.use("/api/kivo", kivoRoutes);
app.use("/system", monitoringRoutes);

app.get("/system/debug-files", (req, res) => {
  try {
    const assetsPath = path.join(frontendPath, "assets");

    const rootContents = fs.existsSync(frontendPath)
      ? fs.readdirSync(frontendPath)
      : "FRONTEND_DIR_NOT_FOUND";

    const assetsContents = fs.existsSync(assetsPath)
      ? fs.readdirSync(assetsPath)
      : "ASSETS_DIR_NOT_FOUND";

    res.json({
      frontendPath,
      cwd: process.cwd(),
      rootContents,
      assetsContents,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      frontendPath,
    });
  }
});

// 4. SPA fallback (Catch-all)
// Any request not handled by previous routes (assets, api, system) serves index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Error Handler
app.use(errorHandler);

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`WADI API running on port ${PORT}`);
});
