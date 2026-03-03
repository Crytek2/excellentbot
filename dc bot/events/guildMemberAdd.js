const { EmbedBuilder } = require("discord.js");
const modLog = require("../shared/modLogManager");
const inviteManager = require("../shared/inviteManager");
const configManager = require("../../shared/configManager.js");

module.exports = {
  name: "guildMemberAdd",

  async execute(member) {

    console.log("Új tag érkezett:", member.user.tag);

    const config = configManager.getGuildConfig(member.guild.id);

    if (!config) return;

    /* ================= INVITE TRACKING ================= */

    if (config.inviteTracking?.enabled) {

      try {
        const cachedInvites = member.client.inviteCache?.get(member.guild.id);
        const newInvites = await member.guild.invites.fetch();

        const newInviteMap = new Map(
          newInvites.map(inv => [inv.code, inv.uses])
        );

        let usedInvite = null;

        for (const [code, uses] of newInviteMap) {
          const oldUses = cachedInvites?.get(code) || 0;
          if (uses > oldUses) {
            usedInvite = newInvites.get(code);
            break;
          }
        }

        member.client.inviteCache?.set(member.guild.id, newInviteMap);

        if (usedInvite && usedInvite.inviter) {
          inviteManager.addInvite(
            member.guild.id,
            usedInvite.inviter.id,
            member.id
          );
        }

      } catch (err) {
        console.error("Invite tracking error:", err);
      }
    }

    /* ================= MODLOG ================= */

    modLog.log(member.guild, "memberJoin", {
      user: member.user
    });

    /* ================= WELCOME ================= */

    const welcome = config.welcome;

    if (welcome?.enabled && welcome?.channel) {

      const channel = member.guild.channels.cache.get(welcome.channel);
      if (!channel) return;

      const replace = (text) => {
        if (!text) return "";
        return text
          .replace(/{user}/g, `<@${member.id}>`)
          .replace(/{username}/g, member.user.username)
          .replace(/{server}/g, member.guild.name)
          .replace(/{memberCount}/g, member.guild.memberCount);
      };

      const embed = new EmbedBuilder()
        .setColor(welcome.color || "#22c55e")
        .setTitle(replace(welcome.title))
        .setDescription(replace(welcome.message))
        .setTimestamp();

      if (welcome.thumbnail) {
        embed.setThumbnail(
          welcome.thumbnail === "user"
            ? member.user.displayAvatarURL({ dynamic: true })
            : welcome.thumbnail
        );
      }

      if (welcome.footer) {
        embed.setFooter({ text: replace(welcome.footer) });
      }

      channel.send({ embeds: [embed] }).catch(console.error);
    }

    /* ================= AUTOROLE ================= */

    const autorole = config.autorole;

    if (autorole?.enabled && autorole?.role) {

      try {
        const role = member.guild.roles.cache.get(autorole.role);

        if (role) {
          await member.roles.add(role);
        }
      } catch (err) {
        console.error("AutoRole error:", err);
      }
    }

  }
};

