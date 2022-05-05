const { Command } = require("@src/structures");
const { Message, CommandInteraction } = require("discord.js");

module.exports = class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: "ping",
      description: "აჩვენებს მიმდინარე პინგს ბოტიდან უთანხმოების სერვერებამდე",
      category: "INFORMATION",
      command: {
        enabled: true,
      },
      slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    await message.safeReply(`🏓 Pong : \`${Math.floor(message.client.ws.ping)}ms\``);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    await interaction.followUp(`🏓 Pong : \`${Math.floor(interaction.client.ws.ping)}ms\``);
  }
};
