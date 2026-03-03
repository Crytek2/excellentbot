require('dotenv').config({ path: './.env' });

console.log("ENV FILE PATH:", require('path').resolve('./.env'));
console.log("CLIENT_ID RAW:", process.env.CLIENT_ID);

const { REST, Routes } = require('discord.js');
const fs = require('fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Beolvassuk a parancsok adatát (data.toJSON())
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
console.log("CLIENT_ID:", process.env.CLIENT_ID);
console.log("GUILD_ID:", process.env.GUILD_ID);


(async () => {
  try {
    console.log('Parancsok regisztrálása...');

    // Szerver ID (a szervered ID-je, ahová regisztrálod)
    const guildId = process.env.GUILD_ID;
    const clientId = process.env.CLIENT_ID;

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log('Parancsok sikeresen regisztrálva!');
  } catch (error) {
    console.error(error);
  }
})();
