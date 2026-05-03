import { Events, EmbedBuilder } from 'discord.js';
import { getConfig } from '../database.js';
import { getLogChannel } from '../utils/permissions.js';
import { Colors, alertEmbed } from '../utils/embeds.js';
import { updateStatusChannels } from '../utils/statusUpdater.js';

export const name = Events.GuildMemberAdd;
export const once = false;

const RAID_WINDOW_MS = 10_000;
const RAID_THRESHOLD = 10;
const recentJoins    = new Map();

export async function execute(member) {
  const { guild } = member;
  const now = Date.now();

  // ─── كشف الـ Raid ────────────────────────────────────────────────────────
  const joins = (recentJoins.get(guild.id) ?? []).filter(t => now - t < RAID_WINDOW_MS);
  joins.push(now);
  recentJoins.set(guild.id, joins);

  const modLogCh  = await getLogChannel(guild, getConfig(guild.id, 'modlog_channel'));
  const logCh     = await getLogChannel(guild, getConfig(guild.id, 'log_channel'));
  const welcomeCh = await getLogChannel(guild, getConfig(guild.id, 'welcome_channel'));

  if (joins.length >= RAID_THRESHOLD) {
    const alertCh = modLogCh ?? logCh;
    if (alertCh) {
      await alertCh.send({
        embeds: [
          alertEmbed('Raid — موجة انضمام مشبوهة!')
            .setDescription(
              `انضم **${joins.length} عضو** في أقل من 10 ثوانٍ!\n` +
              'يُنصح بتفعيل التحقق أو تقييد الدخول مؤقتاً.'
            )
            .addFields(
              { name: '📊 الموجة',      value: `${joins.length} / 10ث`, inline: true },
              { name: '👥 الإجمالي',    value: `${guild.memberCount}`,   inline: true },
            )
        ],
      }).catch(() => {});
    }
  }

  const accountAgeDays = Math.floor((now - member.user.createdTimestamp) / 86_400_000);
  const isNewAccount   = accountAgeDays < 7;
  const avatarURL      = member.user.displayAvatarURL({ dynamic: true, size: 512 });

  // ─── بطاقة الترحيب — نظيفة واحترافية ─────────────────────────────────
  if (welcomeCh) {
    const welcome = new EmbedBuilder()
      .setColor(isNewAccount ? Colors.CRIMSON : Colors.WHITE)
      .setDescription(
        `## 👋 أهلاً بك ${member}\n` +
        `مرحباً في **${guild.name}**!\n` +
        `أنت العضو رقم **#${guild.memberCount}**` +
        (isNewAccount ? '\n\n⚠️ هذا الحساب عمره أقل من 7 أيام' : '')
      )
      .setThumbnail(avatarURL)
      .setTimestamp()
      .setFooter({ text: `⚔️ FX9-SYS  •  ${guild.name}` });

    await welcomeCh.send({ embeds: [welcome] }).catch(() => {});
  }

  // ─── سجل الانضمام (قناة السجلات العامة) ─────────────────────────────────
  if (logCh) {
    await logCh.send({
      embeds: [
        new EmbedBuilder()
          .setColor(isNewAccount ? Colors.CRIMSON : Colors.JOIN)
          .setTitle('📥  انضمام عضو')
          .addFields(
            { name: '👤 العضو',      value: `${member} — \`${member.user.tag}\``, inline: false },
            { name: '🆔 المعرّف',    value: `\`${member.user.id}\``,              inline: true  },
            { name: '🕐 عمر الحساب', value: `${accountAgeDays} يوم`,             inline: true  },
            { name: '👥 الأعضاء',   value: `${guild.memberCount}`,               inline: true  },
            ...(isNewAccount ? [{ name: '⚠️ تنبيه', value: 'حساب عمره أقل من 7 أيام', inline: false }] : []),
          )
          .setThumbnail(avatarURL)
          .setTimestamp()
          .setFooter({ text: '⚔️ FX9-SYS  •  السجلات العامة' })
      ],
    }).catch(() => {});
  }

  await updateStatusChannels(guild).catch(() => {});
}
