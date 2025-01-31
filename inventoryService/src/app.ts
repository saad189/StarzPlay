import express, { json } from "express";
import cors from "cors";
import { config } from "dotenv";

import routes from "./routes";

config();
const app = express();

app.use(express.json());
app.use(cors());
app.use("/api", routes);

export default app;
