const { EmbedBuilder } = require("discord.js");
const warnManager = require("./warnManager");

module.exports = {

  async log(guild, type, data) {

    const config = warnManager.readConfig();
    const guildSettings = config[guild.id];

    if (!guildSettings?.modLog?.enabled) return;

    const modLog = guildSettings.modLog;

    if (!modLog.events?.[type]) return;

    const channel = guild.channels.cache.get(modLog.channelId);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#6366f1")
      .setTimestamp();

    switch (type) {

      case "ban":
        embed.setTitle("🔨 Felhasználó bannolva")
          .addFields(
            { name: "Felhasználó", value: `${data.user.tag} (${data.user.id})` },
            { name: "Moderátor", value: data.moderator || "Ismeretlen" },
            { name: "Ok", value: data.reason || "Nincs megadva" }
          );
        break;

      case "kick":
        embed.setTitle("👢 Felhasználó kickelve")
          .addFields(
            { name: "Felhasználó", value: `${data.user.tag}` },
            { name: "Moderátor", value: data.moderator || "Ismeretlen" }
          );
        break;

      case "timeout":
        embed.setTitle("🔇 Timeout alkalmazva")
          .addFields(
            { name: "Felhasználó", value: `${data.user.tag}` },
            { name: "Moderátor", value: data.moderator || "Ismeretlen" },
            { name: "Időtartam", value: data.duration || "Ismeretlen" }
          );
        break;

      case "memberJoin":
        embed.setTitle("👋 Tag csatlakozott")
          .addFields(
            { name: "Felhasználó", value: `${data.user.tag}` }
          );
        break;

      case "memberLeave":
        embed.setTitle("🚪 Tag kilépett")
          .addFields(
            { name: "Felhasználó", value: `${data.user.tag}` }
          );
        break;

      case "messageDelete":
        embed.setTitle("🗑️ Üzenet törölve")
          .addFields(
            { name: "Felhasználó", value: `${data.user.tag}` },
            { name: "Csatorna", value: `<#${data.channel.id}>` },
            { name: "Tartalom", value: data.content?.slice(0, 1000) || "Nincs tartalom" }
          );
        break;

      case "messageEdit":
        embed.setTitle("✏️ Üzenet szerkesztve")
          .addFields(
            { name: "Felhasználó", value: `${data.user.tag}` },
            { name: "Csatorna", value: `<#${data.channel.id}>` },
            { name: "Régi tartalom", value: data.oldContent?.slice(0, 1000) || "Nincs" },
            { name: "Új tartalom", value: data.newContent?.slice(0, 1000) || "Nincs" }
          );
        break;

      case "roleUpdate":
        embed.setTitle("🎭 Role változás")
          .addFields(
            { name: "Felhasználó", value: `${data.user.tag}` },
            { name: "Hozzáadva", value: data.added?.join(", ") || "Nincs" },
            { name: "Eltávolítva", value: data.removed?.join(", ") || "Nincs" }
          );
        break;
    }

    await channel.send({ embeds: [embed] }).catch(() => {});
  }
};
