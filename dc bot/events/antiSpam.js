const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "../../shared/config.json");

const userMessages = new Map();

function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

module.exports = {
  name: "messageCreate",

  async execute(message) {
    if (!message.guild) return;
    if (message.author.bot) return;

    const config = readConfig();
    const guildConfig = config[message.guild.id];
    if (!guildConfig) return;

    if (!guildConfig.moderationEnabled) return;
    if (!guildConfig.antiSpamEnabled) return;

    // Admin bypass
    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const limit = guildConfig.spamLimit || 5;
    const interval = guildConfig.spamInterval || 5000;
    const timeoutDuration = guildConfig.spamTimeout || 600000;

    const now = Date.now();

    if (!userMessages.has(message.author.id)) {
      userMessages.set(message.author.id, []);
    }

    const timestamps = userMessages.get(message.author.id);

    // csak intervalon belüli üzenetek
    const filtered = timestamps.filter(ts => now - ts < interval);
    filtered.push(now);

    userMessages.set(message.author.id, filtered);

    if (filtered.length >= limit) {

      await message.delete().catch(() => {});

      // Timeout
      await message.member.timeout(timeoutDuration, "Spam detected").catch(() => {});

      // Log
      const logChannel = message.guild.channels.cache.get(
        guildConfig.modLogChannelId
      );

      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setColor("#f97316")
        .setTitle("🚨 Anti-Spam Triggered")
        .addFields(
          { name: "User", value: `${message.author.tag}`, inline: true },
          { name: "Channel", value: `${message.channel}`, inline: true },
          { name: "Messages", value: `${filtered.length} messages` }
        )
        .setTimestamp();

      logChannel.send({ embeds: [embed] });

      userMessages.set(message.author.id, []);
    }
  },
};
