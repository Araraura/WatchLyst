/* eslint-disable no-magic-numbers */
import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, AllowNull, AutoIncrement, Default, BelongsTo, Unique } from "sequelize-typescript";
import Servers from "./Servers.js";

@Table({
  modelName: "UserList",
  tableName: "user_list",
  timestamps: true,
  createdAt: "date_added",
  updatedAt: false,
  underscored: true,
})
export default class UserList extends Model {
  @PrimaryKey
  @Unique
  @AutoIncrement
  @Column(DataType.BIGINT)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING(19))
  declare user_id: string;

  @AllowNull(false)
  @ForeignKey(() => Servers)
  @Column(DataType.STRING(19))
  declare server_id: string;

  @BelongsTo(() => Servers, "server_id")
  declare servers?: Servers;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATEONLY)
  declare date_added: Date;

  @Column(DataType.STRING(999))
  declare reason: string | null;

  @AllowNull(false)
  @Column(DataType.STRING(37))
  declare added_by: string;
}
