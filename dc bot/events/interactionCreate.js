const ticketManager = require("../shared/ticketManager");

module.exports = { 
  name: 'interactionCreate',
  async execute(interaction, client) {

    // 1) Slash parancsok
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        return interaction.reply({ content: '⛔ Ez a parancs nem található.', ephemeral: true });
      }

      try {
        await command.execute(interaction);
        console.log(`✅ Slash parancs sikeresen lefutott: /${interaction.commandName}`);
      } catch (error) {
        console.error(`❌ Hiba a parancs futtatása közben: /${interaction.commandName}`, error);
        if (!interaction.replied) {
          await interaction.reply({ content: 'Hiba történt!', ephemeral: true });
        }
      }
      return;
    }

    // 2) Ticket gombok kezelése (ÚJ rendszer)
    if (interaction.isButton()) {

      if (interaction.customId === "ticket_open") {
        return ticketManager.openTicket(interaction);
      }

      if (interaction.customId === "ticket_close") {
        return ticketManager.closeTicket(interaction);
      }
    }
  },
};

