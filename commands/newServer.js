const { user, password, host, port, database } = require('../database-info');
const { author } = require('../watchlyst-config.json');
const { Emoji } = require('../emojis.json');
const { Pool } = require('pg');

module.exports = {
    name: 'newServer',
    description: 'When WatchLyst first joins a new server, it gets added to the DB',
    guildOnly: true,
    async execute(guild) {
        const pool = new Pool({
            user: user,
            password: password,
            host: host,
            port: port,
            database: database,
        });

        guild.members
            .fetch(guild.ownerID)
            .then((ownerID) =>
                ownerID.send(
                    "Thank you for adding WatchLyst to your server! Make sure to use `!w help` and `!w setup` in the server. Please note that if you don't assign a channel to the bot, you will be DMed when a troublesome user joins."
                )
            );
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const results = await client.query(`SELECT server_id FROM public.servers WHERE server_id = '${guild.id}'`);
            if (results.rows[0] === undefined) {
                await client.query('BEGIN');
                await client.query(`INSERT INTO public.servers (server_id, toggle_ping) VALUES ('${guild.id}', FALSE)`);
                console.log(`Added new server to DB (${guild.id})`);
            }
            await client.query('COMMIT');
            return console.log(`Added to a new server (${guild.id})`);
        } catch (ex) {
            guild.members
                .fetch(guild.ownerID)
                .then((ownerID) => ownerID.send(`An error occured when joining the server, please reinvite me again. If the error persist, contact ${author} or open a new issue at the ${Emoji.GitHub} [GitHub](https://github.com/Araraura/WatchLyst). \`${ex}\``));
            return console.log(ex);
        } finally {
            client.release();
        }
    },
};
