const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Megmutatja a szerver információkat'),

  async execute(interaction) {
    const guild = interaction.guild;
    if (!guild) return interaction.reply('Ez a parancs csak szervereken használható.');

    await interaction.reply({
      embeds: [{
        title: `${guild.name} információk`,
        fields: [
          { name: 'ID', value: guild.id, inline: true },
          { name: 'Tulajdonos', value: `<@${guild.ownerId}>`, inline: true },
          { name: 'Tagok száma', value: `${guild.memberCount}`, inline: true },
          { name: 'Létrehozva', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true }
        ],
        color: 0x0099ff,
      }],
    });
  },
};
