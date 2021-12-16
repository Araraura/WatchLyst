const { MessageEmbed, Permissions } = require('discord.js');
const { user, password, host, port, database } = require('../database-info');
const { prefix, inviteLink, author, authorAvatar, botAvatar, botYellow, botRed } = require('../watchlyst-config.json');
const { Emoji } = require('../emojis.json');
const { Pool } = require('pg');
const PackageJson = require('../package.json');

const helpCommand = new MessageEmbed()
	.setColor(botYellow)
	.setAuthor(`Made by ${author}`, `${authorAvatar}`)
	.setTitle('WatchLyst - List of commands')
	.setDescription(`${Emoji.GitHub} [GitHub Repository](${PackageJson.homepage})`)
	.setThumbnail(botAvatar)
	.addFields(
		{ name: 'Adds a user to the WatchLyst', value: `\`${prefix} add <User ID> <Reason (Optional, max 512 characters)>\`` },
		{ name: 'Removes a user from the WatchLyst', value: `\`${prefix} remove <User ID>\`` },
		{ name: "Displays a list of users in the server's WatchLyst", value: `\`${prefix} list <Page Number>\`` },
		{ name: 'List of server setup commands (Admin Only)', value: `\`${prefix} setup\`` }
	)
	.setFooter(`Version ${PackageJson.version}`);

module.exports = {
	name: 'help',
	description: 'Shows a list of available WatchLyst commands to the user',
	aliases: ['info', 'h'],
	async execute(message) {
		const pool = new Pool({
			user: user,
			password: password,
			host: host,
			port: port,
			database: database
		});
		const client = await pool.connect();
		if (message.channel.type === 'DM') {
			helpCommand.setDescription(`[Add me to your server!](${inviteLink}) • ${Emoji.GitHub} [GitHub Repository](${PackageJson.homepage})`);
			return message.channel.send({ embeds: [helpCommand] });
		}
		const permissionCheck = await client.query(`SELECT role_id FROM public.servers WHERE server_id = '${message.guild.id}'`);
		if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !message.member.roles.cache.has(permissionCheck.rows[0].role_id)) {
			const noPermission = new MessageEmbed().setColor(botRed).setDescription(`${Emoji.Error} Error: You don't have permission to use this.`);
			message.channel.send({ embeds: [noPermission] }).then((msg) => {
				setTimeout(() => msg.delete(), 10000);
			});
		} else {
			message.channel.send({ embeds: [helpCommand] });
		}
		client.release();
	}
};