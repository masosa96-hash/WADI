import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config(); // Render ya expone envs, no uses rutas relativas

// Importar rutas
import routes from "./routes.js";
import kivoRoutes from "./routes/kivo.js";
import monitoringRoutes from "./routes/monitoring.js";
import webhookRoutes from "./routes/webhooks.js";

const app = express();
app.use(cors());
app.use(express.json());

// Registrar rutas
app.use("/api", routes);
app.use("/kivo", kivoRoutes);
app.use("/system", monitoringRoutes);
app.use("/webhooks", webhookRoutes);

// Ruta raíz de debug
app.get("/", (req, res) => {
  res.json({
    service: "wadi-api",
    status: "online",
    endpoints: [
      "/api",
      "/kivo",
      "/system/health",
      "/system/ready",
      "/webhooks/whatsapp"
    ]
  });
});

// Lanzar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    JSON.stringify({
      message: "WADI API running",
      port: PORT,
      envLoaded: true,
      timestamp: new Date().toISOString()
    })
  );
});
