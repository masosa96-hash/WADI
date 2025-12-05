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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on ${PORT}`));
