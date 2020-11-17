const Discord = require('discord.js');
const { user, password, host, port, database } = require('../database-info');
const { author } = require('../watchlyst-config.json');
const { Pool } = require('pg');
const { format } = require('date-fns');

module.exports = {
    name: 'list',
    description: "Displays a list of all of the server's listed users",
    guildOnly: true,
    aliases: ['lyst, watchlyst'],
    async execute(message, args) {
        const pool = new Pool({
            user: user,
            password: password,
            host: host,
            port: port,
            database: database,
        });

        const client = await pool.connect();
        const permissionCheck = await client.query(`SELECT role_id FROM public.servers WHERE server_id = '${message.guild.id}'`);
        if (!message.member.hasPermission('ADMINISTRATOR') && !message.member.roles.cache.has(permissionCheck.rows[0].role_id)) {
            const noPermission = new Discord.MessageEmbed().setColor('#e86b6b').setDescription(`Error: You don't have permission to use this.`);
            return message.channel.send(noPermission);
        } else if (message.member.hasPermission('ADMINISTRATOR') || message.member.roles.cache.has(permissionCheck.rows[0].role_id)) {
            try {
                // await client.connect();
                const results = await client.query(`SELECT user_id, date_added, reason, added_by FROM public.user_list WHERE server_id = '${message.guild.id}'`);
                // Check if the server's WatchLyst has any users
                if (results.rows[0] === undefined) {
                    const noUsers = new Discord.MessageEmbed().setColor('#ea9a00').setDescription("There are no users listed in the server's WatchLyst.");
                    return message.channel.send(noUsers);
                    // If users are listed, display all of them
                } else if (results.rows[0] !== undefined) {
                    const listCommand = new Discord.MessageEmbed().setColor('#ea9a00').setTitle('WatchLyst - Listed Users');
                    results.rows.forEach((row) =>
                        listCommand.fields.push({ name: `User ID: ${row.user_id} | Added by: ${row.added_by}`, value: `${row.reason} - Listed at ${format(row.date_added, 'MMM dd yyyy')}` })
                    );
                    return message.channel.send(listCommand);
                }
            } catch (ex) {
                const exceptionOccured = new Discord.MessageEmbed().setColor('#e86b6b').setDescription(`Error: Something went wrong when bringing up a list. Contact ${author} for help. \`${ex}\``);
                message.channel.send(exceptionOccured);
            } finally {
                client.release();
                console.log('Client disconnected successfully (List)');
            }
        }
    },
};
