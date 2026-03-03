const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('A bot megismétli az általad megadott üzenetet')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Az üzenet, amit a botnak ki kell írnia')
        .setRequired(true)
    ),

  async execute(interaction) {
    const message = interaction.options.getString('message');
    await interaction.reply({ content: message, ephemeral: false });
  },
};
