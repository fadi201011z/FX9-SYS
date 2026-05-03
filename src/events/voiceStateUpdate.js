import { Events, EmbedBuilder } from 'discord.js';
import { getConfig } from '../database.js';
import { getLogChannel } from '../utils/permissions.js';
import { Colors } from '../utils/embeds.js';
import { updateStatusChannels } from '../utils/statusUpdater.js';

export const name = Events.VoiceStateUpdate;
export const once = false;

export async function execute(oldState, newState) {
  const { guild } = newState;
  const member = newState.member;
  if (member?.user.bot) return;

  const logCh = await getLogChannel(guild, getConfig(guild.id, 'log_channel'));

  const joined   = !oldState.channel && newState.channel;
  const left     = oldState.channel && !newState.channel;
  const switched = oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id;

  if (!joined && !left && !switched) return;

  let title, description, color;

  if (joined) {
    title       = '🎤  دخل قناة صوتية';
    description = `${member} انضم إلى **${newState.channel.name}**`;
    color       = Colors.VOICE;
  } else if (left) {
    title       = '🔇  غادر قناة صوتية';
    description = `${member} غادر **${oldState.channel.name}**`;
    color       = Colors.LEAVE;
  } else {
    title       = '🔀  تنقّل بين القنوات';
    description = `${member} انتقل من **${oldState.channel.name}** ← **${newState.channel.name}**`;
    color       = Colors.EDIT;
  }

  if (logCh) {
    await logCh.send({
      embeds: [
        new EmbedBuilder()
          .setColor(color)
          .setTitle(title)
          .setDescription(description)
          .setThumbnail(member?.user.displayAvatarURL({ dynamic: true }) ?? null)
          .addFields({ name: '🆔  المعرّف', value: `\`${member?.user.id ?? 'N/A'}\``, inline: true })
          .setTimestamp()
          .setFooter({ text: '⚔️ FX9-SYS  •  السجلات العامة' })
      ],
    }).catch(() => {});
  }

  await updateStatusChannels(guild).catch(() => {});
}
