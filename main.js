const fs = require('fs');
const Discord = require('discord.js');
const { token, prefix, author } = require('./watchlyst-config.json');
const { Emoji } = require('./emojis.json');
const client = new Discord.Client();
client.commands = new Discord.Collection();

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Gets commands from the /commands folder and validates them
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log('WatchLyst is online.');
    client.user
        .setActivity('!w help', { type: 'PLAYING' })
        .then((presence) => console.log(`Activity set to ${presence.activities[0].name}`))
        .catch(console.error);
});

client.on('guildCreate', (guild) => {
    client.commands.get('newServer').execute(guild);
});

client.on('guildMemberAdd', (guildMember) => {
    client.commands.get('notify').execute(guildMember);
});

// Checks and executes commands from the user
client.on('message', (message) => {
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(message.content) || message.author.bot) return;

    const [, matchedPrefix] = message.content.match(prefixRegex);
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;
    if (command.name === 'notify' || command.name === 'newserver') return;

    if (command.guildOnly && message.channel.type === 'dm') {
        const dmCommand = new Discord.MessageEmbed().setColor('#ea9a00').setDescription("You can only execute commands in a server if you're an admin or have an assigned role.");
        return message.channel.send(dmCommand);
    } else if (command.args && !args.length) {
        const emptyArgs = new Discord.MessageEmbed().setColor('#ea9a00').setDescription("You didn't provide any data (Type `!w help` for list of commands)");
        return message.channel.send(emptyArgs);
    }

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        const errorMsg = new Discord.MessageEmbed()
            .setColor('#ea9a00')
            .setDescription(`There was an error trying to execute that command! Contact ${author} or open a new issue at the ${Emoji.GitHub} [GitHub](https://github.com/Araraura/WatchLyst).`);
    }
});

// Bot Token. Must be at the end of the file.
client.login(token);
