import { Events, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getConfig, getSpamData, upsertSpamData } from '../database.js';
import { getLogChannel } from '../utils/permissions.js';
import { Colors } from '../utils/embeds.js';

export const name = Events.MessageCreate;
export const once = false;

// ─── إعدادات الحماية ────────────────────────────────────────────────────────
const SPAM_THRESHOLD    = 5;        // عدد الرسائل
const SPAM_WINDOW_MS    = 5_000;    // خلال 5 ثوانٍ
const TIMEOUT_MS        = 60_000;   // مدة الإيقاف: 60 ثانية
const MENTION_THRESHOLD = 5;        // حد المنشنات في رسالة واحدة
const LINK_REGEX        = /https?:\/\/[^\s]+/gi;
const ALLOWED_DOMAINS   = ['discord.com', 'discord.gg'];

export async function execute(message) {
  if (!message.guild || message.author.bot) return;
  if (message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) return;

  const guildId  = message.guild.id;
  const userId   = message.author.id;
  const now      = Date.now();
  const logCh    = await getLogChannel(message.guild, getConfig(guildId, 'log_channel'));
  const modLogCh = await getLogChannel(message.guild, getConfig(guildId, 'modlog_channel'));
  const alertCh  = modLogCh ?? logCh;

  // ─── Anti-Mention-Spam ────────────────────────────────────────────────────
  const mentionCount = message.mentions.users.size + message.mentions.roles.size;
  if (mentionCount >= MENTION_THRESHOLD) {
    await message.delete().catch(() => {});

    const warn = await message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.BLOOD)
          .setTitle('🚫 مسح جماعي للمنشنات')
          .setDescription(`${message.author} — لا يُسمح بمنشنة ${mentionCount} عضو في رسالة واحدة.`)
          .setTimestamp()
          .setFooter({ text: '⚔️ FX9-SYS  •  الحماية التلقائية' })
      ],
    }).catch(() => null);
    if (warn) setTimeout(() => warn.delete().catch(() => {}), 6000);

    if (alertCh) {
      await alertCh.send({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.BLOOD)
            .setTitle('🚨 Auto-Mod — منشنات جماعية')
            .addFields(
              { name: '👤 المستخدم', value: `${message.author} \`${message.author.tag}\``, inline: true },
              { name: '💬 القناة',   value: `${message.channel}`,                           inline: true },
              { name: '📊 المنشنات', value: `${mentionCount} منشن`,                         inline: true },
            )
            .setTimestamp()
            .setFooter({ text: '⚔️ FX9-SYS  •  سجلات الإشراف' })
        ],
      }).catch(() => {});
    }
    return;
  }

  // ─── Anti-Link ────────────────────────────────────────────────────────────
  const links = message.content.match(LINK_REGEX) ?? [];
  if (links.length > 0) {
    const hasDisallowed = links.some(link => {
      try {
        const host = new URL(link).hostname;
        return !ALLOWED_DOMAINS.some(d => host === d || host.endsWith('.' + d));
      } catch { return true; }
    });

    if (hasDisallowed) {
      await message.delete().catch(() => {});

      const warn = await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.WARNING)
            .setTitle('🔗 رابط محظور')
            .setDescription(`${message.author} — الروابط غير مسموح بها في هذا السيرفر.`)
            .setTimestamp()
            .setFooter({ text: '⚔️ FX9-SYS  •  الحماية التلقائية' })
        ],
      }).catch(() => null);
      if (warn) setTimeout(() => warn.delete().catch(() => {}), 5000);

      if (alertCh) {
        await alertCh.send({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.WARNING)
              .setTitle('🔗 Auto-Mod — رابط محذوف')
              .addFields(
                { name: '👤 المستخدم', value: `${message.author} \`${message.author.tag}\``, inline: true },
                { name: '💬 القناة',   value: `${message.channel}`,                           inline: true },
                { name: '🔗 الرابط',   value: links[0].slice(0, 512),                         inline: false },
              )
              .setTimestamp()
              .setFooter({ text: '⚔️ FX9-SYS  •  سجلات الإشراف' })
          ],
        }).catch(() => {});
      }
      return;
    }
  }

  // ─── Anti-Spam ────────────────────────────────────────────────────────────
  const spamData  = getSpamData(guildId, userId);
  let count       = 1;
  let lastReset   = now;

  if (spamData && now - spamData.last_reset < SPAM_WINDOW_MS) {
    count     = spamData.message_count + 1;
    lastReset = spamData.last_reset;
  }
  upsertSpamData(guildId, userId, count, lastReset);

  if (count >= SPAM_THRESHOLD) {
    upsertSpamData(guildId, userId, 0, now);

    let timedOut = false;
    try {
      await message.member.timeout(TIMEOUT_MS, 'Auto-Mod: سبام');
      timedOut = true;
    } catch { /* لا صلاحية */ }

    const warn = await message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.ERROR)
          .setTitle('🚫 سبام مكتشف')
          .setDescription(
            `${message.author} — ` +
            (timedOut ? `تم إيقافك مؤقتاً لمدة **${TIMEOUT_MS / 1000} ثانية**.` : 'يُرجى التوقف عن الإرسال المتكرر.')
          )
          .setTimestamp()
          .setFooter({ text: '⚔️ FX9-SYS  •  الحماية التلقائية' })
      ],
    }).catch(() => null);
    if (warn) setTimeout(() => warn.delete().catch(() => {}), 8000);

    if (alertCh) {
      await alertCh.send({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.ERROR)
            .setTitle('🤖 Auto-Mod — سبام')
            .addFields(
              { name: '👤 المستخدم', value: `${message.author} \`${message.author.tag}\``,   inline: true },
              { name: '💬 القناة',   value: `${message.channel}`,                             inline: true },
              { name: '📊 الرسائل', value: `${count} في ${SPAM_WINDOW_MS / 1000}ث`,          inline: true },
              { name: '⚡ الإجراء', value: timedOut ? `إيقاف ${TIMEOUT_MS / 1000}ث` : 'تحذير', inline: true },
            )
            .setTimestamp()
            .setFooter({ text: '⚔️ FX9-SYS  •  سجلات الإشراف' })
        ],
      }).catch(() => {});
    }
  }
}
