// index.js
require('dotenv').config();
const { Client, GatewayIntentBits, Events, Collection } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
	console.error('');
	process.exit(1);
}

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

client.activeConnections = new Map();
client.commands = new Collection();

const functionModules = {
	knifeShield: './events/knifeShield',
	leave: './commands/leave',
	join: './commands/join',
	soundEffect: './events/soundEffect',
	grok: './events/grok'
};

Object.entries(functionModules).forEach(([name, path]) => {
	try {
		const module = require(path);
		module(client);
		console.log(`載入模組成功: ${name}`);
	} catch (err) {
		console.error(`載入 ${name} 失敗:`, err.message);
	}
});

client.once(Events.ClientReady, async () => {
	console.log(`Bot 已上線！Logged in as ${client.user.tag}`);
	const guildId = '802121022911283210';
	const commands = client.commands.map(cmd => cmd.data.toJSON());
	try {
		await client.application.commands.set(commands);
	} catch (err) {
		console.error('註冊 commands 失敗:', err);
	}
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`找不到指令: ${interaction.commandName}`);
		return
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (!interaction.replied && !interaction.deferred) {
			await console.log("error")
		}
	}
});

client.login(TOKEN);

process.once('SIGINT', () => client.destroy());
process.once('SIGTERM', () => client.destroy());