const modLog = require("../shared/modLogManager");

module.exports = {
  name: "guildBanAdd",
  async execute(ban) {

    const logs = await ban.guild.fetchAuditLogs({
      type: 22,
      limit: 1
    });

    const entry = logs.entries.first();

    modLog.log(ban.guild, "ban", {
      user: ban.user,
      moderator: entry?.executor?.tag,
      reason: entry?.reason
    });
  }
};
