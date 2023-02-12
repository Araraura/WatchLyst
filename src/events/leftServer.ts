import { ArgsOf, Discord, On } from "discordx";
import Servers from "../database/models/Servers.js";

@Discord()
export class LeftServer {
  @On({ event: "guildDelete" })
  async leftServer([guild]: ArgsOf<"guildDelete">) {
    await Servers.update({ channel_id: null, role_id: null, toggle_ping: false }, { where: { server_id: guild.id } });
  }
}
