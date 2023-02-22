import { ColorResolvable, EmbedBuilder, Role } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import { watchlystConfig, emojiList } from "../config/botConfig.js";
import Servers from "../database/models/Servers.js";

@Discord()
export class RoleDeleted {
  @On({ event: "roleDelete" })
  async roleDeleted([deletedRole]: ArgsOf<'roleDelete'>) {
    const serverQuery = await Servers.findOne({ where: { server_id: deletedRole.guild.id } });
    if (serverQuery?.role_id === null || serverQuery?.role_id !== deletedRole.id) return;

    await Servers.update({ role_id: null }, { where: { server_id: deletedRole.guild.id } });

    const guildOwner = await deletedRole.guild.fetchOwner();
    await guildOwner.send({ embeds: [assignedRoleDeletedEmbed(deletedRole)] })
      .catch((error) => { // Cannot send messages to this user
        if (error.code === 50007) return;
      });
  }
}

const assignedRoleDeletedEmbed = (deletedRole: Role) => new EmbedBuilder()
  .setColor(watchlystConfig.colorYellow as ColorResolvable)
  .setTitle(`${emojiList.info} Assigned role deleted`)
  .setDescription(`WatchLyst's assigned role "${deletedRole.name}" has been deleted. Please assign a new role by using \`/config\` in your server.`);