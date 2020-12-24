const Discord = require('discord.js');
const { user, password, host, port, database } = require('../database-info');
const { author } = require('../watchlyst-config.json');
const { Emoji } = require('../emojis.json');
const { Pool } = require('pg');

module.exports = {
    name: 'add',
    description: "Adds a user to the server's WatchLyst",
    args: true,
    guildOnly: true,
    aliases: ['new'],
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
                // Check if the User ID isn't 18 characters long, or if it contains non-digit characters
                if (args[0].length !== 18 || /\D/.test(args[0])) {
                    const invalidID = new Discord.MessageEmbed()
                        .setColor('#e86b6b')
                        .setDescription(`${Emoji.Error} Error: User IDs must consist of 18 digits (Type \`!w help\` for list of commands).`);
                    return message.channel.send(invalidID);
                    // Checks if the User ID is 18 characters long and no reason for adding was provided
                } else if (args[0].length === 18 && args[1] === undefined) {
                    await client.query('BEGIN');
                    const results = await client.query(`SELECT user_id FROM public.user_list WHERE server_id = '${message.guild.id}' AND user_id = '${args[0]}'`);
                    // If the User isn't in the list, adds it (Without reason)
                    if (results.rows[0] === undefined) {
                        try {
                            const presentUserMessage = new Discord.MessageEmbed().setColor('#e86b6b').setDescription(`${Emoji.Error} Error: <@${args[0]}> is already in the server.`);
                            return await message.guild.members.fetch(args[0]).then((presentUser) => message.channel.send(presentUserMessage));
                        } catch {
                            // Checks if the User is already banned in the server
                            try {
                                await message.guild.fetchBan(args[0]);
                                const userBanned = new Discord.MessageEmbed().setColor('#e86b6b').setDescription(`${Emoji.Error} Error: <@${args[0]}> is already banned in this server.`);
                                return message.channel.send(userBanned);
                            } catch (e) {
                                // Successful insert
                                await client.query(
                                    `INSERT INTO public.user_list (user_id, server_id, date_added, reason, added_by) VALUES ('${args[0]}', '${
                                        message.guild.id
                                    }', current_date, 'No reason provided', '${message.author.tag.replace("'", '’')}')`
                                );
                            }
                        }
                    } else if (results.rows[0] !== undefined) {
                        const userExists = new Discord.MessageEmbed().setColor('#e86b6b').setDescription(`${Emoji.Error} Error: <@${args[0]}> is already in the server's WatchLyst.`);
                        return message.channel.send(userExists);
                    }
                    // Checks if the User to the list if the User ID is 18 characters long and a reason for adding the user was provided
                } else if (args[0].length === 18 && args[1] !== undefined) {
                    let argsJoin = args.slice(1).join(' ');
                    let reason = argsJoin.replace("'", '’');
                    // Gives an error if the reason provided is longer than 512 characters
                    if (reason.length > 512) {
                        const reasonTooLong = new Discord.MessageEmbed().setColor('#e86b6b').setDescription(`${Emoji.Error} Error: Reason for adding cannot be longer than 512 characters.`);
                        return message.channel.send(reasonTooLong);
                    }
                    // Checks if user already exists in the list
                    await client.query('BEGIN');
                    const results = await client.query(`SELECT user_id FROM public.user_list WHERE server_id = '${message.guild.id}' AND user_id = '${args[0]}'`);
                    // If the User isn't in the list, adds it (With reason)
                    if (results.rows[0] === undefined) {
                        // Checks if the user is already in the server
                        try {
                            const presentUserMessage = new Discord.MessageEmbed().setColor('#e86b6b').setDescription(`${Emoji.Error} Error: <@${args[0]}> is already in the server.`);
                            return await message.guild.members.fetch(args[0]).then((presentUser) => message.channel.send(presentUserMessage));
                        } catch (e) {
                            // Checks if the User is already banned in the server
                            try {
                                await message.guild.fetchBan(args[0]);
                                const userBanned = new Discord.MessageEmbed().setColor('#e86b6b').setDescription(`${Emoji.Error} Error: <@${args[0]}> is already banned in this server.`);
                                return message.channel.send(userBanned);
                            } catch (e) {
                                // Successful insert
                                await client.query(
                                    `INSERT INTO public.user_list (user_id, server_id, date_added, reason, added_by) VALUES ('${args[0]}', '${
                                        message.guild.id
                                    }', current_date, '${reason}', '${message.author.tag.replace("'", '’')}')`
                                );
                            }
                        }
                    } else if (results.rows[0] !== undefined) {
                        const userExists = new Discord.MessageEmbed().setColor('#e86b6b').setDescription(`${Emoji.Error} Error: <@${args[0]}> is already in the server's WatchLyst.`);
                        return message.channel.send(userExists);
                    }
                }
                await client.query('COMMIT');
                const addCommand = new Discord.MessageEmbed().setColor('#ea9a00').setDescription(`${Emoji.Ok} <@${args[0]}> has been added to the server's WatchLyst.`);
                return message.channel.send(addCommand);
            } catch (ex) {
                const exceptionOccured = new Discord.MessageEmbed()
                    .setColor('#e86b6b')
                    .setDescription(`${Emoji.Error} Error: Something went wrong when adding a user. Contact ${author} for help. \`${ex}\``);
                message.channel.send(exceptionOccured);
                await client.query('ROLLBACK');
            } finally {
                client.release();
                console.log('Client disconnected successfully (Add)');
            }
        }
    },
};
