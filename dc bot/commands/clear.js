const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Üzenetek törlése egy csatornából')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Törlendő üzenetek száma (max 500)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(500)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      const noPermsEmbed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Nincs jogosultság')
        .setDescription('Nincs jogosultságod üzenetek törlésére.');

      return interaction.reply({ 
        embeds: [noPermsEmbed], 
        flags: MessageFlags.Ephemeral 
      });
    }

    const amount = interaction.options.getInteger('amount');

    try {
      await interaction.channel.bulkDelete(amount, true);

      const successEmbed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('✅ Üzenetek törölve')
        .setDescription(`Sikeresen töröltem **${amount}** üzenetet ebben a csatornában.`)
        .setTimestamp();

      await interaction.reply({ 
        embeds: [successEmbed], 
        flags: MessageFlags.Ephemeral 
      });

    } catch (error) {
      console.error(error);

      const errorEmbed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('⚠️ Hiba történt')
        .setDescription('Nem tudtam törölni az üzeneteket. Lehet, hogy túl régiek (14 napnál régebbiek).')
        .setTimestamp();

      await interaction.reply({ 
        embeds: [errorEmbed], 
        flags: MessageFlags.Ephemeral 
      });
    }
  },
};
