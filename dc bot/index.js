require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const modLog = require("./shared/modLogManager");
const inviteManager = require("./shared/inviteManager.js");
const configManager = require("../shared/configManager.js");
const ticketManager = require("./shared/ticketManager");



const inviteCache = new Map();

/* ===============================
   DISCORD CLIENT
================================ */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember
  ]
});

client.commands = new Collection();

/* ===============================
   SHARED CONFIG
================================ */
const CONFIG_PATH = path.join(__dirname, "../shared/config.json");

function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

function writeConfig(data) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
}

client.getGuildConfig = (guildId) => {
  const config = readConfig();
  return config[guildId] || {};
};

/* ===============================
   DASHBOARD MODULES ⭐ NEW
================================ */

const MODULES_PATH = path.join(__dirname, "../shared/modules.json");

function readModules() {
  if (!fs.existsSync(MODULES_PATH)) return {};
  return JSON.parse(fs.readFileSync(MODULES_PATH, "utf8"));
}

client.getModules = (guildId) => {
  const modules = readModules();
  return modules[guildId] || {};
};

/* ===============================
   COMMANDS LOAD
================================ */
const commandFiles = fs
  .readdirSync(path.join(__dirname, "commands"))
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    console.log(`✅ Command loaded: /${command.data.name}`);
  }
}

/* ===============================
   EVENTS LOAD
================================ */
const eventFiles = fs
  .readdirSync(path.join(__dirname, "events"))
  .filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
  console.log(`🟢 Event loaded: ${file}`);
}

/* ===============================
   READY
================================ */

client.invites = new Map();

client.guilds.cache.forEach(async guild => {
  const invites = await guild.invites.fetch();
  client.invites.set(guild.id, invites);
});

client.guilds.cache.forEach(async guild => {
  const invites = await guild.invites.fetch();
  inviteCache.set(
    guild.id,
    new Map(invites.map(inv => [inv.code, inv.uses]))
  );
});

/* ===============================
   LOGS MODULE
================================ */


/* ===============================
   DASHBOARD TEST LISTENER
================================ */




/* ===============================
   LOGIN
================================ */
client.login(process.env.TOKEN);

const config_path = path.join(__dirname, "../shared/config.json");

/* ===============================
   WELCOME EVENT  ⭐⭐⭐
================================ */

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

client.once("ready", () => {

  console.log("Bot ready");

  ticketManager.init(client);

  setInterval(async () => {

    const guilds = client.guilds.cache;

    for (const [guildId] of guilds) {

      const config = configManager.getGuildConfig(guildId);

      if (config.ticket?.deployRequested) {

        console.log("Deploying ticket panel for:", guildId);

        try {

          await ticketManager.deployPanel(guildId);

          configManager.saveModule(guildId, "ticket", {
            deployRequested: false
          });

        } catch (err) {
          console.error("Deploy error:", err.message);
        }

      }
    }

  }, 5000);

});
