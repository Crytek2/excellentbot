const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Probléma vagy jelentés beküldése')
    .addStringOption(option =>
      option.setName('issue')
        .setDescription('A probléma vagy jelentés leírása')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('A csatorna, ahová a jelentést küldjük')
        .setRequired(true)
    ),

  async execute(interaction) {
    const issue = interaction.options.getString('issue');
    const channel = interaction.options.getChannel('channel');

    if (!channel.isTextBased()) {
      return interaction.reply({ content: 'Kérlek, adj meg egy szöveges csatornát!', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('Új jelentés')
      .setDescription(issue)
      .setColor('Red')
      .setFooter({ text: `Jelentést küldte: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: 'A jelentésed sikeresen elküldve!', ephemeral: true });
  },
};
