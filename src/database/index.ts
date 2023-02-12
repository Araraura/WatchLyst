import { Sequelize } from "sequelize-typescript";
import UserList from "./models/UserList.js";
import Servers from "./models/Servers.js";
import * as dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: "postgres",
  models: [UserList, Servers],
});

export default sequelize;
