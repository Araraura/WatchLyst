const { MessageEmbed, Permissions } = require('discord.js');
const { user, password, host, port, database } = require('../database-info');
const { prefix, author, botGreen, botRed } = require('../watchlyst-config.json');
const { Emoji } = require('../emojis.json');
const { Pool } = require('pg');
const PackageJson = require('../package.json');

module.exports = {
	name: 'remove',
	description: "Removes a user from the server's WatchLyst",
	args: true,
	guildOnly: true,
	aliases: ['delete', 'r'],
	async execute(message, args) {
		const pool = new Pool({
			user: user,
			password: password,
			host: host,
			port: port,
			database: database
		});

		const client = await pool.connect();
		const permissionCheck = await client.query(`SELECT role_id FROM public.servers WHERE server_id = '${message.guild.id}'`);
		if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !message.member.roles.cache.has(permissionCheck.rows[0].role_id)) {
			const noPermission = new MessageEmbed().setColor(botRed).setDescription(`${Emoji.Error} Error: You don't have permission to use this.`);
			return message.channel.send({ embeds: [noPermission] }).then((msg) => {
				setTimeout(() => msg.delete(), 10000);
				return client.release();
			});
		} else {
			try {
				// Check if the User ID isn't 18 characters long, or if it contains non-digit characters
				if (args[0].length !== 18 || /\D/.test(args[0])) {
					const invalidID = new MessageEmbed().setColor(botRed).setDescription(`${Emoji.Error} Error: User IDs must consist of 18 digits (Type \`${prefix} help\` for list of commands).`);
					return message.channel.send({ embeds: [invalidID] });
					// Checks if the User ID is 18 characters long
				} else if (args[0].length === 18) {
					await client.query('BEGIN');
					const results = await client.query(`SELECT user_id FROM public.user_list WHERE server_id = '${message.guild.id}' AND user_id = '${args[0]}'`);
					// If the User is in the list, removes it
					if (results.rows[0] !== undefined) {
						await client.query(`DELETE FROM public.user_list WHERE server_id = '${message.guild.id}' AND user_id = '${args[0]}'`);
					} else if (results.rows[0] === undefined) {
						const userExists = new MessageEmbed().setColor(botRed).setDescription(`${Emoji.Error} Error: <@${args[0]}> doesn't exist in the server's WatchLyst.`);
						return message.channel.send({ embeds: [userExists] });
					}
					await client.query('COMMIT');
					const removeCommand = new MessageEmbed().setColor(botGreen).setDescription(`${Emoji.Ok} <@${args[0]}> has been removed from the server's WatchLyst.`);
					message.channel.send({ embeds: [removeCommand] });
					return console.log(`Removed user (${args[0]}) from server (${message.guild.id})`);
				}
			} catch (ex) {
				const exceptionOccurred = new MessageEmbed()
					.setColor(botRed)
					.setDescription(
						`${Emoji.Error} Error: Something went wrong when removing a user. Contact ${author} or open a new issue at the ${Emoji.GitHub} [GitHub](${PackageJson.bugs.url}). \n\`${ex}\``
					);
				message.channel.send({ embeds: [exceptionOccurred] });
				return await client.query('ROLLBACK');
			} finally {
				client.release();
			}
		}
	}
};