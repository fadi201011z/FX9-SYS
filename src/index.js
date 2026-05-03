import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { readdir } from 'fs/promises';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import 'dotenv/config';
import { initBotLogger, sendOfflineLog, sendErrorLog } from './utils/botLogger.js';
import express from 'express'; // 1. أضفنا مكتبة Express

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Express Server (Keep-Alive) ──────────────────────────────────────────
const app = express();
app.get('/', (req, res) => res.send('FX9-SYS High-Tech System is Online!'));

// استخدام المنفذ 10000 المتوافق مع Render
app.listen(10000, () => {
    console.log('------------------------------------------');
    console.log('📡 Keep-alive Server: Active on Port 10000');
    console.log('------------------------------------------');
});

// ─── Client ────────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

client.commands = new Collection();

// ─── Load Commands ─────────────────────────────────────────────────────────
const commandDirs = [
  path.join(__dirname, 'commands', 'setup'),
  path.join(__dirname, 'commands', 'moderation'),
  path.join(__dirname, 'commands', 'info'),
  path.join(__dirname, 'commands', 'members'),
];

for (const dir of commandDirs) {
  let files;
  try { files = (await readdir(dir)).filter(f => f.endsWith('.js')); }
  catch { continue; }
  for (const file of files) {
    const mod = await import(pathToFileURL(path.join(dir, file)).href);
    if (mod.data && mod.execute) {
      client.commands.set(mod.data.name, mod);
      console.log(`  [CMD] /${mod.data.name}`);
    }
  }
}

// ─── Load Events ──────────────────────────────────────────────────────────
const eventsDir  = path.join(__dirname, 'events');
const eventFiles = (await readdir(eventsDir)).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = await import(pathToFileURL(path.join(eventsDir, file)).href);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  console.log(`  [EVT] ${event.name}`);
}

// ─── معالجات الإغلاق والأخطاء ──────────────────────────────────────────────
client.once('ready', () => {
  initBotLogger(client);
  console.log(`[SYSTEM] Authorized: ${client.user.tag}`); // تأكيد الدخول

  async function gracefulShutdown(signal) {
    console.log(`\n[${signal}] Shutting down…`);
    try {
        await sendOfflineLog(`إشارة ${signal}`);
    } catch (e) {
        console.error('Failed to send offline log');
    }
    client.destroy();
    process.exit(0);
  }

  process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.once('SIGINT',  () => gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    console.error('[UnhandledRejection]', err);
    sendErrorLog('Promise مرفوضة', err).catch(() => {});
  });
  process.on('uncaughtException', (err) => {
    console.error('[UncaughtException]', err);
    sendErrorLog('استثناء غير محلول', err).catch(() => {});
  });
});

// ─── Login ─────────────────────────────────────────────────────────────────
if (!process.env.TOKEN) {
  console.error('❌ Missing TOKEN in .env');
  process.exit(1);
}

client.login(process.env.TOKEN);