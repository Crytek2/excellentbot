const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Bot válaszideje'),

  async execute(interaction) {
    const sent = await interaction.reply({ content: 'Ping...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`🏓 Pong! Válaszidő: ${latency}ms`);
  },
};
