const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Felhasználó némítása megadott időre (percben)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('A némítani kívánt felhasználó')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Némítás időtartama percben')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: 'Nincs jogosultságod tagokat némítani.', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('duration');
    const member = await interaction.guild.members.fetch(user.id);

    if (member.isCommunicationDisabled()) {
      return interaction.reply({ content: `${user.tag} már némítva van.`, ephemeral: true });
    }

    try {
      await member.timeout(duration * 60 * 1000, `Némítás parancs által: ${interaction.user.tag}`);
      await interaction.reply({ content: `${user.tag} némítva ${duration} percig.` });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Nem tudtam némítani a felhasználót. Ellenőrizd a bot jogosultságait.', ephemeral: true });
    }
  },
};
