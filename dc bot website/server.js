require("dotenv").config();
const express = require("express");
const session = require("express-session");
const OAuth2 = require("discord-oauth2");
const fs = require("fs");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");
const configManager = require("../shared/configManager");




const app = express();
const oauth = new OAuth2();

/* ===============================
   PATHS
================================ */
const WARN_PATH = path.join(__dirname, "../shared/warnings.json");
const XP_PATH = path.join(__dirname, "../shared/xpData.json");
const CONFIG_PATH = path.join(__dirname, "../shared/config.json");
const ticketManager = require("../dc bot/shared/ticketManager");

console.log("ticketManager:", ticketManager);


/* ===============================
   FILE HELPERS
================================ */
function readJSON(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return {};
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/* ===============================
   MIDDLEWARE
================================ */
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dashboard_secret",
    resave: false,
    saveUninitialized: false,
  })
);

/* ===============================
   LOGIN
================================ */
app.get("/login", (req, res) => {
  res.redirect(
    `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(
      process.env.REDIRECT_URI
    )}&response_type=code&scope=identify%20guilds`
  );
});

app.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;

    const token = await oauth.tokenRequest({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      code,
      scope: "identify guilds",
      grantType: "authorization_code",
      redirectUri: process.env.REDIRECT_URI,
    });

    const user = await oauth.getUser(token.access_token);

    req.session.user = user;
    req.session.token = token.access_token;

    res.redirect("/");
  } catch (err) {
    console.error("OAuth error:", err);
    res.send("OAuth error");
  }
});

/* ===============================
   USER
================================ */
app.get("/api/user", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }
  res.json(req.session.user);
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

/* ===============================
   PERMISSION SYSTEM
================================ */

async function resolveGuildMember(req, res, next) {

  if (!req.session.user || !req.session.token) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const guildId = req.params.guildId;

  try {

    const response = await fetch(
      "https://discord.com/api/users/@me/guilds",
      {
        headers: {
          Authorization: `Bearer ${req.session.token}`
        }
      }
    );

    const guilds = await response.json();

    if (!Array.isArray(guilds)) {
      return res.status(500).json({ error: "Failed to fetch guilds" });
    }

    const guild = guilds.find(g => g.id === guildId);

    if (!guild) {
      return res.status(403).json({ error: "Not in this guild" });
    }

    const isOwner = guild.owner === true;

    req.guildMember = {
      guildId,
      isOwner
    };

    next();

  } catch (err) {
    console.error("Permission error:", err);
    res.status(500).json({ error: "Permission check failed" });
  }
}

function requireOwner(req, res, next) {

  if (!req.guildMember) {
    return res.status(500).json({ error: "Guild data missing" });
  }

  if (!req.guildMember.isOwner) {
    return res.status(403).json({
      error: "Only the server owner can manage this bot"
    });
  }

  next();
}


/* ===============================
   GUILDS
================================ */
app.get("/api/guilds", async (req, res) => {
  if (!req.session.token) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const guilds = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${req.session.token}` },
  }).then(r => r.json());

  const adminGuilds = guilds.filter(g => (g.permissions & 0x8) === 0x8);
  res.json(adminGuilds);
});

/* ===============================
   CHANNELS
================================ */
app.get("/api/guilds/:guildId/channels", async (req, res) => {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${req.params.guildId}/channels`,
    {
      headers: {
        Authorization: `Bot ${process.env.BOT_TOKEN}`,
      },
    }
  );

  const data = await response.json();

  if (!Array.isArray(data)) return res.json([]);

  const textChannels = data.filter(c => c.type === 0);
  res.json(textChannels);
});

