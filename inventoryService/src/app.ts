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

app.get("/", (req, res) => {
    res.send("Inventory Management Microservice!");
});

// Catch-all 404 Route (for undefined endpoints)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Global Error Handling Middleware
app.use(errorHandler);

export default app;
