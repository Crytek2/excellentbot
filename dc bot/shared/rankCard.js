const { createCanvas, loadImage } = require("canvas");

function calculateLevelXP(level) {
  return Math.pow(level / 0.1, 2);
}

module.exports = async (member, xp, level) => {

  const canvas = createCanvas(800, 250);
  const ctx = canvas.getContext("2d");

  // Háttér
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Következő szint számítás
  const currentLevelXP = calculateLevelXP(level);
  const nextLevelXP = calculateLevelXP(level + 1);

  const progressXP = xp - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const progressPercent = progressXP / neededXP;

  // Progress Bar háttér
  ctx.fillStyle = "#374151";
  ctx.fillRect(250, 170, 450, 25);

  // Progress Bar töltés
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(250, 170, 450 * progressPercent, 25);

  // Avatar
  const avatar = await loadImage(
    member.user.displayAvatarURL({ extension: "png" })
  );

  ctx.save();
  ctx.beginPath();
  ctx.arc(125, 125, 80, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 45, 45, 160, 160);
  ctx.restore();

  // Szöveg
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px sans-serif";
  ctx.fillText(member.user.username, 250, 80);

  ctx.font = "26px sans-serif";
  ctx.fillText(`Level: ${level}`, 250, 120);
  ctx.fillText(`XP: ${xp}`, 250, 150);

  return canvas.toBuffer();
};

