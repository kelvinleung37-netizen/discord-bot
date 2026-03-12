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

client.commands = new Collection();

const functionModules = {
	knifeShield: './events/knifeShield',
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

// 登入成功
client.once(Events.ClientReady, async () => {
	console.log(`Bot 已上線！Logged in as ${client.user.tag}`);
	const guildId = '802121022911283210';
	// 註冊所有 commands 到 Discord（這裡用 global，開發時可改 guild）
	const commands = client.commands.map(cmd => cmd.data.toJSON());
	try {
		await client.application.commands.set(commands, guildId);
		console.log(`成功註冊 ${commands.length} 個 slash commands`);
	} catch (err) {
		console.error('註冊 commands 失敗:', err);
	}
});

client.login(TOKEN);

process.once('SIGINT', () => client.destroy());
process.once('SIGTERM', () => client.destroy());