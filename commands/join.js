const { SlashCommandBuilder } = require('discord.js');
const {
    joinVoiceChannel,
    VoiceConnectionStatus,
    entersState
} = require('@discordjs/voice');

module.exports = (client) => {
    const joinCommand = {
        data: new SlashCommandBuilder()
            .setName('join')
            .setDescription('join the voice channel'),

        async execute(interaction) {
            console.log('收到 /join 指令！使用者：', interaction.user.tag);
            console.log('使用者是否在語音頻道：', !!interaction.member.voice.channel);

            await interaction.deferReply({ ephemeral: true })

            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) return interaction.reply('join first');

            let connection;
            try {
                if (client.activeConnections.has(interaction.guild.id)) {
                    client.activeConnections.get(interaction.guild.id).destroy();
                    client.activeConnections.delete(interaction.guild.id);
                }

                connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                    selfDeaf: false,
                    selfMute: false,
                });

                console.log('已呼叫 joinVoiceChannel，狀態：', connection.state.status);

                // 不等待 Ready，直接記錄連線
                client.activeConnections.set(interaction.guild.id, connection);

                await interaction.editReply('joining. status:' + connection.state.status + '）');

                // 背景監聽狀態變化（debug 用）
                connection.on('stateChange', (oldState, newState) => {
                    console.log(`狀態變化: ${oldState.status} → ${newState.status}`);
                });

                // 斷線自動清理
                connection.on(VoiceConnectionStatus.Disconnected, () => {
                    client.activeConnections.delete(interaction.guild.id);
                    console.log('斷線，已清理 Map');
                });

                // 可選：10 秒後檢查是否真的 Ready
                setTimeout(() => {
                    console.log('10 秒後最終狀態：', connection.state.status);
                    if (connection.state.status === VoiceConnectionStatus.Destroyed) {
                        console.log('連線已銷毀');
                    }
                }, 10000);
            } catch (err) {
                if (connection) connection.destroy();
                console.log('加入失敗完整錯誤:', err);
                await interaction.editReply('failed');
            }
        },
    }
    if (client.commands) {
        client.commands.set(joinCommand.data.name, joinCommand);
    }
}