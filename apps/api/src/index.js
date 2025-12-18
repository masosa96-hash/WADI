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
  console.log("----- DEBUG FILES START -----");
  if (fs.existsSync(frontendPath)) {
    console.log("Detected frontendPath:", frontendPath);
    // Use recursive ls to see everything
    const { execSync } = await import("child_process");
    try {
      const output = execSync(`ls -R ${frontendPath}`, { encoding: "utf-8" });
      console.log("ls -R output:\n", output);
    } catch (e) {
      console.log("ls -R failed:", e.message);
      // Fallback
      console.log("Root contents:", fs.readdirSync(frontendPath));
    }
  } else {
    console.log("⚠️ Frontend dist missing at:", frontendPath);
  }
  console.log("----- DEBUG FILES END -----");
} catch (err) {
  console.error("Debug Log Error:", err);
}

// 1. Static Files & Assets
// Serve everything in 'dist' with specific headers
app.use(
  express.static(frontendPath, {
    setHeaders: (res, filePath) => {
      // Disable caching for index.html to ensure clients get the latest build hash
      if (filePath.endsWith("index.html")) {
        res.setHeader(
          "Cache-Control",
          "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      } else if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
        // Cache assets aggressively since they have hashes
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  })
);

// Debug: Log missing assets
app.use("/assets", (req, res, next) => {
  console.log(`❌ Missing Asset Requested: ${req.url}`);
  console.log(`   - Looked in: ${path.join(frontendPath, "assets", req.url)}`);
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
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Error Handler
app.use(errorHandler);

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`WADI API running on port ${PORT}`);
});
