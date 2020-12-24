const Discord = require('discord.js');
const { user, password, host, port, database } = require('../database-info');
const { author } = require('../watchlyst-config.json');
const { Emoji } = require('../emojis.json');
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
            const noPermission = new Discord.MessageEmbed().setColor('#e86b6b').setDescription(`${Emoji.Error} Error: You don't have permission to use this.`);
            return message.channel.send(noPermission).then((msg) => {
                msg.delete({ timeout: 5000 });
            });
        } else if (message.member.hasPermission('ADMINISTRATOR') || message.member.roles.cache.has(permissionCheck.rows[0].role_id)) {
            try {
                const results = await client.query(`SELECT user_id, date_added, reason, added_by FROM public.user_list WHERE server_id = '${message.guild.id}'`);
                // User has not provided a page number
                if (args[0] === undefined) {
                    // Check if the server's WatchLyst has any users
                    if (results.rows[0] === undefined) {
                        const noUsers = new Discord.MessageEmbed().setColor('#ea9a00').setDescription(`${Emoji.Info} There are no users listed in the server's WatchLyst.`);
                        return message.channel.send(noUsers);
                        // If users are listed, displays them
                    } else if (results.rows[0] !== undefined) {
                        const listCommand = new Discord.MessageEmbed().setColor('#ea9a00').setTitle('WatchLyst - Listed Users');
                        if (results.rowCount > 7) {
                            results.rows.slice(0, 7).forEach((row) =>
                                listCommand.fields.push({
                                    name: `User ID: ${row.user_id} | Added by: ${row.added_by}`,
                                    value: `${row.reason} - Listed at ${format(row.date_added, 'MMM dd yyyy')}`,
                                })
                            );
                            listCommand.setFooter(`Page 1 / ${Math.ceil(results.rowCount / 7)}`);
                            return message.channel.send(listCommand);
                        } else if (results.rowCount <= 7) {
                            results.rows.forEach((row) =>
                                listCommand.fields.push({ name: `User ID: ${row.user_id} | Added by: ${row.added_by}`, value: `${row.reason} - Listed at ${format(row.date_added, 'MMM dd yyyy')}` })
                            );
                            return message.channel.send(listCommand);
                        }
                    }
                    // Checks if the page the user has provided is a number
                } else if (/\D/.test(args[0])) {
                    const notANumberPage = new Discord.MessageEmbed()
                        .setColor('#e86b6b')
                        .setDescription(`${Emoji.Error} Error: You either used a character in place of a page number, or you've entered a negative page number.`);
                    return message.channel.send(notANumberPage);
                } else if (args[0] <= 0) {
                    const pageZero = new Discord.MessageEmbed().setColor('#e86b6b').setDescription(`${Emoji.Error} Error: You cannot use pages lower or equal to 0.`);
                    return message.channel.send(pageZero);
                } else if (args[0] > Math.ceil(results.rowCount / 7)) {
                    const pageNumTooBig = new Discord.MessageEmbed()
                        .setColor('#e86b6b')
                        .setDescription(`${Emoji.Error} Error: You provided a page number too big (You can use pages 1 - ${Math.ceil(results.rowCount / 7)}).`);
                    return message.channel.send(pageNumTooBig);
                    // User has provided a valid page number
                } else if (args[0] !== undefined) {
                    // Check if the server's WatchLyst has any users
                    if (results.rows[0] === undefined) {
                        const noUsers = new Discord.MessageEmbed().setColor('#ea9a00').setDescription(`${Emoji.Info} There are no users listed in the server's WatchLyst.`);
                        return message.channel.send(noUsers);
                        // If users are listed, displays them
                    } else if (results.rows[0] !== undefined) {
                        const listCommand = new Discord.MessageEmbed().setColor('#ea9a00').setTitle('WatchLyst - Listed Users');
                        if (results.rowCount > 7) {
                            results.rows.slice((args[0] - 1) * 7, (args[0] - 1) * 7 + 7).forEach((row) =>
                                listCommand.fields.push({
                                    name: `User ID: ${row.user_id} | Added by: ${row.added_by}`,
                                    value: `${row.reason} - Listed at ${format(row.date_added, 'MMM dd yyyy')}`,
                                })
                            );
                            listCommand.setFooter(`Page ${args[0]} / ${Math.ceil(results.rowCount / 7)}`);
                            return message.channel.send(listCommand);
                        } else if (results.rowCount <= 7) {
                            results.rows.forEach((row) =>
                                listCommand.fields.push({ name: `User ID: ${row.user_id} | Added by: ${row.added_by}`, value: `${row.reason} - Listed at ${format(row.date_added, 'MMM dd yyyy')}` })
                            );
                            return message.channel.send(listCommand);
                        }
                    }
                }
            } catch (ex) {
                const exceptionOccured = new Discord.MessageEmbed()
                    .setColor('#e86b6b')
                    .setDescription(`${Emoji.Error} Error: Something went wrong when bringing up a list. Contact ${author} for help. \`${ex}\``);
                message.channel.send(exceptionOccured);
            } finally {
                client.release();
                console.log('Client disconnected successfully (List)');
            }
        }
    },
};
