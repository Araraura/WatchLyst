const { MessageEmbed, Permissions } = require('discord.js');
const { user, password, host, port, database } = require('../database-info');
const { author, botYellow, botRed } = require('../watchlyst-config.json');
const { Emoji } = require('../emojis.json');
const { Pool } = require('pg');
const { format } = require('date-fns');
const PackageJson = require('../package.json');

module.exports = {
	name: 'list',
	description: "Displays a list of the server's listed users",
	guildOnly: true,
	aliases: ['lyst', 'watchlyst', 'watchlist', 'l'],
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
			});
		} else {
			try {
				const results = await client.query(`SELECT user_id, date_added, reason, added_by FROM public.user_list WHERE server_id = '${message.guild.id}'`);
				// User has not provided a page number
				if (args[0] === undefined) {
					// Check if the server's WatchLyst has any users
					if (results.rows[0] === undefined) {
						const noUsers = new MessageEmbed().setColor(botYellow).setDescription(`${Emoji.Info} There are no users listed in the server's WatchLyst.`);
						return message.channel.send({ embeds: [noUsers] });
						// If users are listed, displays them
					} else if (results.rows[0] !== undefined) {
						const listCommand = new MessageEmbed().setColor(botYellow).setTitle('WatchLyst - Listed Users');
						if (results.rowCount > 7) {
							results.rows.slice(0, 7).forEach((row) =>
								listCommand.fields.push({
									name: `User ID: ${row.user_id} | Added by: ${row.added_by}`,
									value: `${row.reason} - Listed at ${format(row.date_added, 'MMM dd yyyy')}`
								})
							);
							listCommand.setFooter(`Page 1 / ${Math.ceil(results.rowCount / 7)}`);
							return message.channel.send({ embeds: [listCommand] });
						} else if (results.rowCount <= 7) {
							results.rows.forEach((row) =>
								listCommand.fields.push({ name: `User ID: ${row.user_id} | Added by: ${row.added_by}`, value: `${row.reason} - Listed at ${format(row.date_added, 'MMM dd yyyy')}` })
							);
							return message.channel.send({ embeds: [listCommand] });
						}
					}
					// Checks if the page the user has provided is a number
				} else if (/\D/.test(args[0])) {
					const notANumberPage = new MessageEmbed().setColor(botRed).setDescription(`${Emoji.Error} Error: Invalid page number. Only use positive numbers for pages.`);
					return message.channel.send({ embeds: [notANumberPage] });
				} else if (args[0] <= 0) {
					const pageZero = new MessageEmbed().setColor(botRed).setDescription(`${Emoji.Error} Error: You cannot use pages lower or equal to 0.`);
					return message.channel.send({ embeds: [pageZero] });
				} else if (args[0] > Math.ceil(results.rowCount / 7) && results.rows[0] !== undefined) {
					const listCommand = new MessageEmbed().setColor(botYellow).setTitle('WatchLyst - Listed Users');
					if (results.rowCount > 7) {
						results.rows.slice((Math.ceil(results.rowCount / 7) - 1) * 7, (Math.ceil(results.rowCount / 7) - 1) * 7 + 7).forEach((row) =>
							listCommand.fields.push({
								name: `User ID: ${row.user_id} | Added by: ${row.added_by}`,
								value: `${row.reason} - Listed at ${format(row.date_added, 'MMM dd yyyy')}`
							})
						);
						listCommand.setFooter(`Page ${Math.ceil(results.rowCount / 7)} / ${Math.ceil(results.rowCount / 7)}`);
						return message.channel.send({ embeds: [listCommand] });
					} else if (results.rowCount <= 7) {
						results.rows.forEach((row) =>
							listCommand.fields.push({ name: `User ID: ${row.user_id} | Added by: ${row.added_by}`, value: `${row.reason} - Listed at ${format(row.date_added, 'MMM dd yyyy')}` })
						);
						return message.channel.send({ embeds: [listCommand] });
					}
					// User has provided a valid page number
				} else if (args[0] !== undefined) {
					// Check if the server's WatchLyst has any users
					if (results.rows[0] === undefined) {
						const noUsers = new MessageEmbed().setColor(botYellow).setDescription(`${Emoji.Info} There are no users listed in the server's WatchLyst.`);
						return message.channel.send({ embeds: [noUsers] });
						// If users are listed, displays them
					} else if (results.rows[0] !== undefined) {
						const listCommand = new MessageEmbed().setColor(botYellow).setTitle('WatchLyst - Listed Users');
						if (results.rowCount > 7) {
							results.rows.slice((args[0] - 1) * 7, (args[0] - 1) * 7 + 7).forEach((row) =>
								listCommand.fields.push({
									name: `User ID: ${row.user_id} | Added by: ${row.added_by}`,
									value: `${row.reason} - Listed at ${format(row.date_added, 'MMM dd yyyy')}`
								})
							);
							listCommand.setFooter(`Page ${parseInt(args[0])} / ${Math.ceil(results.rowCount / 7)}`);
							return message.channel.send({ embeds: [listCommand] });
						} else if (results.rowCount <= 7) {
							results.rows.forEach((row) =>
								listCommand.fields.push({ name: `User ID: ${row.user_id} | Added by: ${row.added_by}`, value: `${row.reason} - Listed at ${format(row.date_added, 'MMM dd yyyy')}` })
							);
							return message.channel.send({ embeds: [listCommand] });
						}
					}
				}
			} catch (ex) {
				const exceptionOccurred = new MessageEmbed()
					.setColor(botRed)
					.setDescription(
						`${Emoji.Error} Error: Something went wrong when trying to display a list. Contact ${author} or open a new issue at the ${Emoji.GitHub} [GitHub](${PackageJson.bugs.url}). \n\`${ex}\``
					);
				message.channel.send({ embeds: [exceptionOccurred] });
			} finally {
				client.release();
			}
		}
	}
};