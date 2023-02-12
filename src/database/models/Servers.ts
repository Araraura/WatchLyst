import { Table, Column, Model, DataType, PrimaryKey, Unique, AllowNull, AutoIncrement, Default, HasMany } from "sequelize-typescript";
import UserList from "./UserList.js";

@Table({
  modelName: "Servers",
  tableName: "servers",
  timestamps: false,
  underscored: true,
})
export default class Servers extends Model {
  @PrimaryKey
  @Unique
  @AutoIncrement
  @Column(DataType.BIGINT)
  declare id: number;

  @PrimaryKey
  @Unique
  @Column(DataType.STRING(19))
  declare server_id: string;

  @HasMany(() => UserList, "server_id")
  declare users?: UserList[];

  @Column(DataType.STRING(19))
  declare channel_id: string | null;

  @Column(DataType.STRING(19))
  declare role_id: string | null;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare toggle_ping: boolean;
}
