const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Embed üzenet küldése más csatornába')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('A csatorna, ahová az üzenetet küldeni kell')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Az embed címe')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Az embed szövege')
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');

    if (!channel.isTextBased()) {
      return interaction.reply({ content: 'Kérlek, adj meg egy szöveges csatornát!', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor('Blue');

    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: `Küldve az üzenet a(z) ${channel} csatornába!`, ephemeral: true });
  },
};
