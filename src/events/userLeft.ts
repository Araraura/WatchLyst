import { ColorResolvable, EmbedBuilder, GuildMember, TextChannel } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import { watchlystConfig, emojiList } from "../config/botConfig.js";
import Servers from "../database/models/Servers.js";
import UserList from "../database/models/UserList.js";

@Discord()
export class UserLeft {
  @On({ event: "guildMemberRemove" })
  async userLeft([leavingUser]: ArgsOf<'guildMemberRemove'>) {
    const userQuery = await UserList.findOne({ where: { user_id: leavingUser.id, server_id: leavingUser.guild.id } });
    if (userQuery === null) return;

    const serverQuery = await Servers.findOne({ where: { server_id: leavingUser.guild.id } });
    if (!serverQuery?.channel_id) {
      const guildOwner = await leavingUser.guild.fetchOwner();
      const listedUserLeftNofityOwner = listedUserLeftEmbed(leavingUser as GuildMember, userQuery)
        .setFooter({ text: "Tip: You can assign a channel for WatchLyst to send notifications like these by using `/config` in your server." });
      return void await guildOwner.send({ embeds: [listedUserLeftNofityOwner] })
        .catch((error) => {
          if (error.code === 50007) return;
        });;
    }

    const channelToSend = await leavingUser.guild.channels.fetch(serverQuery?.channel_id as string) as TextChannel;
    await channelToSend?.send({ embeds: [listedUserLeftEmbed(leavingUser as GuildMember, userQuery)] });
  }
}

const listedUserLeftEmbed = (user: GuildMember, userQuery: UserList) => {
  const dateAddedFormatted = new Date(userQuery.date_added).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
  return new EmbedBuilder()
    .setColor(watchlystConfig.colorYellow as ColorResolvable)
    .setTitle(`${emojiList.info} ${user.user.tag} (${user.id}) has left ${user.guild.name}.`)
    .setDescription(`${userQuery.reason ?? "No reason provided."} - Listed by ${userQuery.added_by} at ${dateAddedFormatted}
    \nThis user will remain listed in the server's WatchLyst **unless this was a ban.**`);
};