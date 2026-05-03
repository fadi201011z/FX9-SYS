import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Colors, EPHEMERAL } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('عرض جميع الأوامر المتاحة مع شرحها');

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(Colors.DARK)
    .setTitle('⚔️ FX9-SYS — دليل الأوامر الكامل')
    .setDescription(
      '> بوت إدارة احترافي بواجهة Embed عربية كاملة\n' +
      '> جميع الأوامر تدعم السجلات التفصيلية والحماية التلقائية'
    )
    .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
    .addFields(
      {
        name: '⚙️  الإعداد الأولي',
        value: [
          '`/setup-welcome`  — قناة الترحيب',
          '`/setup-logs`     — قناة السجلات العامة',
          '`/setup-modlogs`  — قناة سجلات الإشراف',
          '`/setup-botlogs`  — قناة سجل البوت (تشغيل/إيقاف/أخطاء/تقرير 10 دقائق)',
          '`/setup-stats`    — قنوات إحصائيات صوتية (تتحدث كل دقيقة)',
          '`/config`         — عرض الإعدادات الحالية',
        ].join('\n'),
        inline: false,
      },
      {
        name: '🔨  أوامر الإشراف',
        value: [
          '`/ban @عضو [سبب]`          — حظر مع إشعار + سجل',
          '`/kick @عضو [سبب]`         — طرد مع إشعار + سجل',
          '`/timeout @عضو 10m/1h/1d`  — إيقاف مؤقت',
          '`/warn add/list/clear`     — نظام التحذيرات',
          '`/clear 1-100 [@عضو]`      — مسح رسائل بفلاتر',
          '`/slowmode ثوانٍ`          — ضبط وضع البطء',
          '`/nick @عضو [لقب]`         — تغيير اللقب',
          '`/role add/remove`         — إدارة الأدوار',
        ].join('\n'),
        inline: false,
      },
      {
        name: '🔒  إدارة القنوات',
        value: [
          '`/lock [#قناة]`   — إغلاق قناة',
          '`/unlock [#قناة]` — فتح قناة',
          '`/hide [#قناة]`   — إخفاء قناة',
          '`/unhide [#قناة]` — إظهار قناة',
        ].join('\n'),
        inline: false,
      },
      {
        name: '📊  المعلومات',
        value: [
          '`/ping`          — زمن الاستجابة',
          '`/botinfo`       — معلومات البوت والمطور',
          '`/serverinfo`    — إحصائيات السيرفر',
          '`/userinfo [@]`  — معلومات عضو + تحذيراته',
        ].join('\n'),
        inline: false,
      },
      {
        name: '👥  أوامر الأعضاء',
        value: [
          '`/profile [@]`   — ملف شخصي كامل (أدوار، تواريخ، تحذيرات)',
          '`/avatar [@]`    — عرض الصورة الشخصية بأعلى دقة',
          '`/rank [@]`      — ترتيبك في السيرفر حسب تاريخ الانضمام',
          '`/rules`         — عرض قوانين السيرفر',
        ].join('\n'),
        inline: false,
      },
      {
        name: '🛡️  الحماية التلقائية',
        value: [
          '**Anti-Spam**    — 5 رسائل/5ث ← إيقاف 60ث + سجل',
          '**Anti-Link**    — حذف الروابط + سجل في الإشراف',
          '**Anti-Mention** — 5+ منشنات في رسالة ← حذف فوري + سجل',
          '**Anti-Nuke**    — 3 حذف قنوات / 5 حظر في 10ث ← سحب الأدوار',
          '**Raid**         — 10+ انضمامات/10ث ← تنبيه فوري',
          '**Bot Log**      — إشعار بكل تشغيل/إيقاف/خطأ + تقرير كل 10 دقائق',
        ].join('\n'),
        inline: false,
      },
    )
    .setTimestamp()
    .setFooter({ text: '⚔️ FX9-SYS  •  حماية وإدارة احترافية' });

  await interaction.reply({ embeds: [embed], flags: EPHEMERAL });
}
