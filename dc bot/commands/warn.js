const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const warnManager = require("../shared/warnManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn rendszer")
    .addSubcommand(sub =>
      sub.setName("add")
        .setDescription("Figyelmeztetés hozzáadása")
        .addUserOption(option =>
          option.setName("user")
            .setDescription("Felhasználó")
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName("reason")
            .setDescription("Indok")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName("remove")
        .setDescription("Warn törlése Case ID alapján")
        .addStringOption(option =>
          option.setName("caseid")
            .setDescription("Case ID")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    try {

      const sub = interaction.options.getSubcommand();

      if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
        return interaction.reply({
          content: "❌ Nincs jogosultságod figyelmeztetéseket kezelni.",
          ephemeral: true
        });
      }

      const config = warnManager.readConfig();
      const guildSettings = config[interaction.guild.id];

      if (!guildSettings || !guildSettings.warnSystemEnabled) {
        return interaction.reply({
          content: "⚠️ A Warn rendszer nincs engedélyezve ezen a szerveren.",
          ephemeral: true
        });
      }

      /* ======================================================
         🔥 ADD SUBCOMMAND
      ====================================================== */

      if (sub === "add") {

        const target = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason");

        if (target.id === interaction.user.id)
          return interaction.reply({ content: "❌ Saját magadat nem figyelmeztetheted.", ephemeral: true });

        if (target.bot)
          return interaction.reply({ content: "❌ Botot nem lehet figyelmeztetni.", ephemeral: true });

        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!member.moderatable) {
          return interaction.reply({
            content: "❌ Nem tudom moderálni ezt a felhasználót (role hierarchy).",
            ephemeral: true
          });
        }


        if (interaction.member.roles.highest.position <= member.roles.highest.position)
          return interaction.reply({ content: "❌ Nem figyelmeztethetsz nálad magasabb rangú tagot.", ephemeral: true });
        

        

        // 🔥 WARN MANAGER
        const warn = warnManager.addWarn(
          interaction.guild.id,
          target.id,
          interaction.user,
          reason
        );

        const userWarns = warnManager.getUserWarns(
          interaction.guild.id,
          target.id
        );

        const totalWarns = userWarns.length;

        /* ================= ESCALATION ================= */

        const escalation = guildSettings.warnEscalation || {};
        const timeoutDuration = guildSettings.warnTimeoutDuration || 600000;

        if (escalation[totalWarns]) {
          const action = escalation[totalWarns];

          if (action === "timeout" && member.moderatable) {
            await member.timeout(timeoutDuration, "Warn escalation").catch(() => {});
          }

          if (action === "kick") {
            await member.kick("Warn escalation").catch(() => {});
          }

          if (action === "ban") {
            await member.ban({ reason: "Warn escalation" }).catch(() => {});
          }
        }

        const embed = new EmbedBuilder()
          .setColor("#f59e0b")
          .setTitle("⚠️ Figyelmeztetés")
          .addFields(
            { name: "Felhasználó", value: target.tag, inline: true },
            { name: "Warnok száma", value: totalWarns.toString(), inline: true },
            { name: "Indok", value: reason },
            { name: "Case ID", value: warn.caseId, inline: true }
          )
          .setTimestamp();

        await interaction.reply({
          content: "Sikeres művelet",
          ephemeral: true
        });

      }

      /* ======================================================
         🔥 REMOVE SUBCOMMAND
      ====================================================== */

      if (sub === "remove") {

        const caseId = interaction.options.getString("caseid");

        const success = warnManager.removeWarnByCaseId(
          interaction.guild.id,
          caseId
        );

        if (!success) {
          return interaction.reply({
            content: "❌ Nem található ilyen Case ID.",
            ephemeral: true
          });
        }

        const embed = new EmbedBuilder()
          .setColor("#22c55e")
          .setTitle("✅ Warn eltávolítva")
          .addFields(
            { name: "Case ID", value: caseId, inline: true },
            { name: "Eltávolította", value: interaction.user.tag, inline: true }
          )
          .setTimestamp();

        await interaction.reply({
          content: "Sikeres művelet",
          ephemeral: true
        });
      }

    } catch (error) {
      console.error("❌ Hiba a /warn parancsnál:", error);

      if (!interaction.replied) {
        await interaction.reply({
          content: "Hiba történt a parancs futtatása közben.",
          ephemeral: true
        });
      }
    }
  },
};
