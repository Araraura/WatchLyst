import { ColorResolvable, EmbedBuilder, GuildMember, TextChannel } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import { watchlystConfig, emojiList } from "../config/botConfig.js";
import Servers from "../database/models/Servers.js";
import UserList from "../database/models/UserList.js";

@Discord()
export class UserJoined {
  @On({ event: "guildMemberAdd" })
  async userJoined([newUser]: ArgsOf<'guildMemberAdd'>) {
    const userQuery = await UserList.findOne({ where: { user_id: newUser.id, server_id: newUser.guild.id } });
    if (userQuery === null) return;

    const serverQuery = await Servers.findOne({ where: { server_id: newUser.guild.id } });
    if (!serverQuery?.channel_id) {
      const guildOwner = await newUser.guild.fetchOwner();
      const listedUserJoinedNofityOwner = listedUserJoinedEmbed(newUser, userQuery)
        .setFooter({ text: "Tip: You can assign a channel for WatchLyst to send notifications like these by using `/config` in your server." });
      return void await guildOwner.send({ embeds: [listedUserJoinedNofityOwner] })
        .catch((error) => {
          if (error.code === 50007) return;
        });;
    }

    let pingRoleMessage = undefined;
    if (serverQuery?.toggle_ping && serverQuery?.role_id !== null) {
      const roleToPing = await newUser.guild.roles.fetch(serverQuery?.role_id as string);
      pingRoleMessage = `WatchLyst notification for ${newUser.guild.name} - ${roleToPing}`;
    }

    const channelToSend = await newUser.guild.channels.fetch(serverQuery?.channel_id as string) as TextChannel;
    await channelToSend?.send({ embeds: [listedUserJoinedEmbed(newUser, userQuery)], content: pingRoleMessage });
  }
}

const listedUserJoinedEmbed = (user: GuildMember, userQuery: UserList) => {
  const dateAddedFormatted = new Date(userQuery.date_added).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
  return new EmbedBuilder()
    .setColor(watchlystConfig.colorYellow as ColorResolvable)
    .setTitle(`${emojiList.info} Warning - ${user.user.tag} (${user.id}) has joined ${user.guild.name}.`)
    .setDescription(`${userQuery.reason ?? "No reason provided."} - Listed by ${userQuery.added_by} at ${dateAddedFormatted}`);
};