const { MessageEmbed, Permissions } = require('discord.js');
const { user, password, host, port, database } = require('../database-info');
const { prefix, author, botYellow, botRed } = require('../watchlyst-config.json');
const { Emoji } = require('../emojis.json');
const { Pool } = require('pg');
const { format } = require('date-fns');
const PackageJson = require('../package.json');

module.exports = {
	name: 'check',
	description: "Shows information for a given user in the server's WatchLyst",
	args: true,
	guildOnly: true,
	aliases: ['display', 'c'],
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
					const results = await client.query(`SELECT user_id, added_by, reason, date_added FROM public.user_list WHERE server_id = '${message.guild.id}' AND user_id = '${args[0]}'`);
					// If the User is in the list, displays it
					if (results.rows[0] !== undefined) {
						const displayUser = new MessageEmbed()
							.setColor(botYellow)
							.addField(
								`User ID: ${results.rows[0].user_id} | Added by: ${results.rows[0].added_by}`,
								`${results.rows[0].reason} - Listed at ${format(results.rows[0].date_added, 'MMM dd yyyy')}`
							);
						return message.channel.send({ embeds: [displayUser] });
					} else if (results.rows[0] === undefined) {
						const userExists = new MessageEmbed().setColor(botRed).setDescription(`${Emoji.Error} Error: <@${args[0]}> doesn't exist in the server's WatchLyst.`);
						return message.channel.send({ embeds: [userExists] });
					}
				}
			} catch (ex) {
				const exceptionOccurred = new MessageEmbed()
					.setColor(botRed)
					.setDescription(
						`${Emoji.Error} Error: Something went wrong when trying to check for a user. Contact ${author} or open a new issue at the ${Emoji.GitHub} [GitHub](${PackageJson.bugs.url}). \n\`${ex}\``
					);
				return message.channel.send({ embeds: [exceptionOccurred] });
			} finally {
				client.release();
			}
		}
	}
};