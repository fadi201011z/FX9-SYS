import { EmbedBuilder } from 'discord.js';

// ─── Color Palette — Black / Red / White Theme ──────────────────────────────
export const Colors = {
  // ── الألوان الأساسية للثيم ──────────────────────────────────────────────
  RED:     0xe74c3c,   // أحمر مشرق  — أوامر الإشراف الرئيسية
  CRIMSON: 0xc0392b,   // أحمر داكن  — تنبيهات Anti-Nuke / Raid
  BLOOD:   0x8b0000,   // أحمر دموي  — أخطاء بالغة / Ban جماعي
  DARK:    0x1a1a1a,   // أسود       — معلومات / لوق محايد
  CHARCOAL:0x2c2c2c,   // رمادي داكن — لوق عام
  WHITE:   0xffffff,   // أبيض       — نجاح / ترحيب
  // ── ألوان وظيفية لأحداث محددة ──────────────────────────────────────────
  SUCCESS: 0xffffff,   // نجاح
  ERROR:   0xe74c3c,   // خطأ
  INFO:    0x1a1a1a,   // معلومات
  WARNING: 0xe67e22,   // تحذير
  MOD:     0xe74c3c,   // إجراء إشراف
  RAID:    0x8b0000,   // Raid / Nuke
  JOIN:    0x2ecc71,   // انضمام
  LEAVE:   0x636e72,   // مغادرة
  EDIT:    0x2980b9,   // تعديل
  VOICE:   0x00cec9,   // صوتي
  ROLE:    0xe74c3c,   // أدوار
  BOTLOG:  0x1a1a1a,   // سجل البوت
};

// ─── Ephemeral flag ─────────────────────────────────────────────────────────
export const EPHEMERAL = 64;

// ─── Footer موحّد ────────────────────────────────────────────────────────────
const FOOTER_ICON = 'https://cdn.discordapp.com/emojis/1176695614518677504.webp';

function footer(section = 'Guardian Bot') {
  return { text: `⚔️ FX9-SYS  •  ${section}` };
}

// ─── Safe description ────────────────────────────────────────────────────────
function safeSet(embed, desc) {
  const s = String(desc ?? '').trim();
  if (s.length > 0) embed.setDescription(s.slice(0, 4096));
  return embed;
}

// ─── Base builder ────────────────────────────────────────────────────────────
function base(color, section) {
  return new EmbedBuilder()
    .setColor(color)
    .setTimestamp()
    .setFooter(footer(section));
}

// ════════════════════════════════════════════════════════════════════════════
//  Utility Embeds
// ════════════════════════════════════════════════════════════════════════════

/** ✅ نجاح */
export function successEmbed(title, desc) {
  return safeSet(base(Colors.WHITE, 'إشعار').setTitle(`✅  ${title}`), desc);
}

/** ❌ خطأ */
export function errorEmbed(title, desc) {
  return safeSet(base(Colors.RED, 'خطأ').setTitle(`❌  ${title}`), desc);
}

/** ℹ️ معلومات */
export function infoEmbed(title, desc) {
  return safeSet(base(Colors.DARK, 'معلومات').setTitle(`ℹ️  ${title}`), desc);
}

/** ⚠️ تحذير */
export function warnEmbed(title, desc) {
  return safeSet(base(Colors.WARNING, 'تحذير').setTitle(`⚠️  ${title}`), desc);
}

/** 📋 سجل عام */
export function logEmbed(title, desc, color = Colors.CHARCOAL, section = 'السجلات العامة') {
  return safeSet(base(color, section).setTitle(title), desc);
}

/** 🔨 إجراء إشراف — البطاقة الاحترافية */
export function modEmbed(action, target, moderator, reason, extra = {}) {
  const embed = base(Colors.RED, 'سجلات الإشراف')
    .setTitle(`🔨  ${action}`)
    .addFields(
      {
        name: '👤  العضو المستهدف',
        value: `${target}\n${target?.id ? `\`\`\`${target.id}\`\`\`` : ''}`,
        inline: true,
      },
      { name: '🛡️  المشرف', value: `${moderator}`, inline: true },
      { name: '\u200b', value: '\u200b', inline: true },
      { name: '📋  السبب', value: `\`\`\`${(reason || 'لم يُذكر سبب').slice(0, 990)}\`\`\``, inline: false },
    );

  for (const [name, value] of Object.entries(extra)) {
    embed.addFields({ name, value: String(value).slice(0, 1024), inline: true });
  }
  return embed;
}

/** 🚨 تنبيه حماية */
export function alertEmbed(title, desc) {
  const embed = base(Colors.BLOOD, 'نظام الحماية')
    .setTitle(`🚨  ${title}`);
  if (desc) safeSet(embed, desc);
  return embed;
}

/** 🤖 سجل البوت */
export function botLogEmbed(status, desc, color = Colors.DARK) {
  return safeSet(
    base(color, 'سجل البوت')
      .setTitle(status)
      .addFields({ name: '🕐  الوقت', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }),
    desc
  );
}
