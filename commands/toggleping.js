const Discord = require('discord.js');
const { user, password, host, port, database } = require('../database-info');
const { author } = require('../watchlyst-config.json');
const { Emoji } = require('../emojis.json');
const { Pool } = require('pg');

module.exports = {
    name: 'toggleping',
    description: 'Toggle whether or not the assigned role will get pinged once a listed member joins the server',
    guildOnly: true,
    aliases: ['ping, pingtoggle, toggle_ping, ping_toggle'],
    async execute(message, args) {
        const pool = new Pool({
            user: user,
            password: password,
            host: host,
            port: port,
            database: database,
        });

        if (!message.member.hasPermission('ADMINISTRATOR')) {
            const noPermission = new Discord.MessageEmbed().setColor('#e86b6b').setDescription(`Error: Only an admin may use this command.`);
            return message.channel.send(noPermission).then((msg) => {
                msg.delete({ timeout: 5000 });
            });
        } else if (message.member.hasPermission('ADMINISTRATOR') || message.member.roles.cache.has(permissionCheck.rows[0].role_id)) {
            const client = await pool.connect();
            try {
                const results = await client.query(`SELECT toggle_ping FROM public.servers WHERE server_id = '${message.guild.id}'`);
                // Changes between ping or not ping role depending on current state
                if (!results.rows[0].toggle_ping) {
                    await client.query('BEGIN');
                    await client.query(`UPDATE public.servers SET toggle_ping = TRUE WHERE server_id = '${message.guild.id}'`);
                    await client.query('COMMIT');
                    const toggleResult = new Discord.MessageEmbed().setColor('#ea9a00').setDescription(`${Emoji.Info} WatchLyst will now ping the assigned role when a listed user joins.`);
                    return message.channel.send(toggleResult);
                } else if (results.rows[0].toggle_ping) {
                    await client.query('BEGIN');
                    await client.query(`UPDATE public.servers SET toggle_ping = FALSE WHERE server_id = '${message.guild.id}'`);
                    await client.query('COMMIT');
                    const toggleResult = new Discord.MessageEmbed().setColor('#ea9a00').setDescription(`${Emoji.Info} WatchLyst will no longer ping the assigned role.`);
                    return message.channel.send(toggleResult);
                }
            } catch (ex) {
                const exceptionOccured = new Discord.MessageEmbed().setColor('#e86b6b').setDescription(`Error: Something went wrong when toggling a role ping. Contact ${author} or open a new issue at the ${Emoji.GitHub} [GitHub](https://github.com/Araraura/WatchLyst). \`${ex}\``);
                message.channel.send(exceptionOccured);
                await client.query('ROLLBACK');
            } finally {
                client.release();
                console.log('Client disconnected successfully (Toggle Ping)');
            }
        }
    },
};
