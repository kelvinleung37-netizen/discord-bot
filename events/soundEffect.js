const { Events, VoiceChannel } = require('discord.js');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState
} = require('@discordjs/voice');

const path = require('path');
const SOUND_FILE = path.join(__dirname, '..', 'src', 'knife.mp3');

const KEYWORDS = ['刀盾']; // 可加更多關鍵字

module.exports = (client) => {
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) return;
        if (message.guild === null) return; // 忽略 DM

        const text = message.content.toLowerCase();
        const matched = KEYWORDS.some(kw => text.includes(kw.toLowerCase()));

        if (!matched) return;

        // 取得發言者所在的語音頻道
        const voiceChannel = message.member?.voice?.channel;
        if (!voiceChannel) {
            return
        }

        try {
            let connection = client.activeConnections.get(message.guild.id);

            if (connection) {
                console.log('偵測到舊連線，先銷毀...');
                connection.destroy();
            }

            if (!connection) {
                console.log('開始嘗試加入語音頻道...');
                console.log('joinVoiceChannel 呼叫完成，等待 Ready 狀態...');

                connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                });

                await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
                console.log('連線進入 Ready 狀態！');

                client.activeConnections.set(message.guild.id, connection);

                connection.on(VoiceConnectionStatus.Disconnected, () => {
                    client.activeConnections.delete(message.guild.id);
                });

                const player = createAudioPlayer();
                const resource = createAudioResource(SOUND_FILE, {
                    inlineVolume: true,
                });
                resource.volume.setVolume(0.7);
                connection.subscribe(player);
                player.play(resource);

                player.on(AudioPlayerStatus.Idle, () => {
                    connection.destroy();
                });

                player.on('error', error => {
                    console.error('播放錯誤:', error);
                    console.error('錯誤堆疊:', error.stack);
                    connection.destroy();
                });

            }
        } catch (error) {
            console.error('加入語音或播放失敗:', error);
            message.reply('bug了');
        }
    });
};