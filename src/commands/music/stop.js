const { Command } = require("@src/structures");
const { Message, CommandInteraction } = require("discord.js");
const { musicValidations } = require("@utils/botUtils");

module.exports = class Stop extends Command {
  constructor(client) {
    super(client, {
      name: "stop",
      description: "შეაჩერე მუსიკალური პლეიერი",
      category: "MUSIC",
      validations: musicValidations,
      command: {
        enabled: true,
      },
      slashCommand: {
        enabled: true,
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const response = stop(message);
    await message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const response = stop(interaction);
    await interaction.followUp(response);
  }
};

function stop({ client, guildId }) {
  const player = client.musicManager.get(guildId);
  player.destroy();
  return "🎶 The music player is stopped and queue has been cleared";
}
