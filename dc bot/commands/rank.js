const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const xpManager = require("../shared/xpManager");
const createRankCard = require("../shared/rankCard");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Megmutatja a rangodat"),

  async execute(interaction) {

    const data = xpManager.getUser(
      interaction.guild.id,
      interaction.user.id
    );

    const buffer = await createRankCard(
      interaction.member,
      data.xp,
      data.level
    );

    const attachment = new AttachmentBuilder(buffer, { name: "rank.png" });

    await interaction.reply({ files: [attachment] });
  }
};

