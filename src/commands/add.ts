import { ColorResolvable, CommandInteraction, EmbedBuilder, GuildMemberRoleManager, PermissionsBitField, User, ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { watchlystConfig, emojiList } from "../config/botConfig.js";
import Servers from "../database/models/Servers.js";
import UserList from "../database/models/UserList.js";

@Discord()
export class Add {
  @Slash({ description: "Add a user to the server's WatchLyst", name: "add", dmPermission: false })
  async add(
    @SlashOption({
      type: ApplicationCommandOptionType.User,
      name: "user_id",
      description: "The ID of the user being added (17-19 digits long)",
      required: true,
    })
      user: User,
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "reason",
      description: "The reason for adding the user",
      required: false,
      maxLength: 999,
    })
      reason: string,
      interaction: CommandInteraction): Promise<void> {
    const serverQuery = await Servers.findOne({ where: { server_id: interaction.guild?.id } });
    const isAdmin = (interaction.member?.permissions as PermissionsBitField).has(PermissionsBitField.Flags.Administrator);
    const hasRole = (interaction.member?.roles as GuildMemberRoleManager).cache.has(serverQuery?.role_id as string);
    if (!isAdmin && !hasRole) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("You don't have permission to use this.")] });
    }

    try {
      const userTag = (await interaction.guild?.bans.fetch(user.id))?.user.tag;
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed(`${userTag} (${user.id}) is already banned in the server.`)] });
    } catch { /* empty */ }
    try {
      const userTag = (await interaction.guild?.members.fetch(user.id))?.user.tag;
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed(`${userTag} (${user.id}) is currently in the server.`)] });
    } catch { /* empty */ }

    const userQuery = await UserList.findOne({ where: { server_id: interaction.guild?.id, user_id: user.id } });
    if (userQuery !== null) {
      const alreadyInServerEmbed = errorEmbed(`${user.tag} (${user.id}) is already listed in the server's WatchLyst.`);
      alreadyInServerEmbed.addFields({ name: "Reason for adding:", value: userQuery.reason ?? "No reason provided." });
      alreadyInServerEmbed.setFooter({ text: "Note: You can use `/update [User ID*] [Reason]` to update the user." });
      return void await interaction.reply({ ephemeral: true, embeds: [alreadyInServerEmbed] });
    }

    await UserList.create({ user_id: user.id, server_id: interaction.guild?.id, reason: reason ?? null, added_by: interaction.user.tag })
      .then(() => interaction.reply({ embeds: [userAddedEmbed(user, reason)] }));
  }
}

const userAddedEmbed = (user: User, reason: string | undefined) => new EmbedBuilder()
  .setColor(watchlystConfig.colorGreen as ColorResolvable)
  .setDescription(`${emojiList.ok} ${user.tag} (${user.id}) has been added to the server's WatchLyst.`)
  .setFields(
    { name: "Reason for adding:", value: reason ?? "No reason provided." },
  );

const errorEmbed = (description: string) => new EmbedBuilder()
  .setColor(watchlystConfig.colorRed as ColorResolvable)
  .setDescription(`${emojiList.error} Error: ${description}`);
