const Discord = require('discord.js');

const helpCommand = new Discord.MessageEmbed()
    .setColor('#ea9a00')
    .setTitle('WatchLyst - Server Setup')
    .addFields(
        { name: 'Specify the channel where WatchLyst will notify when a listed user joins the server', value: '`!w channel <channel ID>`' },
        { name: 'Specify a role that WatchLyst will notify when a listed user joins the server (Note that the assign role will be able to use WatchLyst commands)', value: '`!w role <role ID>`' }
    );

module.exports = {
    name: 'setup',
    description: 'Shows a list of server setup commands to the user',
    guildOnly: true,
    execute(message, args) {
        if (!message.member.hasPermission('ADMINISTRATOR')) {
            const noPermission = new Discord.MessageEmbed().setColor('#e86b6b').setDescription(`Error: Only an admin may use this command.`);
            return message.channel.send(noPermission);
        } else if (message.member.hasPermission('ADMINISTRATOR')) {
            return message.channel.send(helpCommand);
        }
    },
};
