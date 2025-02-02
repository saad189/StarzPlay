import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({ tableName: 'inventory' })
export class Inventory extends Model<Inventory> {
  @Column({ primaryKey: true, type: DataType.STRING })
  productId!: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  quantity!: number;

  @Column({ type: DataType.DATE, allowNull: false })
  timestamp!: Date;
}

export default Inventory;