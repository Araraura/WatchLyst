import { dirname, importx } from "@discordx/importer";
import { ActivityType, Interaction } from "discord.js";
import { IntentsBitField, Partials } from "discord.js";
import { Client } from "discordx";
import database from "./database/index.js";

export const bot = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildBans,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.MessageContent,
  ],
  partials: [Partials.Channel],

  // Debug logs are disabled in silent mode
  silent: true,
});

bot.once("ready", async () => {
  // Make sure all guilds are cached
  await bot.guilds.fetch();

  // Synchronize applications commands with Discord
  await bot.initApplicationCommands();

  // To clear all guild commands, uncomment this line,
  // This is useful when moving from guild commands to global commands
  // It must only be executed once

  // await bot.clearApplicationCommands(
  //   ...bot.guilds.cache.map((g) => g.id)
  // );

  bot.user?.setActivity({ name: "/help", type: ActivityType.Listening });

  console.log("Bot started");
});

bot.on("interactionCreate", (interaction: Interaction) => {
  if (interaction.user.bot) return;
  bot.executeInteraction(interaction);
});

async function run() {
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  if (!process.env.BOT_TOKEN) {
    throw Error("Could not find BOT_TOKEN variable in the environment");
  }
  bot.login(process.env.BOT_TOKEN as string);
}

database.sync().then(() => void run());
