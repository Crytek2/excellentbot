const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const xpManager = require("../shared/xpManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription("Megmutatja a szinted"),

  async execute(interaction) {

    const userData = xpManager.getUser(
      interaction.guild.id,
      interaction.user.id
    );

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("📊 Szinted")
      .addFields(
        { name: "Level", value: userData.level.toString(), inline: true },
        { name: "XP", value: userData.xp.toString(), inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};

