const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const xpManager = require("../shared/xpManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Top 10 szerver XP ranglista"),

  async execute(interaction) {

    const leaderboard = xpManager.getLeaderboard(interaction.guild.id);

    if (!leaderboard.length) {
      return interaction.reply("Nincs még adat.");
    }

    let description = "";

    for (let i = 0; i < leaderboard.length; i++) {
      const [userId, data] = leaderboard[i];
      description += `**${i + 1}.** <@${userId}> — Level ${data.level} (${data.xp} XP)\n`;
    }

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle("🏆 Leaderboard")
      .setDescription(description)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
