import { ColorResolvable, CommandInteraction, EmbedBuilder, GuildMemberRoleManager, PermissionsBitField, User, ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { watchlystConfig, emojiList } from "../config/botConfig.js";
import Servers from "../database/models/Servers.js";
import UserList from "../database/models/UserList.js";

@Discord()
export class Remove {
  @Slash({ description: "Remove a user to the server's WatchLyst", name: "remove", dmPermission: false })
  async remove(
    @SlashOption({
      type: ApplicationCommandOptionType.User,
      name: "user_id",
      description: "The ID of the user being removed (17-19 digits long)",
      required: true,
    })
      user: User,
      interaction: CommandInteraction): Promise<void> {
    const serverQuery = await Servers.findOne({ where: { server_id: interaction.guild?.id } });
    const isAdmin = (interaction.member?.permissions as PermissionsBitField).has(PermissionsBitField.Flags.Administrator);
    const hasRole = (interaction.member?.roles as GuildMemberRoleManager).cache.has(serverQuery?.role_id as string);
    if (!isAdmin && !hasRole) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("You don't have permission to use this.")] });
    }

    const userQuery = await UserList.findOne({ where: { server_id: interaction.guild?.id, user_id: user.id } });
    if (userQuery === null) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed(`${user.tag} (${user.id}) doesn't exist in the server's WatchLyst.`)] });
    }

    await UserList.destroy({ where: { user_id: user.id, server_id: interaction.guild?.id } })
      .then(() => interaction.reply({ embeds: [userRemovedEmbed(user)] }));
  }
}

const userRemovedEmbed = (user: User) => new EmbedBuilder()
  .setColor(watchlystConfig.colorGreen as ColorResolvable)
  .setDescription(`${emojiList.ok} ${user.tag} (${user.id}) has been removed to the server's WatchLyst.`);

const errorEmbed = (description: string) => new EmbedBuilder()
  .setColor(watchlystConfig.colorRed as ColorResolvable)
  .setDescription(`${emojiList.error} Error: ${description}`);
