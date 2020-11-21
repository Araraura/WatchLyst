const Discord = require('discord.js');
const { user, password, host, port, database } = require('../database-info');
const { author } = require('../watchlyst-config.json');
const { Emoji } = require('../emojis.json');
const { Pool } = require('pg');
const { format } = require('date-fns');

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
            database: database,
        });

        const client = await pool.connect();
        try {
            const results = await client.query(`SELECT user_id FROM public.user_list WHERE server_id = '${guildMember.guild.id}' AND user_id = '${guildMember.user.id}'`);
            const userNotify = await client.query(
                `SELECT user_id, date_added, reason, added_by FROM public.user_list WHERE server_id = '${guildMember.guild.id}' AND user_id = '${guildMember.user.id}'`
            );
            // Runs if a listed user joins the server
            if (results.rows[0] === undefined) return;
            else if (results.rows !== undefined) {
                const notifyServer = await client.query(`SELECT server_id, channel_id, role_id, toggle_ping FROM public.servers WHERE server_id = '${guildMember.guild.id}'`);
                // If a server has an assigned channel, sends there
                if (notifyServer.rows[0].channel_id !== null) {
                    const notify = new Discord.MessageEmbed()
                        .setColor('#ea9a00')
                        .setTitle(`Warning - ID ${userNotify.rows[0].user_id} has joined the server.`)
                        .setDescription(`${userNotify.rows[0].reason} | Listed at ${format(userNotify.rows[0].date_added, 'MMM dd yyyy')} | Listed by ${userNotify.rows[0].added_by}`);
                    // If a server has an assigned role and the channel it's sending in isn't deleted and toggle ping is on, pings it
                    if (notifyServer.rows[0].role_id !== null && guildMember.guild.channels.cache.get(notifyServer.rows[0].channel_id) !== undefined && notifyServer.rows[0].toggle_ping) {
                        guildMember.guild.channels.cache.get(notifyServer.rows[0].channel_id).send(`<@&${notifyServer.rows[0].role_id}> - WatchLyst notification`);
                    }
                    // If the assigned channel has been deleted
                    if (guildMember.guild.channels.cache.get(notifyServer.rows[0].channel_id) === undefined) {
                        notify.setFooter(
                            `The channel assigned to WatchLyst has been deleted. Please assign a new channel using !w channel <channel_id>`,
                            'https://cdn.discordapp.com/attachments/765286588636725300/778214146130313247/info.png'
                        );
                        return guildMember.guild.members.fetch(guildMember.guild.ownerID).then((ownerID) => ownerID.send(notify));
                    }
                    guildMember.guild.channels.cache.get(notifyServer.rows[0].channel_id).send(notify);
                    // If a server doesn't have an assigned channel, notifies the server's owner instead.
                } else if (notifyServer.rows[0].channel_id === null) {
                    const notify = new Discord.MessageEmbed()
                        .setColor('#ea9a00')
                        .setTitle(`Warning - ID ${userNotify.rows[0].user_id} has joined the server.`)
                        .setDescription(`${userNotify.rows[0].reason} | Listed at ${format(userNotify.rows[0].date_added, 'MMM dd yyyy')} | Listed by ${userNotify.rows[0].added_by}`)
                        .setFooter(
                            `By the way, we recommend that you'd set up a channel for user notifications to be sent in your server \`!w setup\``,
                            'https://cdn.discordapp.com/attachments/765286588636725300/778214146130313247/info.png'
                        );
                    guildMember.guild.members.fetch(guildMember.guild.ownerID).then((ownerID) => ownerID.send(notify));
                }
            }
            console.log(`Notified a server (${guildMember.id})`);
        } catch (ex) {
            guildMember.guild.members
                .fetch(guildMember.guild.ownerID)
                .then((ownerID) => ownerID.send(`${Emoji.Error} An error occured when trying to notify of a listed user. If the error persist, contact ${author} for help. \`${ex}\``));
            return console.log(ex);
        } finally {
            client.release();
        }
    },
};
