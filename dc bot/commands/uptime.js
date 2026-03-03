const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Megmutatja, mióta fut a bot'),

  async execute(interaction) {
    const totalSeconds = process.uptime();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const uptimeEmbed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle('🕒 Bot futási ideje')
      .setDescription(`A bot **${hours} óra**, **${minutes} perc**, **${seconds} másodperce** fut.`)
      .setTimestamp();

    await interaction.reply({ embeds: [uptimeEmbed] });
  },
};
