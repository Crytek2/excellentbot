const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "./shared/config.json");

function getGuildConfig(guildId) {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH));
  return config[guildId] || {};
}

module.exports = { getGuildConfig };
