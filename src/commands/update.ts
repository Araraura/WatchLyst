import { ColorResolvable, CommandInteraction, EmbedBuilder, GuildMemberRoleManager, PermissionsBitField, User, ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { watchlystConfig, emojiList } from "../config/botConfig.js";
import Servers from "../database/models/Servers.js";
import UserList from "../database/models/UserList.js";

@Discord()
export class Update {
  @Slash({ description: "Update a user information to the server's WatchLyst", name: "update", dmPermission: false })
  async update(
    @SlashOption({
      type: ApplicationCommandOptionType.User,
      name: "user_id",
      description: "The ID of the user being updated (17-19 digits long)",
      required: true,
    })
    user: User,
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "reason",
      description: "The updated reason for the user",
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

    const userQuery = await UserList.findOne({ where: { server_id: interaction.guild?.id, user_id: user.id } });
    if (userQuery === null) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed(`${user.tag} (${user.id}) could not be found in the server's WatchLyst.`)] });
    }

    await UserList.update({ reason: reason ?? null }, { where: { server_id: interaction.guild?.id, user_id: user.id } })
      .then(() => interaction.reply({ embeds: [userUpdatedEmbed(user, reason)] }));
  }
}

const userUpdatedEmbed = (user: User, reason: string | undefined) => new EmbedBuilder()
  .setColor(watchlystConfig.colorGreen as ColorResolvable)
  .setDescription(`${emojiList.ok} ${user.tag} (${user.id})'s reason has been updated.`)
  .setFields(
    { name: "New reason:", value: reason ?? "No reason provided." }
  );

const errorEmbed = (description: string) => new EmbedBuilder()
  .setColor(watchlystConfig.colorRed as ColorResolvable)
  .setDescription(`${emojiList.error} Error: ${description}`);
