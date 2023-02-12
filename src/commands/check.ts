import { ColorResolvable, CommandInteraction, EmbedBuilder, GuildMemberRoleManager, PermissionsBitField, User, ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { watchlystConfig, emojiList } from "../config/botConfig.js";
import Servers from "../database/models/Servers.js";
import UserList from "../database/models/UserList.js";

@Discord()
export class Check {
  @Slash({ description: "Shows information of an existing user in the server's WatchLyst", name: "check", dmPermission: false })
  async check(
    @SlashOption({
      type: ApplicationCommandOptionType.User,
      name: "user_id",
      description: "The ID of the user being checked (17-19 digits long)",
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

    await interaction.reply({ embeds: [userInfoEmbed(user, userQuery)] });
  }
}

const userInfoEmbed = (user: User, userQuery: UserList) => {
  const dateAddedFormatted = new Date(userQuery.date_added).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
  return new EmbedBuilder()
    .setColor(watchlystConfig.colorYellow as ColorResolvable)
    .setFields(
      {
        name: `${user.tag} | ID: ${user.id} - Listed by: ${userQuery.added_by}`,
        value: `${userQuery.reason ?? "No reason provided."} - Listed at ${dateAddedFormatted}`
      }
    );
};

const errorEmbed = (description: string) => new EmbedBuilder()
  .setColor(watchlystConfig.colorRed as ColorResolvable)
  .setDescription(`${emojiList.error} Error: ${description}`);
