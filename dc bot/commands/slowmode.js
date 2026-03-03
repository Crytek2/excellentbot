const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Lassított mód beállítása a csatornában (másodpercben)')
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Lassított mód időtartama másodpercben (0 kikapcsol)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600) // 6 óra max slowmode
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: 'Nincs jogosultságod a csatorna beállításainak módosítására.', ephemeral: true });
    }

    const duration = interaction.options.getInteger('duration');

    try {
      await interaction.channel.setRateLimitPerUser(duration);
      await interaction.reply({ content: `Lassított mód beállítva: ${duration} másodperc.` });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Nem tudtam beállítani a lassított módot.', ephemeral: true });
    }
  },
};
