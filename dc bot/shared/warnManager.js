const fs = require("fs");
const path = require("path");

const WARN_PATH = path.join(__dirname, "warnings.json");
const CONFIG_PATH = path.join(__dirname, "config.json");

/* ====================== */

function readWarns() {
  if (!fs.existsSync(WARN_PATH)) return {};
  return JSON.parse(fs.readFileSync(WARN_PATH));
}

function writeWarns(data) {
  fs.writeFileSync(WARN_PATH, JSON.stringify(data, null, 2));
}

function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  return JSON.parse(fs.readFileSync(CONFIG_PATH));
}

/* ====================== */

function addWarn(guildId, userId, moderator, reason) {
  const warns = readWarns();
  const config = readConfig();

  if (!warns[guildId]) warns[guildId] = {};
  if (!warns[guildId][userId]) warns[guildId][userId] = [];

  const guildSettings = config[guildId] || {};
  const warnDecayDays = guildSettings.warnDecayDays || 30;

  const warnData = {
    caseId: "W-" + Date.now(),
    moderatorId: moderator.id,
    moderatorTag: moderator.tag,
    reason,
    date: Date.now(),
    expiresAt: Date.now() + warnDecayDays * 24 * 60 * 60 * 1000
  };

  warns[guildId][userId].push(warnData);
  writeWarns(warns);

  return warnData;
}

/* ====================== */

function getUserWarns(guildId, userId) {
  const warns = readWarns();
  return warns[guildId]?.[userId] || [];
}

/* ====================== */

function removeWarnByCaseId(guildId, caseId) {
  const warns = readWarns();

  if (!warns[guildId]) return false;

  for (const userId of Object.keys(warns[guildId])) {
    const index = warns[guildId][userId]
      .findIndex(w => w.caseId === caseId);

    if (index !== -1) {
      warns[guildId][userId].splice(index, 1);
      writeWarns(warns);
      return true;
    }
  }

  return false;
}

/* ====================== */

function clearUserWarns(guildId, userId) {
  const warns = readWarns();

  if (!warns[guildId] || !warns[guildId][userId])
    return false;

  warns[guildId][userId] = [];
  writeWarns(warns);
  return true;
}

/* ====================== */

module.exports = {
  addWarn,
  getUserWarns,
  removeWarnByCaseId,
  clearUserWarns,
  readConfig
};
