const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "../../shared/config.json");

function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

async function handleViolation(message, guildConfig) {
  await message.delete().catch(() => {});

  const logChannel = message.guild.channels.cache.get(
    guildConfig.modLogChannelId
  );

  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setColor("#ef4444")
    .setTitle("🚫 Anti-Link Triggered")
    .addFields(
      { name: "User", value: message.author.tag, inline: true },
      { name: "Channel", value: message.channel.toString(), inline: true },
      {
        name: "Message",
        value: message.content.slice(0, 1000) || "No content",
      }
    )
    .setTimestamp();

  logChannel.send({ embeds: [embed] });
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
    if (!guildConfig.antiLinkEnabled) return;

    // Admin bypass
    if (
      message.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) return;

    const content = message.content.toLowerCase();

    /* =========================
       DISCORD INVITE BLOCK
    ========================== */

    if (guildConfig.blockInvites) {
      const inviteRegex = /(discord\.gg\/|discord\.com\/invite\/)/gi;
      if (inviteRegex.test(content)) {
        return handleViolation(message, guildConfig);
      }
    }

    /* =========================
       CUSTOM BLOCKED DOMAINS
    ========================== */

    if (Array.isArray(guildConfig.blockedDomains)) {
      for (const domain of guildConfig.blockedDomains) {
        if (!domain) continue;

        if (content.includes(domain.toLowerCase())) {
          return handleViolation(message, guildConfig);
        }
      }
    }

    /* =========================
       GENERIC LINK (OPTIONAL)
       Ha minden http linket tiltani akarsz
       Kapcsold be külön configgal később
    ========================== */

    // const genericLinkRegex = /(https?:\/\/)/gi;
    // if (genericLinkRegex.test(content)) {
    //   return handleViolation(message, guildConfig);
    // }
  },
};
