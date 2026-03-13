const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const configManager = require("../../shared/configManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketpanel")
    .setDescription("Kirakja a ticket nyitó panelt a csatornába"),

  async execute(interaction) {

    const guildConfig = configManager.getGuildConfig(interaction.guild.id);
    const ticketConfig = guildConfig.ticket;

    if (!ticketConfig?.enabled) {
      return interaction.reply({
        content: "A ticket rendszer ki van kapcsolva.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor(ticketConfig.panel?.color || "#5865F2")
      .setTitle(ticketConfig.panel?.title || "🎫 Ticket")
      .setDescription(ticketConfig.panel?.description || "Nyiss ticketet az alábbi gombbal!");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_open")
        .setLabel("🎟️ Ticket nyitás")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.channel.send({
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({
      content: "✅ Ticket panel kirakva.",
      ephemeral: true
    });
  }
};
