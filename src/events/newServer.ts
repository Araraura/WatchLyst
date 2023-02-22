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
    await guildOwner.send({ embeds: [welcomeMessageEmbed(guild.name)] })
      .catch((error) => { // Cannot send messages to this user
        if (error.code === 50007) return;
      });

    await Servers.findOrCreate({ where: { server_id: guild.id } }).catch((error) =>
      guildOwner.send({ embeds: [errorMessageEmbed(error)] })
        .catch((error) => { // Cannot send messages to this user
          if (error.code === 50007) return;
        }));
  }
}

const welcomeMessageEmbed = (guildName: string) => new EmbedBuilder()
  .setColor(watchlystConfig.colorYellow as ColorResolvable)
  .setTitle("Thank you for inviting WatchLyst!")
  .setDescription(welcomeMessage(guildName))
  .setThumbnail(watchlystConfig.botAvatar);

const welcomeMessage = (guildName: string) =>
  `Thank you for inviting WatchLyst into ${guildName}! You can view the list of commands using \`/help\`.
  \nPlease note that until you assign a channel for WatchLyst using \`/config\`, you will receive direct messages here when a listed user joins.`;

const errorMessageEmbed = (exception: string) => new EmbedBuilder()
  .setColor(watchlystConfig.colorRed as ColorResolvable)
  .setDescription(errorMessage(exception));

const errorMessage = (exception: string) =>
  `An error occurred when WatchLyst tried to join your server. Please kick WatchLyst from the server and [reinvite it](${watchlystConfig.inviteLink}).
  \nIf the error persists, contact ${watchlystConfig.authorTag} or open a new issues at the ${emojiList.github} [GitHub](${PackageJson.bugs.url}).
  \n${exception}`;
