import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({ tableName: 'inventory' })
export class Inventory extends Model<Inventory> {
  @Column({ primaryKey: true })
  productId!: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  quantity!: number;

}

export default Inventory;