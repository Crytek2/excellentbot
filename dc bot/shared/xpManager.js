const fs = require("fs");
const path = require("path");
const configManager = require("../../shared/configManager");

const XP_PATH = path.join(__dirname, "xpData.json");

/* ===============================
   XP CACHE
================================ */

let xpCache = {};

if (fs.existsSync(XP_PATH)) {
  try {
    xpCache = JSON.parse(fs.readFileSync(XP_PATH, "utf8"));
  } catch {
    xpCache = {};
  }
}

/* ===============================
   SAVE SYSTEM
================================ */

setInterval(() => {
  try {
    fs.writeFileSync(XP_PATH, JSON.stringify(xpCache, null, 2));
  } catch (err) {
    console.error("XP Save Error:", err);
  }
}, 30000);

process.on("exit", () => {
  fs.writeFileSync(XP_PATH, JSON.stringify(xpCache, null, 2));
});

/* ===============================
   LEVEL CALC
================================ */

function calculateLevel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp));
}

/* ===============================
   COOLDOWN MAP (guild + user)
================================ */

const cooldownMap = new Map();

function getCooldownKey(guildId, userId) {
  return `${guildId}_${userId}`;
}

/* ===============================
   EXPORT
================================ */

module.exports = {

  addXP(guildId, userId) {

    const levelConfig = configManager.getModule(guildId, "level");

    if (!levelConfig?.enabled) return null;

    const cooldown = levelConfig.cooldown || 60;
    const min = levelConfig.min || 5;
    const max = levelConfig.max || 15;

    const now = Date.now();
    const key = getCooldownKey(guildId, userId);

    if (!cooldownMap.has(key)) {
      cooldownMap.set(key, 0);
    }

    if (now - cooldownMap.get(key) < cooldown * 1000) {
      return null;
    }

    cooldownMap.set(key, now);

    if (!xpCache[guildId]) xpCache[guildId] = {};
    if (!xpCache[guildId][userId]) {
      xpCache[guildId][userId] = { xp: 0, level: 0 };
    }

    const gainedXP =
      Math.floor(Math.random() * (max - min + 1)) + min;

    xpCache[guildId][userId].xp += gainedXP;

    const oldLevel = xpCache[guildId][userId].level;
    const newLevel = calculateLevel(xpCache[guildId][userId].xp);

    xpCache[guildId][userId].level = newLevel;

    if (newLevel > oldLevel) {
      return {
        levelUp: true,
        level: newLevel,
        xp: xpCache[guildId][userId].xp
      };
    }

    return { levelUp: false };
  },

  getUser(guildId, userId) {
    return xpCache[guildId]?.[userId] || { xp: 0, level: 0 };
  },

  getLeaderboard(guildId) {
    if (!xpCache[guildId]) return [];

    return Object.entries(xpCache[guildId])
      .sort((a, b) => b[1].xp - a[1].xp)
      .slice(0, 10);
  }

};

