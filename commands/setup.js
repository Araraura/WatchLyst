const { MessageEmbed, Permissions } = require('discord.js');
const { prefix, botYellow, botRed } = require('../watchlyst-config.json');
const { Emoji } = require('../emojis.json');

const helpCommand = new MessageEmbed()
	.setColor(botYellow)
	.setTitle('WatchLyst - Server Setup')
	.addFields(
		{ name: 'Specify the channel where WatchLyst will notify when a listed user joins the server', value: `\`${prefix} channel <Channel ID>\`` },
		{ name: 'Specify a role that will get access to WatchLyst commands (Excluding admin commands)', value: `\`${prefix} role <Role ID>\`` },
		{ name: 'Toggle whether or not the assigned role will be pinged once a listed member joins the server (Default: off)', value: `\`${prefix} toggleping\`` }
	);

module.exports = {
	name: 'setup',
	description: 'Shows a list of server setup commands to a server admin',
	guildOnly: true,
	execute(message) {
		if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			const noPermission = new MessageEmbed().setColor(botRed).setDescription(`${Emoji.Error} Error: Only an admin may use this command.`);
			return message.channel.send({ embeds: [noPermission] }).then((msg) => {
				setTimeout(() => msg.delete(), 10000);
			});
		} else if (message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			return message.channel.send({ embeds: [helpCommand] });
		}
	}
};