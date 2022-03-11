const { MessageEmbed, Permissions } = require('discord.js');
const { user, password, host, port, database } = require('../database-info');
const { author, botGreen, botYellow, botRed } = require('../watchlyst-config.json');
const { Emoji } = require('../emojis.json');
const { Pool } = require('pg');
const PackageJson = require('../package.json');

module.exports = {
	name: 'clearbans',
	description: "Removes all banned users from the server's WatchLyst",
	guildOnly: true,
	aliases: ['clearban', 'removebans', 'deletebans', 'cleanbans', 'cleanban'],
	async execute(message) {
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
			const results = await client.query(`SELECT user_id FROM public.user_list WHERE server_id = '${message.guild.id}'`);
			const banList = await message.guild.bans.fetch();
			try {
				// Check if the server's WatchLyst has any users
				if (results.rows[0] === undefined) {
					const noUsers = new MessageEmbed().setColor(botYellow).setDescription(`${Emoji.Info} There are no users listed in the server's WatchLyst.`);
					return message.channel.send({ embeds: [noUsers] });
					// Checks if the server has any banned users
				} else if (banList.size === 0) {
					const noBannedUsers = new MessageEmbed().setColor(botYellow).setDescription(`${Emoji.Info} This server has no banned users.`);
					return message.channel.send({ embeds: [noBannedUsers] });
					// Removes all the banned users from the server's WatchLyst
				} else {
					let clearedNum = 0;
					results.rows.forEach((listedUser) => {
						const banned = banList.get(listedUser.user_id);
						if (banned !== undefined) {
							client.query(`DELETE FROM public.user_list WHERE server_id = '${message.guild.id}' AND user_id = '${listedUser.user_id}'`);
							clearedNum++;
						}
					});
					if (clearedNum === 0) {
						const noBansCleared = new MessageEmbed().setColor(botYellow).setDescription(`${Emoji.Info} No banned users found in the server's WatchLyst.`);
						return message.channel.send({ embeds: [noBansCleared] });
					} else {
						const bansGotCleared = new MessageEmbed()
							.setColor(botGreen)
							.setDescription(`${Emoji.Ok} ${clearedNum} banned user${clearedNum === 1 ? '' : 's'} have been removed from the server's WatchLyst.`);
						message.channel.send({ embeds: [bansGotCleared] });
						return console.log(`Cleared ${clearedNum} banned user(s) from server (${message.guild.id})`);
					}
				}
			} catch (ex) {
				const exceptionOccurred = new MessageEmbed()
					.setColor(botRed)
					.setDescription(
						`${Emoji.Error} Error: Something went wrong when clearing all the banned users. Contact ${author} or open a new issue at the ${Emoji.GitHub} [GitHub](${PackageJson.bugs.url}). \n\`${ex}\``
					);
				message.channel.send({ embeds: [exceptionOccurred] });
				return await client.query('ROLLBACK');
			} finally {
				client.release();
			}
		}
	}
};