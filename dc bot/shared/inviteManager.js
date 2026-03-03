const fs = require("fs");
const path = require("path");

const INVITE_PATH = path.join(__dirname, "invites.json");

function readInvites() {
  if (!fs.existsSync(INVITE_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(INVITE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function writeInvites(data) {
  fs.writeFileSync(INVITE_PATH, JSON.stringify(data, null, 2));
}

module.exports = {

  addInvite(guildId, inviterId, joinedUserId) {
    const data = readInvites();

    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId][inviterId]) {
      data[guildId][inviterId] = {
        count: 0,
        users: []
      };
    }

    data[guildId][inviterId].count += 1;
    data[guildId][inviterId].users.push(joinedUserId);

    writeInvites(data);
  },

  getLeaderboard(guildId) {
    const data = readInvites();
    if (!data[guildId]) return [];

    return Object.entries(data[guildId])
      .sort((a, b) => b[1].count - a[1].count)
      .map(([userId, info]) => ({
        userId,
        count: info.count
      }));
  }

};
