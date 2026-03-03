const warnManager = require("./warnManager");

const userMessageMap = new Map();

module.exports = {

  async check(message) {

    if (!message.guild || message.author.bot) return;

    const config = warnManager.readConfig();
    const guildSettings = config[message.guild.id];

    if (!guildSettings?.automod?.enabled) return;

    const automod = guildSettings.automod;
    const content = message.content.toLowerCase();

    let violation = null;

    // ===== INVITE LINK =====
    if (automod.rules.inviteLinks && content.includes("discord.gg")) {
      violation = "Discord invite link tiltva";
    }

    // ===== EXTERNAL LINK =====
    if (!violation && automod.rules.externalLinks) {
      const linkRegex = /(https?:\/\/[^\s]+)/g;
      if (linkRegex.test(content)) {
        violation = "Külső link tiltva";
      }
    }

    // ===== CAPS SPAM =====
    if (!violation && automod.rules.capsSpam) {
      if (content.length > 10) {
        const caps = message.content.replace(/[^A-Z]/g, "").length;
        if (caps / message.content.length > 0.7) {
          violation = "Túl sok nagybetű";
        }
      }
    }

    // ===== BLACKLIST =====
    if (!violation && automod.rules.blacklist) {
      for (const word of automod.blacklistedWords || []) {
        if (content.includes(word.toLowerCase())) {
          violation = `Tiltott szó: ${word}`;
          break;
        }
      }
    }

    // ===== FLOOD =====
    if (!violation && automod.rules.flood) {

      const now = Date.now();
      const userId = message.author.id;

      if (!userMessageMap.has(userId)) {
        userMessageMap.set(userId, []);
      }

      const timestamps = userMessageMap.get(userId)
        .filter(ts => now - ts < 5000);

      timestamps.push(now);
      userMessageMap.set(userId, timestamps);

      if (timestamps.length >= 5) {
        violation = "Spam flood";
      }
    }

    if (!violation) return;

    // ===== BÜNTETÉS =====

    if (automod.deleteMessage) {
      await message.delete().catch(() => {});
    }

    if (automod.autoWarn) {
      warnManager.addWarn(
        message.guild.id,
        message.author.id,
        { id: "AUTOMOD", tag: "Automod" },
        violation
      );
    }

    if (automod.timeoutDuration) {
      const member = await message.guild.members.fetch(message.author.id).catch(() => null);
      if (member?.moderatable) {
        await member.timeout(automod.timeoutDuration, violation).catch(() => {});
      }
    }

    message.channel.send({
      content: `⚠️ ${message.author}, szabálysértés: ${violation}`,
    }).then(msg => {
      setTimeout(() => msg.delete().catch(() => {}), 5000);
    });

  }
};
