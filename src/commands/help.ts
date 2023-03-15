import { ChannelType, ColorResolvable, CommandInteraction, EmbedBuilder, GuildMemberRoleManager, PermissionsBitField } from "discord.js";
import { Discord, Slash } from "discordx";
import { watchlystConfig, emojiList } from "../config/botConfig.js";
import PackageJson from "../../package.json" assert { type: "json" };
import Servers from "../database/models/Servers.js";

@Discord()
export class Help {
  @Slash({ description: "List of WatchLyst commands", name: "help" })
  async help(interaction: CommandInteraction): Promise<void> {
    const botAvatar = interaction.client.user.displayAvatarURL({ extension: "png", size: 1024 });
    const botAuthor = await interaction.client.users.fetch(watchlystConfig.authorId);
    if (interaction.channel?.type === ChannelType.DM) {
      const helpDirectMessageEmbed = helpEmbed(botAvatar, botAuthor.tag, botAuthor.displayAvatarURL())
        .setDescription(`[Add me to your server!](${watchlystConfig.inviteLink}) • ${emojiList.github} [GitHub Repository](${PackageJson.homepage})`);
      return void await interaction.reply({ embeds: [helpDirectMessageEmbed] });
    }

    const serverQuery = await Servers.findOne({ where: { server_id: interaction.guild?.id } });
    const isAdmin = (interaction.member?.permissions as PermissionsBitField).has(PermissionsBitField.Flags.Administrator);
    const hasRole = (interaction.member?.roles as GuildMemberRoleManager).cache.has(serverQuery?.role_id as string);
    if (!isAdmin && !hasRole) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("You don't have permission to use this.")] });
    }

    await interaction.reply({ embeds: [helpEmbed(botAvatar, botAuthor.tag, botAuthor.displayAvatarURL())] });
  }
}

const helpEmbed = (botAvatar: string, authorTag: string, authorAvatar: string) => new EmbedBuilder()
  .setColor(watchlystConfig.colorYellow as ColorResolvable)
  .setAuthor({ name: `Made by ${authorTag}`, iconURL: authorAvatar })
  .setTitle("WatchLyst - List of Commands")
  .setDescription(`${emojiList.github} [GitHub Repository](${PackageJson.homepage})`)
  .setThumbnail(botAvatar)
  .setFields(
    { name: "Add a user to the server's WatchLyst", value: "`/add [User ID*] [Reason]`" },
    { name: "Remove a user from the server's WatchLyst", value: "`/remove [User ID*]`" },
    { name: "Update a user's information in the server's WatchLyst", value: "`/update [User ID*] [Reason]`" },
    { name: "Display a list of users in the server's WatchLyst", value: "`/list [Page]`" },
    { name: "Show information about a user in the server's WatchLyst", value: "`/check [User ID*]`" },
    { name: "Configurate WatchLyst settings (Admin Only)", value: "`/setup [Channel] [Role] [Toggle Pings]`" },
  )
  .setFooter({ text: `Version ${PackageJson.version}` });

const errorEmbed = (description: string) => new EmbedBuilder()
  .setColor(watchlystConfig.colorRed as ColorResolvable)
  .setDescription(`${emojiList.error} Error: ${description}`);
