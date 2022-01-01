const { user, password, host, port, database } = require('../database-info');
const { prefix, inviteLink, author } = require('../watchlyst-config.json');
const { Emoji } = require('../emojis.json');
const { Pool } = require('pg');
const PackageJson = require('../package.json');

module.exports = {
	name: 'newserver',
	description: 'Adds a new server ID to the database the first time WatchLyst joins it',
	guildOnly: true,
	async execute(guild) {
		const pool = new Pool({
			user: user,
			password: password,
			host: host,
			port: port,
			database: database
		});

		guild.members.fetch(guild.ownerId).then((ownerId) =>
			ownerId.send({
				content: `Thank you for adding WatchLyst to ${guild.name}! Make sure to use \`${prefix} help\` and \`${prefix} setup\` in the server. Please note that if you do not assign a channel to the bot, you will receive a direct message when a listed user joins.`
			})
		);
		const client = await pool.connect();
		try {
			await client.query('BEGIN');
			const results = await client.query(`SELECT server_id FROM public.servers WHERE server_id = '${guild.id}'`);
			if (results.rows[0] === undefined) {
				await client.query('BEGIN');
				await client.query(`INSERT INTO public.servers (server_id, toggle_ping) VALUES ('${guild.id}', FALSE)`);
			}
			await client.query('COMMIT');
			return console.log(`Added a new server (${guild.id})`);
		} catch (ex) {
			return guild.members
				.fetch(guild.ownerId)
				.then((ownerId) =>
					ownerId.send({
						content: `An error occurred when WatchLyst tried to join ${guild.name}, please kick WatchLyst from the server and [reinvite it](${inviteLink}). If the error persist, contact ${author} or open a new issue at the ${Emoji.GitHub} [GitHub](${PackageJson.bugs.url}). \n\`${ex}\``
					})
				);
		} finally {
			client.release();
		}
	}
};