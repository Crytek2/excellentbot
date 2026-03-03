const modLog = require("../shared/modLogManager");

module.exports = {
  name: "messageDelete",

  async execute(message) {
    if (!message.guild) return;
    if (!message.author || message.author.bot) return;

    modLog.log(message.guild, "messageDelete", {
      user: message.author,
      channel: message.channel,
      content: message.content || "*No text content*"
    });
  }
};
