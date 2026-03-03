const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Információk megtekintése egy felhasználóról')
    .addUserOption(option =>
      option.setName('felhasználó')
        .setDescription('A felhasználó, akiről az infót kéred')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('felhasználó') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);

    const embed = new EmbedBuilder()
      .setTitle(`Felhasználói adatok: ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Felhasználónév', value: user.username, inline: true },
        { name: 'Felhasználó ID', value: user.id, inline: true },
        { name: 'Csatlakozás időpontja (szerverhez)', value: member.joinedAt.toLocaleDateString('hu-HU'), inline: true },
        { name: 'Fiók létrehozásának dátuma', value: user.createdAt.toLocaleDateString('hu-HU'), inline: true },
        { name: 'Rangok száma', value: `${member.roles.cache.size - 1}`, inline: true } // -1, mert az @everyone nem számít
      )
      .setColor('Random');

    await interaction.reply({ embeds: [embed] });
  },
};

