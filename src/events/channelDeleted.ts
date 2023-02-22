import { ColorResolvable, EmbedBuilder, TextChannel } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import { watchlystConfig, emojiList } from "../config/botConfig.js";
import Servers from "../database/models/Servers.js";

@Discord()
export class ChannelDeleted {
  @On({ event: "channelDelete" })
  async channelDeleted([deletedChannel]: ArgsOf<'channelDelete'>) {
    const serverQuery = await Servers.findOne({ where: { server_id: (deletedChannel as TextChannel).guildId } });
    if (serverQuery?.channel_id === null || serverQuery?.channel_id !== deletedChannel.id) return;

    await Servers.update({ channel_id: null }, { where: { server_id: (deletedChannel as TextChannel).guildId } });

    const guildOwner = await (deletedChannel as TextChannel).guild.fetchOwner();
    await guildOwner.send({ embeds: [assignedChannelDeletedEmbed(deletedChannel as TextChannel)] })
      .catch((error) => { // Cannot send messages to this user
        if (error.code === 50007) return;
      });
  }
}

const assignedChannelDeletedEmbed = (deletedChannel: TextChannel) => new EmbedBuilder()
  .setColor(watchlystConfig.colorYellow as ColorResolvable)
  .setTitle(`${emojiList.info} Assigned channel deleted`)
  .setDescription(`WatchLyst's assigned channel "${deletedChannel.name}" has been deleted. Please assign a new channel by using \`/config\` in your server.`);