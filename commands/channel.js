const Discord = require('discord.js');
const { user, password, host, port, database } = require('../database-info');
const { author } = require('../watchlyst-config.json');
const { Emoji } = require('../emojis.json');
const { Pool } = require('pg');

module.exports = {
    name: 'channel',
    description: 'Accepts a channel ID where WatchLyst will notify when a user on the WatchLyst joins the server',
    args: true,
    guildOnly: true,
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
        } else if (message.member.hasPermission('ADMINISTRATOR')) {
            const client = await pool.connect();
            try {
                // Check if the Channel ID isn't 18 characters long, or if it contains non-digit characters
                if (args[0].length !== 18 || /\D/.test(args[0])) {
                    const invalidID = new Discord.MessageEmbed().setColor('#e86b6b').setDescription(`${Emoji.Error} Error: Channel IDs must consist of 18 digits (Type \`!w setup\` for list of setup commands).`);
                    return message.channel.send(invalidID);
                    // Checks if the Channel ID is 18 characters long and updates
                } else if (args[0].length === 18) {
                    await client.query('BEGIN');
                    await client.query(`UPDATE public.servers SET channel_id = '${args[0]}' WHERE server_id = '${message.guild.id}'`);
                    await client.query('COMMIT');
                    const channelCommand = new Discord.MessageEmbed().setColor('#ea9a00').setDescription(`${Emoji.Ok} WatchLyst will now notify of listed users in <#${args[0]}>`);
                    return message.channel.send(channelCommand);
                }
            } catch (ex) {
                const exceptionOccured = new Discord.MessageEmbed().setColor('#e86b6b').setDescription(`${Emoji.Error} Error: Something went wrong when setting up a channel. Contact ${author} for help. \`${ex}\``);
                message.channel.send(exceptionOccured);
                await client.query('ROLLBACK');
            } finally {
                client.release();
                console.log('Client disconnected successfully (Channel)');
            }
        }
    },
};
