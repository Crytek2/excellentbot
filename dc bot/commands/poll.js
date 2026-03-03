const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Egyszerű szavazás létrehozása')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('A szavazás kérdése')
        .setRequired(true)
    ),

  async execute(interaction) {
    const question = interaction.options.getString('question');

    await interaction.reply(`📊 **Szavazás:** ${question}`);
    const pollMessage = await interaction.fetchReply();

    await pollMessage.react('👍');
    await pollMessage.react('👎');
  },
};

