const Discord = require('discord.js');
const { user, password, host, port, database } = require('../database-info');
const { author, authorAvatar } = require('../watchlyst-config.json');
const { Emoji } = require('../emojis.json');
const { Pool } = require('pg');

const helpCommand = new Discord.MessageEmbed()
    .setColor('#ea9a00')
    .setAuthor(`Made by ${author}`, `${authorAvatar}`)
    .setTitle('WatchLyst - List of commands')
    .setDescription('[Version Changelog](https://pastebin.com/raw/wpJD9qC6)')
    .addFields(
        { name: 'Adds a user to the WatchLyst', value: '`!w add <user ID> <reason (Optional, max 1,000 characters)>`' },
        { name: 'Removes a user from the WatchLyst', value: '`!w remove <user ID>`' },
        { name: "Displays a list of users in the server's WatchLyst", value: '`!w list`' },
        { name: 'List of server setup commands (Admin Only)', value: '`!w setup`' }
    )
    .setFooter('Version 1.0.3 | Note: WatchLyst is still in early release. Bugs and missing features may be common.');

module.exports = {
    name: 'help',
    description: 'Help command. Shows a list of commands to the user',
    async execute(message, args) {
        const pool = new Pool({
            user: user,
            password: password,
            host: host,
            port: port,
            database: database,
        });
        const client = await pool.connect();
        if (message.guild === null) {
            helpCommand.setDescription('[Add me to your server!](https://discord.com/oauth2/authorize?client_id=765240772781932555&scope=bot&permissions=84996) • [Version Changelog](https://pastebin.com/raw/wpJD9qC6)');
            return message.channel.send(helpCommand);
        }
        const permissionCheck = await client.query(`SELECT role_id FROM public.servers WHERE server_id = '${message.guild.id}'`);
        if (!message.member.hasPermission('ADMINISTRATOR') && !message.member.roles.cache.has(permissionCheck.rows[0].role_id)) {
            const noPermission = new Discord.MessageEmbed().setColor('#e86b6b').setDescription(`${Emoji.Error} Error: You don't have permission to use this.`);
            return message.channel.send(noPermission).then((msg) => {
                msg.delete({ timeout: 5000 });
            });
        } else if (message.member.hasPermission('ADMINISTRATOR') || message.member.roles.cache.has(permissionCheck.rows[0].role_id)) {
            return message.channel.send(helpCommand);
        }
        client.release();
    },
};
