const fs = require('fs');
const { Collection, Client, Intents, MessageEmbed } = require('discord.js');
const { token, prefix, author, botYellow, botRed } = require('./watchlyst-config.json');
const { Emoji } = require('./emojis.json');
const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.DIRECT_MESSAGES],
	partials: ['CHANNEL']
});
client.commands = new Collection();
const PackageJson = require('./package.json');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Gets commands from the /commands folder and validates them
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	console.log('WatchLyst is online.');
	client.user.setActivity(`${prefix} help`, { type: 'LISTENING' });
});

client.on('guildCreate', (guild) => {
	client.commands.get('newserver').execute(guild);
});

client.on('guildMemberAdd', (guildMember) => {
	client.commands.get('notify').execute(guildMember);
});

// Checks and executes commands from the user
client.on('messageCreate', (message) => {
	const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
	if (!prefixRegex.test(message.content) || message.author.bot || message.webhookId) return;

	const [, matchedPrefix] = message.content.match(prefixRegex);
	const args = message.content.slice(matchedPrefix.length).trim().split(/\s+/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
	if (!command) return;
	if (command.name === 'notify' || command.name === 'newserver') return;

	if (command.guildOnly && message.channel.type === 'DM') {
		const dmCommand = new MessageEmbed().setColor(botYellow).setDescription(`${Emoji.Info} You can only execute commands in a server if you're an admin or have an assigned role.`);
		return message.channel.send({ embeds: [dmCommand] });
	} else if (command.args && !args.length) {
		const emptyArgs = new MessageEmbed().setColor(botYellow).setDescription(`${Emoji.Info} You didn't provide any data (Type \`${prefix} help\` for list of commands).`);
		return message.channel.send({ embeds: [emptyArgs] });
	}

	try {
		return command.execute(message, args);
	} catch (ex) {
		const exceptionOccurred = new MessageEmbed()
			.setColor(botRed)
			.setDescription(`${Emoji.Error} There was an error trying to execute that command. Contact ${author} or open a new issue at ${Emoji.GitHub} [GitHub](${PackageJson.bugs.url}). \n\`${ex}\``);
		return message.channel.send({ embeds: [exceptionOccurred] });
	}
});

client.login(token);