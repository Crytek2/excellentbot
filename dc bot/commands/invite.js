const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Bot meghívó link"),

  async execute(interaction) {

    const clientId = interaction.client.user.id;

    const inviteURL = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;

    await interaction.reply({
      content: `🔗 Meghívó link:\n${inviteURL}`,
      ephemeral: true
    });
  }
};
