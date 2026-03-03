const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addrole')
    .setDescription('Rang hozzáadása egy felhasználóhoz')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('A felhasználó, akihez hozzáadjuk a rangot')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('A hozzáadandó rang')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: 'Nincs jogosultságod rangokat kezelni.', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const member = await interaction.guild.members.fetch(user.id);

    if (member.roles.cache.has(role.id)) {
      return interaction.reply({ content: `${user.tag} már rendelkezik ezzel a ranggal.`, ephemeral: true });
    }

    try {
      await member.roles.add(role);
      await interaction.reply({ content: `Sikeresen hozzáadtam a ${role.name} rangot ${user.tag}-hez.` });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Nem tudtam hozzáadni a rangot. Ellenőrizd, hogy a botnak megfelelő jogosultságai vannak.', ephemeral: true });
    }
  },
};
