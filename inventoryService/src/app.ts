import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import errorHandler from "./middleware/errorHandler.middleware";


dotenv.config();

const app = express();

// Basic Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

app.use(errorHandler);

export default app;
