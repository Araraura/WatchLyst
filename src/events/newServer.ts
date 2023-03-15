import { ColorResolvable, EmbedBuilder } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import { watchlystConfig, emojiList } from "../config/botConfig.js";
import PackageJson from "../../package.json" assert { type: "json" };
import Servers from "../database/models/Servers.js";

@Discord()
export class NewServer {
  @On({ event: "guildCreate" })
  async newServer([guild]: ArgsOf<"guildCreate">) {
    const guildOwner = await guild.fetchOwner();
    const botAvatar = guild.client.user.displayAvatarURL({ extension: "png", size: 1024 });
    await guildOwner.send({ embeds: [welcomeMessageEmbed(guild.name, botAvatar)] })
      .catch((error) => { // Cannot send messages to this user
        // eslint-disable-next-line no-magic-numbers, no-useless-return
        if (error.code === 50007) return;
      });

    const botAuthor = await guild.client.users.fetch(watchlystConfig.authorId);
    await Servers.findOrCreate({ where: { server_id: guild.id } }).catch((error) =>
      guildOwner.send({ embeds: [errorMessageEmbed(error, botAuthor.tag)] })
        .catch((err) => { // Cannot send messages to this user
          // eslint-disable-next-line no-magic-numbers, no-useless-return
          if (err.code === 50007) return;
        }));
  }
}

const welcomeMessageEmbed = (guildName: string, botAvatar: string) => new EmbedBuilder()
  .setColor(watchlystConfig.colorYellow as ColorResolvable)
  .setTitle("Thank you for inviting WatchLyst!")
  .setDescription(welcomeMessage(guildName))
  .setThumbnail(botAvatar);

const welcomeMessage = (guildName: string) =>
  `Thank you for inviting WatchLyst into ${guildName}! You can view the list of commands using \`/help\`.
  \nPlease note that until you assign a channel for WatchLyst using \`/config\`, you will receive direct messages here when a listed user joins.`;

const errorMessageEmbed = (exception: string, authorTag: string) => new EmbedBuilder()
  .setColor(watchlystConfig.colorRed as ColorResolvable)
  .setDescription(errorMessage(exception, authorTag));

const errorMessage = (exception: string, authorTag: string) =>
  `An error occurred when WatchLyst tried to join your server. Please kick WatchLyst from the server and [reinvite it](${watchlystConfig.inviteLink}).
  \nIf the error persists, contact ${authorTag} or open a new issues at the ${emojiList.github} [GitHub](${PackageJson.bugs.url}).
  \n${exception}`;
