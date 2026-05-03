#FX9-SYS 🛡️

A professional, high-performance Discord bot built with discord.js v14. Every interaction uses embed-based UI with professional color codes, footers, and timestamps.

---

## Quick Start

### 1. Install Dependencies
```bash
cd discord-bot
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and fill in your values:
```
TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here   # optional: leave blank for global commands
```

**How to get these values:**
- Go to [Discord Developer Portal](https://discord.com/developers/applications)
- Create a new application → Add a Bot
- Copy the **Bot Token** → `TOKEN`
- Copy the **Application ID** → `CLIENT_ID`
- Enable **Server Members Intent**, **Message Content Intent**, and **Presence Intent** under the Bot tab

### 3. Invite the Bot
In the Developer Portal → OAuth2 → URL Generator:
- Scopes: `bot`, `applications.commands`
- Permissions: `Administrator` (recommended for full functionality)

### 4. Register Slash Commands
```bash
npm run deploy
```

### 5. Start the Bot
```bash
npm start
```

---

## Setup Commands (run these first in your server)

| Command | Description |
|---------|-------------|
| `/setup-welcome #channel` | Set the welcome channel for new members |
| `/setup-logs #channel` | Set the moderation log channel |
| `/setup-stats create` | Auto-create voice channels for live server stats |
| `/setup-stats set` | Link existing voice channels to stats |

---

## Moderation Commands

| Command | Description |
|---------|-------------|
| `/ban @user [reason] [delete_days]` | Ban a member, DM them the reason |
| `/kick @user [reason]` | Kick a member, DM them the reason |
| `/timeout @user 10m/1h/1d [reason]` | Timeout a member for a specified duration |
| `/warn add @user reason` | Add a warning to a member |
| `/warn list @user` | View all warnings for a member |
| `/warn clear @user` | Clear all warnings for a member |
| `/clear 1-100 [@user] [bots_only]` | Bulk delete messages with filters |
| `/slowmode seconds` | Set channel slowmode (0 to disable) |
| `/nick @user [nickname]` | Change or reset a member's nickname |
| `/role add/remove @user @role` | Manage member roles |

---

## Channel Management

| Command | Description |
|---------|-------------|
| `/lock [#channel] [reason]` | Lock channel — @everyone cannot send messages |
| `/unlock [#channel]` | Unlock a previously locked channel |
| `/hide [#channel]` | Hide channel from @everyone |
| `/unhide [#channel]` | Show channel to @everyone |

---

## Automatic Protection

### Anti-Spam
- Detects 5+ messages within 5 seconds
- Auto-times out the member for 60 seconds
- Deletes the warning after 8 seconds
- Logs to the mod channel

### Anti-Link
- Blocks unauthorized URLs (allows discord.com and discord.gg by default)
- Deletes the message immediately
- Warns the user with an auto-deleting embed

### Anti-Nuke
- Detects mass channel deletions (3+ in 10 seconds)
- Detects mass bans (5+ in 10 seconds)
- Strips all roles from the offending moderator
- Sends an alert to the log channel

### Raid Detection
- Detects 10+ joins within 10 seconds
- Sends a raid alert to the log channel

---

## Logging Events

All events are sent to the configured log channel with rich embeds:

| Event | Details |
|-------|---------|
| Message Deleted | Content, author, channel, who deleted it |
| Message Edited | Before & after content, jump link |
| Member Join | Account age, new account warning, raid detection |
| Member Leave | Roles at time of leaving, join date |
| Role Update | Roles added/removed |
| Nickname Change | Before/after comparison |
| Voice Activity | Join, leave, switch channels |
| Anti-Mod Actions | Spam, links, nuke, raids |

---

## File Structure

```
discord-bot/
├── src/
│   ├── index.js              # Bot entry point
│   ├── deploy-commands.js    # Register slash commands
│   ├── database.js           # SQLite database (better-sqlite3)
│   ├── commands/
│   │   ├── setup/            # /setup-welcome, /setup-logs, /setup-stats
│   │   ├── moderation/       # /ban, /kick, /timeout, /warn, /clear, etc.
│   │   └── info/             # /help
│   ├── events/
│   │   ├── ready.js          # Bot startup + stats refresh
│   │   ├── interactionCreate.js  # Slash command router
│   │   ├── messageCreate.js  # Anti-spam + anti-link
│   │   ├── messageDelete.js  # Message delete logging
│   │   ├── messageUpdate.js  # Message edit logging
│   │   ├── guildMemberAdd.js # Welcome + raid detection
│   │   ├── guildMemberRemove.js # Leave logging
│   │   ├── guildMemberUpdate.js # Role/nickname changes
│   │   ├── voiceStateUpdate.js  # Voice activity logging
│   │   ├── channelDelete.js  # Anti-nuke (channels)
│   │   └── guildBanAdd.js    # Anti-nuke (bans)
│   └── utils/
│       ├── embeds.js         # Embed builders + color palette
│       ├── permissions.js    # Permission checks + helpers
│       ├── parseDuration.js  # Parse "10m", "1h", "2d" strings
│       └── statusUpdater.js  # Live stats voice channel updater
└── data/
    └── bot.db                # Auto-created SQLite database
```

---

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| 🟢 Success | `#2ecc71` | Successful actions |
| 🔴 Error | `#e74c3c` | Errors, bans, alerts |
| 🔵 Info | `#3498db` | Informational embeds |
| 🟠 Warning | `#f39c12` | Warnings, timeouts, kicks |
| 🟣 Purple | `#9b59b6` | Role changes |
| ⬛ Dark | `#2c3e50` | Dark theme accents |
| ⬜ Log | `#95a5a6` | General log events |
