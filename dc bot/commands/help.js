const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Megjeleníti a parancsok listáját'),

  async execute(interaction) {
    const commands = interaction.client.commands.map(cmd => `/${cmd.data.name} - ${cmd.data.description}`).join('\n');

    await interaction.reply({
      embeds: [{
        title: 'Elérhető parancsok',
        description: commands,
        color: 0xffff00,
      }],
      ephemeral: true, // csak a kérdező látja
    });
  },
};
