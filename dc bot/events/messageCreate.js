const automod = require("../shared/automodManager");
const xpManager = require("../shared/xpManager");
const configManager = require("../../shared/configManager.js");

module.exports = {
  name: "messageCreate",
  async execute(message) {

    if (!message.guild) return;
    if (message.author.bot) return;

    // Automod
    automod.check(message);

    // XP
    const result = xpManager.addXP(
      message.guild.id,
      message.author.id
    );

    if (!result || !result.levelUp) return;

    const levelConfig = configManager.getModule(
      message.guild.id,
      "level"
    );

    if (!levelConfig?.enabled) return;

    /* ================= LEVEL UP MESSAGE ================= */

    const channel = levelConfig.channel
      ? message.guild.channels.cache.get(levelConfig.channel)
      : message.channel;

    if (channel) {

      const msgTemplate =
        levelConfig.message ||
        "🎉 {user} elérte a(z) {level} szintet!";

      const finalMessage = msgTemplate
        .replace(/{user}/g, `<@${message.author.id}>`)
        .replace(/{level}/g, result.level);

      channel.send(finalMessage).catch(() => {});
    }

    /* ================= LEVEL ROLE ================= */

    if (levelConfig.roles?.[result.level]) {

      const roleId = levelConfig.roles[result.level];
      const role = message.guild.roles.cache.get(roleId);

      if (role && message.member) {
        message.member.roles.add(role).catch(() => {});
      }
    }
  }
};
