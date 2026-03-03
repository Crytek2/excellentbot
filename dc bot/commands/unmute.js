const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Felhasználó némításának feloldása')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('A némítás feloldandó felhasználó')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: 'Nincs jogosultságod tagok némítását feloldani.', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id);

    if (!member.isCommunicationDisabled()) {
      return interaction.reply({ content: `${user.tag} nincs némítva.`, ephemeral: true });
    }

    try {
      await member.timeout(null, `Némítás feloldva: ${interaction.user.tag}`);
      await interaction.reply({ content: `${user.tag} némítása feloldva.` });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Nem tudtam feloldani a némítást. Ellenőrizd a bot jogosultságait.', ephemeral: true });
    }
  },
};
