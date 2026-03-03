const { EmbedBuilder } = require("discord.js");

module.exports = {
  create({
    title,
    description,
    color = "#5865F2",
    fields = [],
    footer = "Excellent Bot"
  }) {
    return new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setDescription(description || null)
      .addFields(fields)
      .setFooter({ text: footer })
      .setTimestamp();
  }
};
