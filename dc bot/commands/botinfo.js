const { SlashCommandBuilder } = require('discord.js');
const os = require('os');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Bot statisztikákat mutat'),

  async execute(interaction) {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

    await interaction.reply({
      embeds: [{
        title: 'Bot információk',
        fields: [
          { name: 'Memóriahasználat', value: `${memoryUsage.toFixed(2)} MB`, inline: true },
          { name: 'Futási idő', value: `${Math.floor(uptime)} másodperc`, inline: true },
          { name: 'CPU magok száma', value: `${os.cpus().length}`, inline: true },
          { name: 'Platform', value: os.platform(), inline: true },
        ],
        color: 0x00ff00,
      }],
    });
  },
};
