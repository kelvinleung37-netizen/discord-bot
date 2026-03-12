const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('test').setDescription('testing'),
	async execute(interaction) {
		await interaction.reply('on9');
	},
};