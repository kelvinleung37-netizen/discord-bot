const { SlashCommandBuilder } = require('discord.js');

module.exports = (client) => {
    const leaveCommand = {
        data: new SlashCommandBuilder()
            .setName('leave')
            .setDescription('leave the voice channel'),

        async execute(interaction) {
            const connection = client.activeConnections?.get(interaction.guild.id);

            if (connection) {
                try {
                    connection.destroy();
                    client.activeConnections.delete(interaction.guild.id);
                } catch (error) {
                    console.error('slash /leave 失敗:', error);
                }
            } else {
                await interaction.reply({ content: 'not in voice channel currently!' });
            }
        },
    };

    if (client.commands) {
        client.commands.set(leaveCommand.data.name, leaveCommand);
    }
}
