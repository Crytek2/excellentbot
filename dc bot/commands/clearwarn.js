const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");

const WARN_PATH = path.join(__dirname, "../../shared/warnings.json");

function readWarns() {
  if (!fs.existsSync(WARN_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(WARN_PATH, "utf8")) || {};
  } catch {
    return {};
  }
}

function writeWarns(data) {
  fs.writeFileSync(WARN_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearwarns")
    .setDescription("Összes figyelmeztetés törlése egy felhasználóról")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Felhasználó")
        .setRequired(true)
    ),

  async execute(interaction) {

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({
        content: "Nincs jogosultságod ehhez.",
        flags: 64
      });
    }

    const target = interaction.options.getUser("user");
    const warns = readWarns();

    if (!warns[interaction.guild.id]?.[target.id]) {
      return interaction.reply({
        content: "Ennek a felhasználónak nincs figyelmeztetése.",
        flags: 64
      });
    }

    delete warns[interaction.guild.id][target.id];
    writeWarns(warns);

    interaction.reply({
      content: `✅ ${target.tag} összes figyelmeztetése törölve lett.`,
      flags: 64
    });
  },
};
