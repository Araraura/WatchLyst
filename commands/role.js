const { MessageEmbed, Permissions } = require('discord.js');
const { user, password, host, port, database } = require('../database-info');
const { prefix, author, botYellow, botRed } = require('../watchlyst-config.json');
const { Emoji } = require('../emojis.json');
const { Pool } = require('pg');
const PackageJson = require('../package.json');

module.exports = {
	name: 'role',
	description: 'Receives a role ID that will allow users with the given role to run non-admin WatchLyst commands',
	args: true,
	guildOnly: true,
	async execute(message, args) {
		const pool = new Pool({
			user: user,
			password: password,
			host: host,
			port: port,
			database: database
		});

		if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			const noPermission = new MessageEmbed().setColor(botRed).setDescription(`${Emoji.Error} Error: Only an admin may use this command.`);
			return message.channel.send({ embeds: [noPermission] }).then((msg) => {
				setTimeout(() => msg.delete(), 10000);
			});
		} else {
			const client = await pool.connect();
			try {
				// Check if the Role ID isn't 18 characters long, or if it contains non-digit characters
				if (args[0].length !== 18 || /\D/.test(args[0])) {
					const invalidID = new MessageEmbed()
						.setColor(botRed)
						.setDescription(`${Emoji.Error} Error: Role IDs must consist of 18 digits (Type \`${prefix} setup\` for list of setup commands).`);
					return message.channel.send({ embeds: [invalidID] });
					// Checks if the Role ID is 18 characters long and updates
				} else if (args[0].length === 18) {
					await client.query('BEGIN');
					await client.query(`UPDATE public.servers SET role_id = '${args[0]}' WHERE server_id = '${message.guild.id}'`);
					await client.query('COMMIT');
					const roleCommand = new MessageEmbed().setColor(botYellow).setDescription(`${Emoji.Ok} Users with the <@&${args[0]}> role can now use non-admin WatchLyst commands.`);
					message.channel.send({ embeds: [roleCommand] });
					return console.log(`Updated role (${args[0]}) for server (${message.guild.id})`);
				}
			} catch (ex) {
				const exceptionOccurred = new MessageEmbed()
					.setColor(botRed)
					.setDescription(
						`${Emoji.Error} Error: Something went wrong when setting up a role. Contact ${author} or open a new issue at the ${Emoji.GitHub} [GitHub](${PackageJson.bugs.url}). \n\`${ex}\``
					);
				message.channel.send({ embeds: [exceptionOccurred] });
				return await client.query('ROLLBACK');
			} finally {
				client.release();
			}
		}
	}
};