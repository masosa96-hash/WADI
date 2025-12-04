import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes.js";

dotenv.config({ path: "../../.env" });

const app = express();
app.use(cors());
app.use(express.json());

import kivoRoutes from "./routes/kivo.js";

app.use("/api", routes);
app.use("/kivo", kivoRoutes);

app.listen(3000, () => console.log("API running on 3000"));
