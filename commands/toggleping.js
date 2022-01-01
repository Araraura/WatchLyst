const { MessageEmbed, Permissions } = require('discord.js');
const { user, password, host, port, database } = require('../database-info');
const { author, botYellow, botRed } = require('../watchlyst-config.json');
const { Emoji } = require('../emojis.json');
const { Pool } = require('pg');
const PackageJson = require('../package.json');

module.exports = {
	name: 'toggleping',
	description: "Toggle whether or not the server's assigned role will be pinged once a listed user joins the server",
	guildOnly: true,
	aliases: ['ping', 'pingtoggle', 'toggle_ping', 'ping_toggle'],
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
			try {
				const results = await client.query(`SELECT toggle_ping FROM public.servers WHERE server_id = '${message.guild.id}'`);
				// Changes between ping or not ping role depending on current state
				if (!results.rows[0].toggle_ping) {
					await client.query('BEGIN');
					await client.query(`UPDATE public.servers SET toggle_ping = TRUE WHERE server_id = '${message.guild.id}'`);
					await client.query('COMMIT');
					const toggleResult = new MessageEmbed().setColor(botYellow).setDescription(`${Emoji.Info} WatchLyst will ping the assigned role when a listed user joins.`);
					message.channel.send({ embeds: [toggleResult] });
					return console.log(`Toggled role ping to (TRUE) for server ${message.guild.id}`);
				} else if (results.rows[0].toggle_ping) {
					await client.query('BEGIN');
					await client.query(`UPDATE public.servers SET toggle_ping = FALSE WHERE server_id = '${message.guild.id}'`);
					await client.query('COMMIT');
					const toggleResult = new MessageEmbed().setColor(botYellow).setDescription(`${Emoji.Info} WatchLyst will no longer ping the assigned role when a user joins.`);
					message.channel.send({ embeds: [toggleResult] });
					return console.log(`Toggled role ping to (FALSE) for server (${message.guild.id})`);
				}
			} catch (ex) {
				const exceptionOccurred = new MessageEmbed()
					.setColor(botRed)
					.setDescription(
						`${Emoji.Error} Error: Something went wrong when toggling a role ping. Contact ${author} or open a new issue at the ${Emoji.GitHub} [GitHub](${PackageJson.bugs.url}). \n\`${ex}\``
					);
				message.channel.send({ embeds: [exceptionOccurred] });
				return await client.query('ROLLBACK');
			} finally {
				client.release();
			}
		}
	}
};