import { Events } from 'discord.js';
import { updateStatusChannels } from '../utils/statusUpdater.js';
import { startPresenceRotation } from '../utils/presence.js';
import { sendOnlineLog, startHeartbeat } from '../utils/botLogger.js';

export const name = Events.ClientReady;
export const once = true;

const STATS_INTERVAL = 60 * 1000; // إحصائيات كل دقيقة

export async function execute(client) {
  console.log(`✅ ${client.user.tag} — جاهز`);
  console.log(`📡 ${client.guilds.cache.size} سيرفر | ${client.commands?.size ?? 0} أمر`);

  // ── حالة البوت الدوارة ───────────────────────────────────────────────────
  startPresenceRotation(client);

  // ── تحديث الإحصائيات فور البدء ──────────────────────────────────────────
  for (const [, guild] of client.guilds.cache) {
    try { await updateStatusChannels(guild); } catch { /* لم يُعدّ بعد */ }
  }

  // ── تحديث الإحصائيات كل دقيقة ───────────────────────────────────────────
  setInterval(async () => {
    for (const [, guild] of client.guilds.cache) {
      try { await updateStatusChannels(guild); } catch { /* تجاهل */ }
    }
  }, STATS_INTERVAL);

  // ── إرسال تنبيه "البوت أونلاين" ─────────────────────────────────────────
  await sendOnlineLog();

  // ── تقرير الحالة كل 10 دقائق ────────────────────────────────────────────
  startHeartbeat();

  console.log('📊 الإحصائيات: كل دقيقة | 📋 تقرير الحالة: كل 10 دقائق');
}
