import { Events } from 'discord.js';
import { errorEmbed, EPHEMERAL } from '../utils/embeds.js';

export const name = Events.InteractionCreate;
export const once = false;

export async function execute(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`[/${interaction.commandName}]`, error);

    const embed = errorEmbed('حدث خطأ', 'حدث خطأ غير متوقع أثناء تنفيذ الأمر. حاول مرة أخرى.');
    const opts  = { embeds: [embed], flags: EPHEMERAL };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(opts).catch(() => {});
    } else {
      await interaction.reply(opts).catch(() => {});
    }
  }
}
