const {
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const configManager = require("./configManager");

let client;

/* =========================
   INIT
========================= */
function init(botClient) {
  client = botClient;
}

/* =========================
   DEPLOY PANEL
========================= */
async function deployPanel(guildId) {

  if (!client) throw new Error("Client not initialized");

  const guild = client.guilds.cache.get(guildId);
  if (!guild) throw new Error("Guild not found");

  const config = configManager.getGuildConfig(guildId);
  const ticketConfig = config.ticket;

  if (!ticketConfig || ticketConfig.enabled !== true) {
    throw new Error("Ticket system disabled");
  }

  const channel = guild.channels.cache.get(ticketConfig.panelChannelId);
  if (!channel) throw new Error("Panel channel not found");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_open")
      .setLabel(ticketConfig.button || "Open Ticket")
      .setStyle(ButtonStyle.Primary)
  );

  const embed = new EmbedBuilder()
    .setColor("Blue")
    .setTitle(ticketConfig.title || "🎫 Support")
    .setDescription(ticketConfig.description || "Click the button to open a ticket.")
    .setTimestamp();

  await channel.send({
    embeds: [embed],
    components: [row]
  });

}

/* =========================
   OPEN TICKET
========================= */

async function openTicket(interaction) {

  const guildConfig = configManager.getGuildConfig(interaction.guild.id);
  const ticketConfig = guildConfig.ticket;

  if (!ticketConfig || ticketConfig.enabled !== true) {
    return interaction.reply({
      content: "Ticket system disabled.",
      ephemeral: true
    });
  }

  const existing = interaction.guild.channels.cache.filter(c =>
    c.name === `ticket-${interaction.user.id}`
  );

  if (existing.size >= (ticketConfig.maxPerUser || 1)) {
    return interaction.reply({
      content: "⛔ You already have an open ticket.",
      ephemeral: true
    });
  }

  const ticketChannel = await interaction.guild.channels.create({
    name: `ticket-${interaction.user.id}`,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages
        ],
      },
      {
        id: ticketConfig.supportRoleId,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages
        ],
      },
    ],
  });

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_close")
      .setLabel("🔒 Close Ticket")
      .setStyle(ButtonStyle.Danger)
  );

  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle("🎫 Ticket Opened")
    .setDescription(`Hello ${interaction.user}, support will help you soon.`)
    .setTimestamp();

  await ticketChannel.send({
    content: `<@${interaction.user.id}> <@&${ticketConfig.supportRoleId}>`,
    embeds: [embed],
    components: [closeRow]
  });

  await interaction.reply({
    content: `✅ Ticket created: ${ticketChannel}`,
    ephemeral: true
  });
}

/* =========================
   CLOSE TICKET
========================= */

async function closeTicket(interaction) {

  if (!interaction.channel.name.startsWith("ticket-"))
    return interaction.reply({
      content: "This is not a ticket channel.",
      ephemeral: true
    });

  await interaction.reply({
    content: "🔒 Ticket closing in 3 seconds...",
    ephemeral: true
  });

  setTimeout(() => {
    interaction.channel.delete().catch(() => {});
  }, 3000);
}

module.exports = {
  init,
  deployPanel,
  openTicket,
  closeTicket
};


