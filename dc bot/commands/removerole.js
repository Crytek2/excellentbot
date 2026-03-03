const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removerole')
    .setDescription('Rang eltávolítása egy felhasználóról')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('A felhasználó, akiről eltávolítjuk a rangot')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Az eltávolítandó rang')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: 'Nincs jogosultságod rangokat kezelni.', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const member = await interaction.guild.members.fetch(user.id);

    if (!member.roles.cache.has(role.id)) {
      return interaction.reply({ content: `${user.tag} nem rendelkezik ezzel a ranggal.`, ephemeral: true });
    }

    try {
      await member.roles.remove(role);
      await interaction.reply({ content: `Sikeresen eltávolítottam a ${role.name} rangot ${user.tag}-ről.` });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Nem tudtam eltávolítani a rangot. Ellenőrizd, hogy a botnak megfelelő jogosultságai vannak.', ephemeral: true });
    }
  },
};
