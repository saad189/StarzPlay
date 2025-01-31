import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
});

const logger = createLogger({
    level: process.env.LOG_LEVEL || "info", // info, debug, error, etc.
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        colorize(),
        logFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: "logs/app.log" })
    ],
});

export default logger;
