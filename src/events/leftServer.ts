import { ArgsOf, Discord, On } from "discordx";
import Servers from "../database/models/Servers.js";

@Discord()
export class LeftServer {
  @On({ event: "guildDelete" })
  async leftServer([guild]: ArgsOf<"guildDelete">) {
    await Servers.destroy({ where: { server_id: guild.id } });
  }
}
