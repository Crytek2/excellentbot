const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");

const WARN_PATH = path.join(__dirname, "../../shared/warnings.json");
const CONFIG_PATH = path.join(__dirname, "../../shared/config.json");

function readWarns() {
  if (!fs.existsSync(WARN_PATH)) return {};
  return JSON.parse(fs.readFileSync(WARN_PATH));
}

function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  return JSON.parse(fs.readFileSync(CONFIG_PATH));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Megmutatja egy felhasználó figyelmeztetéseit")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Felhasználó")
        .setRequired(true)
    ),

  async execute(interaction) {

    const config = readConfig();
    const guildSettings = config[interaction.guild.id];

    if (!guildSettings || !guildSettings.warnSystemEnabled) {
      return interaction.reply({
        content: "⚠️ A Warn rendszer nincs engedélyezve ezen a szerveren.",
        ephemeral: true
      });
    }

    // Jogosultság check
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({
        content: "❌ Nincs jogosultságod ehhez.",
        ephemeral: true
      });
    }

    const target = interaction.options.getUser("user");
    const warns = readWarns();

    let userWarns =
      warns[interaction.guild.id]?.[target.id] || [];

    // 🧹 Lejárt warnok szűrése
    const now = Date.now();
    userWarns = userWarns.filter(w => !w.expiresAt || w.expiresAt > now);

    if (!userWarns.length) {
      return interaction.reply({
        content: "✅ A felhasználónak nincs aktív figyelmeztetése.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#f59e0b")
      .setTitle(`⚠️ ${target.tag} figyelmeztetései`)
      .setFooter({ text: `Összes aktív warn: ${userWarns.length}` })
      .setTimestamp();

    userWarns.slice(-10).forEach((warn, index) => {
      embed.addFields({
        name: `#${index + 1} • ${warn.caseId || "N/A"}`,
        value:
          `👮 **Mod:** ${warn.moderator}\n` +
          `📄 **Ok:** ${warn.reason}\n` +
          `📅 **Dátum:** <t:${Math.floor(new Date(warn.date).getTime() / 1000)}:f>\n` +
          (warn.expiresAt
            ? `⏳ **Lejár:** <t:${Math.floor(warn.expiresAt / 1000)}:R>`
            : `⏳ **Lejár:** Nincs`),
      });
    });

    interaction.reply({ embeds: [embed] });
  },
};



