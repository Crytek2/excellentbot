const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Felhasználó kirúgása a szerverről')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('A kirúgandó felhasználó')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Kirúgás oka')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: 'Nincs jogosultságod tagokat kirúgni.', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Nincs megadva';

    try {
      const member = await interaction.guild.members.fetch(user.id);
      await member.kick(reason);
      await interaction.reply({ content: `${user.tag} kirúgva. Ok: ${reason}` });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Nem tudtam kirúgni a felhasználót. Ellenőrizd a bot jogosultságait.', ephemeral: true });
    }
  },
};
