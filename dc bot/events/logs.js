console.log("Logs event loaded");
const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "../../shared/config.json");

function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

module.exports = {
  name: "messageDelete",

  async execute(message) {
    if (!message.guild) return;
    if (message.author?.bot) return;

    const config = readConfig();
    const guildConfig = config[message.guild.id];

    if (!guildConfig?.logsEnabled) return;
    if (!guildConfig?.logsChannel) return;

    const channel = message.guild.channels.cache.get(guildConfig.logsChannel);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle("🗑️ Message Deleted")
      .setColor("Red")
      .addFields(
        { name: "User", value: message.author.tag, inline: true },
        { name: "Channel", value: `<#${message.channel.id}>`, inline: true },
        { name: "Content", value: message.content || "No text" }
      )
      .setTimestamp();

    channel.send({ embeds: [embed] });
  }
};
