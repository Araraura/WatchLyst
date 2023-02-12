import { ColorResolvable, CommandInteraction, EmbedBuilder, GuildMemberRoleManager, PermissionsBitField, ApplicationCommandOptionType, ActionRowBuilder, MessageActionRowComponentBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, BaseInteraction } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashOption } from "discordx";
import { watchlystConfig, emojiList } from "../config/botConfig.js";
import Servers from "../database/models/Servers.js";
import UserList from "../database/models/UserList.js";

@Discord()
export class List {
  pageList = new Map<string, number>();

  @Slash({ description: "Displays a list of listed users in the server's WatchLyst", name: "list", dmPermission: false })
  async list(
    @SlashOption({
      type: ApplicationCommandOptionType.Integer,
      name: "page",
      description: "The page of the list to display",
      minValue: 1,
      required: false,
    })
    page: number,
    interaction: CommandInteraction): Promise<void> {
    const serverQuery = await Servers.findOne({ where: { server_id: interaction.guild?.id } });
    const isAdmin = (interaction.member?.permissions as PermissionsBitField).has(PermissionsBitField.Flags.Administrator);
    const hasRole = (interaction.member?.roles as GuildMemberRoleManager).cache.has(serverQuery?.role_id as string);
    if (!isAdmin && !hasRole) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("You don't have permission to use this.")] });
    }

    const usersQuery = await UserList.findAll({ where: { server_id: interaction.guild?.id }, order: [["id", "DESC"]] });
    if (!usersQuery.length) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("There are no listed users in this server's WatchLyst.")] });
    }

    const lastPage = Math.ceil(usersQuery.length / 7);
    this.pageList.set(interaction.guild?.id as string, Math.min(page ?? 1, lastPage));
    const currPage = this.getPage(interaction);
    await interaction.reply({
      embeds: [await userListEmbed(usersQuery, currPage, interaction)],
      components: [navigationButtonsRow(currPage === 1, currPage === lastPage)]
    });
  }

  @ButtonComponent({ id: "nextPage" })
  async nextPage(interaction: ButtonInteraction): Promise<void> {
    const usersQuery = await UserList.findAll({ where: { server_id: interaction.guild?.id }, order: [["id", "DESC"]] });
    this.updatePage(interaction, this.getPage(interaction) + 1);
    const currPage = this.getPage(interaction);
    const isOnLastPage = Math.ceil(usersQuery.length / 7) === currPage;
    interaction.update({
      embeds: [await userListEmbed(usersQuery, currPage, interaction)],
      components: [navigationButtonsRow(false, isOnLastPage)]
    });
  }

  @ButtonComponent({ id: "previousPage" })
  async previousPage(interaction: ButtonInteraction): Promise<void> {
    const usersQuery = await UserList.findAll({ where: { server_id: interaction.guild?.id }, order: [["id", "DESC"]] });
    this.updatePage(interaction, this.getPage(interaction) - 1);
    const currPage = this.getPage(interaction);
    interaction.update({
      embeds: [await userListEmbed(usersQuery, currPage, interaction)],
      components: [navigationButtonsRow(currPage === 1, false)]
    });
  }

  private updatePage(interaction: BaseInteraction, page: number): void {
    this.pageList.set(interaction.guild?.id as string, page);
  }

  private getPage(interaction: BaseInteraction): number {
    return this.pageList.get(interaction.guild?.id as string) as number;
  }
}

const userListEmbed = async (usersQuery: UserList[], page: number, interaction: BaseInteraction) => {
  const listEmbed = new EmbedBuilder()
    .setColor(watchlystConfig.colorYellow as ColorResolvable)
    .setTitle(`${interaction.guild?.name} - Listed Users`);

  const start = (page - 1) * 7;
  const end = Math.min(start + 7, usersQuery.length);
  const users = usersQuery.slice(start, end);

  for (const user of users) {
    const fetchedUserTag = (await interaction.client.users.fetch(user.user_id)
      .catch((error) => {
        if (error.code === 10013) {
          return void UserList.destroy({ where: { user_id: user.user_id, server_id: interaction.guild?.id } });
        }
      }))?.tag ?? "Deleted User";
    const truncatedReason = (user.reason as string)?.length >= 200 ? `${user.reason?.substring(0, 200)}...` : user.reason ?? "No reason provided";
    listEmbed.addFields({
      name: `${fetchedUserTag} (${user.user_id}) - Listed by ${user.added_by}`,
      value: `${truncatedReason} - Listed at ${formatDate(user.date_added)}`
    });
  }
  listEmbed.setFooter({ text: `Page ${page} of ${Math.ceil(usersQuery.length / 7)}` });

  return listEmbed;
};

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });

const nextPageButton = (isDisabled: boolean) => new ButtonBuilder()
  .setCustomId("nextPage")
  .setLabel("Next Page")
  .setStyle(ButtonStyle.Secondary)
  .setEmoji("▶️")
  .setDisabled(isDisabled);

const previousPageButton = (isDisabled: boolean) => new ButtonBuilder()
  .setCustomId("previousPage")
  .setLabel("Previous Page")
  .setStyle(ButtonStyle.Secondary)
  .setEmoji("◀️")
  .setDisabled(isDisabled);

const navigationButtonsRow = (previousDisabled: boolean, nextDisabled: boolean) => new ActionRowBuilder<MessageActionRowComponentBuilder>()
  .addComponents(previousPageButton(previousDisabled), nextPageButton(nextDisabled));

const errorEmbed = (description: string) => new EmbedBuilder()
  .setColor(watchlystConfig.colorRed as ColorResolvable)
  .setDescription(`${emojiList.error} Error: ${description}`);
