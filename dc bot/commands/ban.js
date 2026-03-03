const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Felhasználó kitiltása a szerverről')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('A kitiltandó felhasználó')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Kitiltás oka')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: 'Nincs jogosultságod tagokat kitiltani.', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Nincs megadva';

    try {
      const member = await interaction.guild.members.fetch(user.id);
      await member.ban({ reason });
      await interaction.reply({ content: `${user.tag} kitiltva. Ok: ${reason}` });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Nem tudtam kitiltani a felhasználót. Ellenőrizd a bot jogosultságait.', ephemeral: true });
    }
  },
};
