const { MessageEmbed } = require('discord.js');
const { user, password, host, port, database } = require('../database-info');
const { prefix, author, botYellow } = require('../watchlyst-config.json');
const { Emoji } = require('../emojis.json');
const { Pool } = require('pg');
const { format } = require('date-fns');
const PackageJson = require('../package.json');

module.exports = {
	name: 'notify',
	description: 'When a new user joins the server, WatchLyst will search its database and notify if the new user is listed',
	guildOnly: true,
	async execute(guildMember) {
		const pool = new Pool({
			user: user,
			password: password,
			host: host,
			port: port,
			database: database
		});

		const client = await pool.connect();
		try {
			const results = await client.query(`SELECT user_id FROM public.user_list WHERE server_id = '${guildMember.guild.id}' AND user_id = '${guildMember.user.id}'`);
			const userNotify = await client.query(
				`SELECT user_id, date_added, reason, added_by FROM public.user_list WHERE server_id = '${guildMember.guild.id}' AND user_id = '${guildMember.user.id}'`
			);
			// Runs if a listed user joins the server
			if (results.rows[0] === undefined) {
				return;
			} else if (results.rows !== undefined) {
				const notifyServer = await client.query(`SELECT server_id, channel_id, role_id, toggle_ping FROM public.servers WHERE server_id = '${guildMember.guild.id}'`);
				// If a server has an assigned channel, sends there
				if (notifyServer.rows[0].channel_id !== null) {
					const notify = new MessageEmbed()
						.setColor(botYellow)
						.setTitle(`Warning - ID ${userNotify.rows[0].user_id} has joined the server.`)
						.setDescription(`${userNotify.rows[0].reason} | Listed at ${format(userNotify.rows[0].date_added, 'MMM dd yyyy')} | Listed by ${userNotify.rows[0].added_by}`);
					// If a server has an assigned role and the channel it's sending in isn't deleted and toggle ping is on, pings it
					if (notifyServer.rows[0].role_id !== null && guildMember.guild.channels.cache.get(notifyServer.rows[0].channel_id) !== undefined && notifyServer.rows[0].toggle_ping) {
						guildMember.guild.channels.cache.get(notifyServer.rows[0].channel_id).send({ content: `WatchLyst notification - <@&${notifyServer.rows[0].role_id}>` });
					}
					// If the assigned channel has been deleted
					if (guildMember.guild.channels.cache.get(notifyServer.rows[0].channel_id) === undefined) {
						notify.setFooter({
							text: `The channel assigned to WatchLyst has been deleted. Please assign a new channel using \`${prefix} channel <Channel ID>\``,
							iconURL: 'https://cdn.discordapp.com/emojis/779714125282148362.png'
						});
						return guildMember.guild.members.fetch(guildMember.guild.ownerId).then((ownerId) => ownerId.send({ embeds: [notify] }));
					}
					return guildMember.guild.channels.cache.get(notifyServer.rows[0].channel_id).send({ embeds: [notify] });
					// If a server doesn't have an assigned channel, notifies the server's owner instead.
				} else if (notifyServer.rows[0].channel_id === null) {
					const notify = new MessageEmbed()
						.setColor(botYellow)
						.setTitle(`Warning - ID ${userNotify.rows[0].user_id} has joined the server.`)
						.setDescription(`${userNotify.rows[0].reason} | Listed at ${format(userNotify.rows[0].date_added, 'MMM dd yyyy')} | Listed by ${userNotify.rows[0].added_by}`)
						.setFooter({
							text: `Instead of receiving these warnings in direct messages, you can receive them in an assigned channel in your server by using \`${prefix} channel <Channel ID>\`.`,
							iconURL: 'https://cdn.discordapp.com/emojis/779714125282148362.png'
						});
					return guildMember.guild.members.fetch(guildMember.guild.ownerId).then((ownerId) => ownerId.send({ embeds: [notify] }));
				}
			}
		} catch (ex) {
			return guildMember.guild.members.fetch(guildMember.guild.ownerId).then((ownerId) =>
				ownerId.send({
					content: `${Emoji.Error} An error occurred when trying to notify of a listed user. If the error persist, contact ${author} or open a new issue at the ${Emoji.GitHub} [GitHub](${PackageJson.bugs.url}). \n\`${ex}\``
				})
			);
		} finally {
			client.release();
		}
	}
};