const Discord = require('discord.js');
const { Emoji } = require('../emojis.json');

const helpCommand = new Discord.MessageEmbed()
    .setColor('#ea9a00')
    .setTitle('WatchLyst - Server Setup')
    .addFields(
        { name: 'Specify the channel where WatchLyst will notify when a listed user joins the server', value: '`!w channel <Channel ID>`' },
        { name: 'Specify a role that will get access to WatchLyst commands (Excluding admin commands)', value: '`!w role <Role ID>`' },
        { name: 'Toggle whether or not the assigned role will be pinged once a listed member joins the server', value: '`!w toggleping`'}
    );

module.exports = {
    name: 'setup',
    description: 'Shows a list of server setup commands to the user',
    guildOnly: true,
    execute(message, args) {
        if (!message.member.hasPermission('ADMINISTRATOR')) {
            const noPermission = new Discord.MessageEmbed().setColor('#e86b6b').setDescription(`${Emoji.Error} Error: Only an admin may use this command.`);
            return message.channel.send(noPermission).then((msg) => {
                msg.delete({ timeout: 5000 });
            });
        } else if (message.member.hasPermission('ADMINISTRATOR')) {
            return message.channel.send(helpCommand);
        }
    },
};
