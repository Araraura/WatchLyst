const { MessageEmbed, Permissions } = require('discord.js');
const { user, password, host, port, database } = require('../database-info');
const { prefix, author, botGreen, botRed } = require('../watchlyst-config.json');
const { Emoji } = require('../emojis.json');
const { Pool } = require('pg');
const PackageJson = require('../package.json');

module.exports = {
	name: 'channel',
	description: 'Receives a channel ID in which WatchLyst will notify when a listed user joins the server',
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
				// Check if the Channel ID isn't 18 characters long, or if it contains non-digit characters
				if (args[0].length !== 18 || /\D/.test(args[0])) {
					const invalidID = new MessageEmbed()
						.setColor(botRed)
						.setDescription(`${Emoji.Error} Error: Channel IDs must consist of 18 digits (Type \`${prefix} setup\` for list of setup commands).`);
					return message.channel.send({ embeds: [invalidID] });
					// Checks if the Channel ID is 18 characters long and updates
				} else if (args[0].length === 18) {
					await client.query('BEGIN');
					await client.query(`UPDATE public.servers SET channel_id = '${args[0]}' WHERE server_id = '${message.guild.id}'`);
					await client.query('COMMIT');
					const channelCommand = new MessageEmbed().setColor(botGreen).setDescription(`${Emoji.Ok} WatchLyst will now notify of listed users in <#${args[0]}>.`);
					message.channel.send({ embeds: [channelCommand] });
					return console.log(`Updated channel (${args[0]}) for server (${message.guild.id})`);
				}
			} catch (ex) {
				const exceptionOccurred = new MessageEmbed()
					.setColor(botRed)
					.setDescription(
						`${Emoji.Error} Error: Something went wrong when setting up a channel. Contact ${author} or open a new issue at the ${Emoji.GitHub} [GitHub](${PackageJson.bugs.url}). \n\`${ex}\``
					);
				message.channel.send({ embeds: [exceptionOccurred] });
				return await client.query('ROLLBACK');
			} finally {
				client.release();
			}
		}
	}
};