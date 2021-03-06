const { Message } = require("discord.js");
const { Command } = require("@src/structures");
const { purgeMessages } = require("@utils/modUtils");
const { sendMessage } = require("@utils/botUtils");

module.exports = class PurgeCommand extends Command {
  constructor(client) {
    super(client, {
      name: "purge",
      description: "წაშლის შეტყობინებების მითითებულ რაოდენობას",
      category: "MODERATION",
      userPermissions: ["MANAGE_MESSAGES"],
      botPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
      command: {
        enabled: true,
        usage: "<amount>",
        minArgsCount: 1,
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const amount = args[0];

    if (isNaN(amount)) return message.safeReply("Numbers are only allowed");
    if (parseInt(amount) > 99) return message.safeReply("The max amount of messages that I can delete is 99");

    const response = await purgeMessages(message.member, message.channel, "ALL", amount);

    if (typeof response === "number") {
      return sendMessage(message.channel, `Successfully deleted ${response} messages`, 5);
    } else if (response === "BOT_PERM") {
      return message.safeReply("I don't have `Read Message History` & `Manage Messages` to delete messages");
    } else if (response === "MEMBER_PERM") {
      return message.safeReply("You don't have `Read Message History` & `Manage Messages` to delete messages");
    } else if (response === "NO_MESSAGES") {
      return message.safeReply("No messages found that can be cleaned");
    } else {
      return message.safeReply(`Error occurred! Failed to delete messages`);
    }
  }
};
