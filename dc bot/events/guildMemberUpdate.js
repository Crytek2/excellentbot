const modLog = require("../shared/modLogManager");

module.exports = {
  name: "guildMemberUpdate",
  async execute(oldMember, newMember) {

    // TIMEOUT
    if (!oldMember.communicationDisabledUntil && newMember.communicationDisabledUntil) {

      const logs = await newMember.guild.fetchAuditLogs({
        type: 24,
        limit: 1
      });

      const entry = logs.entries.first();

      modLog.log(newMember.guild, "timeout", {
        user: newMember.user,
        moderator: entry?.executor?.tag,
        duration: "Timeout alkalmazva"
      });
    }

    // ROLE UPDATE
    const addedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
    const removedRoles = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));

    if (addedRoles.size || removedRoles.size) {

      modLog.log(newMember.guild, "roleUpdate", {
        user: newMember.user,
        added: addedRoles.map(r => r.name),
        removed: removedRoles.map(r => r.name)
      });
    }
  }
};
