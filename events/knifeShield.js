const { Events } = require('discord.js');

module.exports = (client) => {
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) return;

        const text = message.content.toLowerCase();

        if (text.includes('刀盾')) {
            try {
                await message.channel.send({
                    stickers: ['1481421570886074398'],
                });
            } catch (err) {
                console.error('發送 sticker 失敗:', err);
            }
        }

        if (text.includes('陳比利')) {
            message.reply('陳比利是狗');
        }
    });
};