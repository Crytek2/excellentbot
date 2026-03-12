const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "config.json");

let cache = {};

/* =========================
   LOAD
========================= */
function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({}, null, 2));
  }

  try {
    cache = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch {
    cache = {};
  }
}

/* =========================
   SAVE
========================= */
function saveFile() {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cache, null, 2));
}

/* =========================
   GET FULL GUILD CONFIG
========================= */
function getGuildConfig(guildId) {
  loadConfig(); // 🔥 mindig frissít
  return cache[guildId] || {};
}

/* =========================
   GET SINGLE MODULE
========================= */
function getModule(guildId, module) {
  loadConfig(); // 🔥 mindig frissít
  if (!cache[guildId]) return {};
  return cache[guildId][module] || {};
}

/* =========================
   SAVE MODULE
========================= */
function saveModule(guildId, module, data) {
  loadConfig(); // 🔥 biztos friss adatból indul

  if (!cache[guildId]) {
    cache[guildId] = {};
  }

  cache[guildId][module] = {
    ...cache[guildId][module],
    ...data,
  };

  saveFile();
}

module.exports = {
  getGuildConfig,
  getModule,
  saveModule
};


