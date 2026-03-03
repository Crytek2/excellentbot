const modLog = require("../shared/modLogManager");

module.exports = {
  name: "guildMemberRemove",
  async execute(member) {

    const logs = await member.guild.fetchAuditLogs({
      type: 20,
      limit: 1
    });

    const entry = logs.entries.first();

    if (entry && entry.target.id === member.id) {
      modLog.log(member.guild, "kick", {
        user: member.user,
        moderator: entry.executor?.tag
      });
    } else {
      modLog.log(member.guild, "memberLeave", {
        user: member.user
      });
    }
  }
};

