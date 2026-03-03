const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Javaslat beküldése egy csatornába')
    .addStringOption(option =>
      option.setName('suggestion')
        .setDescription('A javaslatod')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('A csatorna, ahová a javaslatot küldjük')
        .setRequired(true)
    ),

  async execute(interaction) {
    const suggestion = interaction.options.getString('suggestion');
    const channel = interaction.options.getChannel('channel');

    if (!channel.isTextBased()) {
      return interaction.reply({ content: 'Kérlek, adj meg egy szöveges csatornát!', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('Új javaslat')
      .setDescription(suggestion)
      .setColor('Green')
      .setFooter({ text: `Javaslatot küldte: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: 'Köszönjük a javaslatodat!', ephemeral: true });
  },
};
