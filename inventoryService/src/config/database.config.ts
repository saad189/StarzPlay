import { Sequelize } from "sequelize-typescript";
import * as dotenv from "dotenv";
import mysql from "mysql2/promise";
import logger from "../utils/logger";

dotenv.config();

const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;

async function createDatabase() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
  await connection.end();
}

const sequelize = new Sequelize({
  dialect: "mysql",
  host: DB_HOST,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  logging: false,
  models: [__dirname + "/../models"] // load all models from /models folder
});


export async function initializeSequelize() {
  await createDatabase(); // Ensure DB exists before connecting

  await sequelize.authenticate();
  logger.info("Connected to Database");

  await sequelize.sync({ alter: true });
  logger.info("Database synchronized");

  return sequelize;
}

export default sequelize;