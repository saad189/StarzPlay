import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.config";

const Stock = sequelize.define(
  "Stock",
  {
    productId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  { timestamps: false }
);

export default Stock;