/* ===============================
   ROLES
================================ */
app.get("/api/guilds/:guildId/roles", async (req, res) => {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${req.params.guildId}/roles`,
      {
        headers: {
          Authorization: `Bot ${process.env.BOT_TOKEN}`,
        },
      }
    );

    const roles = await response.json();
    if (!Array.isArray(roles)) return res.json([]);

    const filtered = roles.filter(r => r.name !== "@everyone");
    res.json(filtered);
  } catch {
    res.json([]);
  }
});

/* ===============================
   CONFIG LOAD
================================ */
app.get(
  "/api/guilds/:guildId/config",
  resolveGuildMember,
  requireOwner,
  (req, res) => {

  const data = configManager.getGuildConfig(req.params.guildId);
res.json(data);

});

/* ===============================
   MODULE SAVE
================================ */
app.post(
  "/api/guilds/:guildId/:module",
  resolveGuildMember,
  requireOwner,
  (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  configManager.saveModule(
  req.params.guildId,
  req.params.module,
  req.body
);

res.json({ success: true });

});
/* ===============================
   TICKET DEPLOY
================================ */

app.post(
  "/api/guilds/:guildId/ticket/deploy",
  resolveGuildMember,
  requireOwner,
  (req, res) => {

    const guildId = req.params.guildId;

    const config = configManager.getGuildConfig(guildId);

    if (!config.ticket || config.ticket.enabled !== true) {
      return res.status(400).json({
        error: "Ticket system is disabled"
      });
    }

    configManager.saveModule(guildId, "ticket", {
      deployRequested: true
    });

    return res.json({ success: true });
});



/* ===============================
   WARNINGS API
================================ */
app.get("/api/guilds/:guildId/warnings", (req, res) => {
  const warns = readJSON(WARN_PATH);
  const guildWarns = warns[req.params.guildId] || {};

  const formatted = Object.entries(guildWarns).map(([userId, warnings]) => ({
    userId,
    count: warnings.length
  }));

  res.json(formatted);
});

app.get("/api/guilds/:guildId/warnings/:userId", (req, res) => {
  const warns = readJSON(WARN_PATH);
  const guildWarns = warns[req.params.guildId] || {};
  const userWarns = guildWarns[req.params.userId] || [];
  res.json(userWarns);
});

app.delete("/api/guilds/:guildId/clearwarns/:userId", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const warns = readJSON(WARN_PATH);

  if (
    warns[req.params.guildId] &&
    warns[req.params.guildId][req.params.userId]
  ) {
    delete warns[req.params.guildId][req.params.userId];
    writeJSON(WARN_PATH, warns);
  }

  res.json({ success: true });
});

/* ===============================
   XP API
================================ */
app.get("/api/guilds/:guildId/xp", (req, res) => {
  const xpData = readJSON(XP_PATH);
  const guildXP = xpData[req.params.guildId] || {};

  const leaderboard = Object.entries(guildXP)
    .sort((a, b) => b[1].xp - a[1].xp)
    .slice(0, 10)
    .map(([userId, data]) => ({
      userId,
      xp: data.xp,
      level: data.level
    }));

  res.json(leaderboard);
});

app.get("/api/guilds/:guildId/xp/:userId", (req, res) => {
  const xpData = readJSON(XP_PATH);
  const guildXP = xpData[req.params.guildId] || {};
  const user = guildXP[req.params.userId] || { xp: 0, level: 0 };
  res.json(user);
});

/*
  Ticket
*/


app.post(
  "/api/guilds/:guildId/ticket/deploy",
  resolveGuildMember,
  requireOwner,
  (req, res) => {

    const guildId = req.params.guildId;

    const config = configManager.getGuildConfig(guildId);

    if (!config.ticket || config.ticket.enabled !== true) {
      return res.status(400).json({
        error: "Ticket system is disabled"
      });
    }

    configManager.saveModule(guildId, "ticket", {
      deployRequested: true
    });

    return res.json({ success: true });
});



/* ===============================
   START
================================ */
app.listen(3000, () => {
  console.log("Dashboard running → http://localhost:3000");
});

console.log("BOT TOKEN:", process.env.BOT_TOKEN ? "OK" : "MISSING");

