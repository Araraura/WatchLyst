import { ColorResolvable, CommandInteraction, EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType, Channel, Role, ButtonInteraction, ButtonStyle, ButtonBuilder, ActionRowBuilder, MessageActionRowComponentBuilder, ChannelType } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashOption } from "discordx";
import { watchlystConfig, emojiList } from "../config/botConfig.js";
import Servers from "../database/models/Servers.js";

@Discord()
export class Config {
  @Slash({ description: "Assign a channel & role for WatchLyst, and toggle pings", name: "config", dmPermission: false })
  async config(
    @SlashOption({
      type: ApplicationCommandOptionType.Channel,
      name: "channel",
      description: "The channel where WatchLyst will send notifications (Text channels only)",
      required: false,
    })
    channel: Channel,
    @SlashOption({
      type: ApplicationCommandOptionType.Role,
      name: "role",
      description: "The role that will have access to WatchLyst commands",
      required: false,
    })
    role: Role,
    @SlashOption({
      type: ApplicationCommandOptionType.Boolean,
      name: "ping",
      description: "Toggle pinging the role when a listed user joins",
      required: false,
    })
    ping: boolean,
    interaction: CommandInteraction): Promise<void> {
    const isAdmin = (interaction.member?.permissions as PermissionsBitField).has(PermissionsBitField.Flags.Administrator);
    if (!isAdmin) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("Only server admins may use this command.")] });
    }

    const serverQuery = await Servers.findOne({ where: { server_id: interaction.guild?.id } }) as Servers;
    if (!channel && !role && ping === undefined) {
      return void await interaction.reply({ ephemeral: true, embeds: [propertiesConfirmRemovalEmbed(serverQuery)], components: [removePropertiesButton()] })
        .then(() => setTimeout(async () =>
          interaction.editReply({ components: [removePropertiesButtonDisabled()] }), 15000));
    }

    const updates: Record<string, unknown> = {
      ...(channel ? { channel_id: channel.id } : {}),
      ...(role !== undefined && { role_id: role?.id }),
      ...(ping !== undefined && { toggle_ping: ping })
    };

    if (channel && channel.type !== ChannelType.GuildText) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("Only normal text channels are supported.")] });
    }

    await Servers.update(updates, { where: { server_id: interaction.guild?.id } })
      .then(async () => interaction.reply({ embeds: [propertiesUpdatedEmbed(await serverQuery.reload())] }));
  }

  @ButtonComponent({ id: "removeConfig" })
  async configButton(interaction: ButtonInteraction): Promise<void> {
    await Servers.update({ channel_id: null, role_id: null, toggle_ping: false }, { where: { server_id: interaction.guild?.id } })
      .then(() => {
        interaction.update({ components: [removePropertiesButtonDisabled()] });
        interaction.channel?.send({ embeds: [propertiesRemovedEmbed(interaction.user.tag)] });
      });
  }
}

const propertiesUpdatedEmbed = (server: Servers) => new EmbedBuilder()
  .setColor(watchlystConfig.colorGreen as ColorResolvable)
  .setDescription(`${emojiList.ok} Server properties have been updated`)
  .setFields(
    { name: "Channel", value: server?.channel_id != null ? `<#${server.channel_id}>` : "None", inline: true },
    { name: "Role", value: server?.role_id != null ? `<@&${server?.role_id}>` : "None", inline: true },
    { name: "Ping role", value: server?.toggle_ping ? "Enabled" : "Disabled", inline: true }
  );

const propertiesRemovedEmbed = (userTag: string) => new EmbedBuilder()
  .setColor(watchlystConfig.colorYellow as ColorResolvable)
  .setDescription(`${emojiList.info} Server properties have been removed by ${userTag}.`);

const propertiesConfirmRemovalEmbed = (server: Servers) => new EmbedBuilder()
  .setColor(watchlystConfig.colorYellow as ColorResolvable)
  .setDescription(`${emojiList.info} Server properties`)
  .setFields(
    { name: "Channel", value: server?.channel_id != null ? `<#${server.channel_id}>` : "None", inline: true },
    { name: "Role", value: server?.role_id != null ? `<@&${server?.role_id}>` : "None", inline: true },
    { name: "Ping role", value: server?.toggle_ping ? "Enabled" : "Disabled", inline: true }
  )
  .setFooter({ text: "Would you like to remove the server's configuration?" });

const removePropertiesButton = () => new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(new ButtonBuilder()
  .setCustomId("removeConfig")
  .setLabel("Remove")
  .setStyle(ButtonStyle.Secondary));

const removePropertiesButtonDisabled = () => new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(new ButtonBuilder()
  .setCustomId("removeConfig")
  .setLabel("Remove")
  .setStyle(ButtonStyle.Secondary)
  .setDisabled(true));

const errorEmbed = (description: string) => new EmbedBuilder()
  .setColor(watchlystConfig.colorRed as ColorResolvable)
  .setDescription(`${emojiList.error} Error: ${description}`);
