const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const fs = require('fs');
const path = './tempRoles.json';

// Log csatorna ID — ide küldi az értesítéseket, amikor rang lejár és eltávolításra kerül
const LOG_CHANNEL_ID = 'CSATORNA_ID_ITTE'; // <-- ide írd be a csatorna ID-ját!

// Betöltjük az ideiglenes rangokat
let tempRoles = {};
if (fs.existsSync(path)) {
  try {
    tempRoles = JSON.parse(fs.readFileSync(path));
  } catch {
    tempRoles = {};
  }
}

function saveTempRoles() {
  fs.writeFileSync(path, JSON.stringify(tempRoles, null, 2));
}

// Rang eltávolító függvény, törli az időzítőt is, és küld értesítést
async function removeRole(client, guildId, userId, roleId, key) {
  try {
    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);
    const role = guild.roles.cache.get(roleId);

    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId);
      console.log(`⏳ Rang eltávolítva: ${roleId} felhasználótól: ${userId}`);

      const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel) {
        logChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor('Orange')
              .setTitle('⏳ Ideiglenes rang eltávolítva')
              .setDescription(`<@${userId}> elvesztette a **${role?.name || roleId}** rangot.`)
              .setTimestamp()
          ]
        });
      }
    }
  } catch (error) {
    console.error('❌ Hiba rang eltávolításakor:', error);
  }
  delete tempRoles[key];
  saveTempRoles();
}

// Indításkor időzítők visszaállítása
function startTimers(client) {
  for (const key in tempRoles) {
    const { guildId, userId, roleId, expiresAt } = tempRoles[key];
    const timeLeft = expiresAt - Date.now();

    if (timeLeft <= 0) {
      // Lejárt, azonnal töröljük
      removeRole(client, guildId, userId, roleId, key);
    } else {
      // Időzítő indítása a maradék időre
      setTimeout(() => removeRole(client, guildId, userId, roleId, key), timeLeft);
    }
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('temprole')
    .setDescription('Ideiglenes rangot ad egy felhasználónak egy adott ideig.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(option =>
      option.setName('user')
        .setDescription('A felhasználó, akinek adod a rangot.')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Az ideiglenes rang.')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('time')
        .setDescription('Időtartam másodpercben. (Pl. 60 = 1 perc)')
        .setRequired(true)),

  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');
    const seconds = interaction.options.getInteger('time');

    if (!member) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor('Red').setTitle('❌ Hiba').setDescription('Nem található a megadott felhasználó.')],
        flags: 64,
      });
    }

    if (!role) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor('Red').setTitle('❌ Hiba').setDescription('Nem található a megadott rang.')],
        flags: 64,
      });
    }

    if (!seconds || seconds <= 0) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor('Red').setTitle('⏱️ Érvénytelen idő').setDescription('Az időnek nagyobbnak kell lennie 0-nál.')],
        flags: 64,
      });
    }

    if (interaction.guild.members.me.roles.highest.position <= role.position) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor('Red').setTitle('⚠️ Jogosultsági hiba').setDescription(`Nem tudom kezelni a **${role.name}** rangot. Túl magas a pozíciója.`)],
        flags: 64,
      });
    }

    try {
      await member.roles.add(role);

      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor('Green')
          .setTitle('✅ Ideiglenes Rang hozzáadva')
          .setDescription(`${member} megkapta a **${role.name}** rangot **${seconds} másodpercre**.`)
          .setTimestamp()],
      });

      // Tároljuk a rangot perzisztensen
      const key = `${interaction.guild.id}-${member.id}-${role.id}`;
      tempRoles[key] = {
        guildId: interaction.guild.id,
        userId: member.id,
        roleId: role.id,
        expiresAt: Date.now() + seconds * 1000,
      };
      saveTempRoles();

      // Indítjuk az időzítőt
      setTimeout(() => removeRole(interaction.client, interaction.guild.id, member.id, role.id, key), seconds * 1000);

    } catch (error) {
      console.error('❌ Rang hozzáadás sikertelen:', error);
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor('Red').setTitle('🚫 Hiba').setDescription('Nem tudtam hozzáadni a rangot.')],
        flags: 64,
      });
    }
  },
  
  // exportáljuk, hogy a bot fő fájlja hívhassa induláskor
  startTimers,
};


