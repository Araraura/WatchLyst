import { ArgsOf, Discord, On } from "discordx";
import UserList from "../database/models/UserList.js";

@Discord()
export class UserBanned {
  @On({ event: "guildBanAdd" })
  async userBanned([bannedUser]: ArgsOf<'guildBanAdd'>) {
    const userQuery = await UserList.findOne({ where: { user_id: bannedUser.user.id, server_id: bannedUser.guild.id } });
    if (userQuery === null) return;

    await UserList.destroy({ where: { user_id: bannedUser.user.id, server_id: bannedUser.guild.id } });
  }
}
