import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
  dialect: "mysql",
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  logging: false,
  models: [__dirname + "/../models"] // load all models from /models folder
});

export default sequelize;
