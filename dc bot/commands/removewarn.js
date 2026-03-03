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
    .setName("removewarn")
    .setDescription("Egy konkrét figyelmeztetés törlése")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Felhasználó")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("number")
        .setDescription("Warn sorszáma")
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
    const number = interaction.options.getInteger("number");

    const warns = readWarns();

    const userWarns = warns[interaction.guild.id]?.[target.id];

    if (!userWarns || userWarns.length < number) {
      return interaction.reply({
        content: "Nincs ilyen sorszámú warn.",
        flags: 64
      });
    }

    userWarns.splice(number - 1, 1);
    writeWarns(warns);

    interaction.reply({
      content: `✅ ${target.tag} ${number}. warn törölve lett.`,
      flags: 64
    });
  },
};
