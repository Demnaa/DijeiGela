const { Command } = require("@src/structures");
const { isHex } = require("@utils/miscUtils");
const { buildGreeting } = require("@src/handlers/greeting");
const { Message, CommandInteraction } = require("discord.js");
const { canSendEmbeds } = require("@utils/guildUtils");
const { sendMessage } = require("@utils/botUtils");

module.exports = class Farewell extends Command {
  constructor(client) {
    super(client, {
      name: "farewell",
      description: "გამოსამშვიდობებელი შეტყობინების დაყენება",
      category: "ADMIN",
      userPermissions: ["MANAGE_GUILD"],
      command: {
        enabled: true,
        minArgsCount: 1,
        subcommands: [
          {
            trigger: "status <on|off>",
            description: "ჩართეთ ან გამორთეთ გამოსამშვიდობებელი შეტყობინება",
          },
          {
            trigger: "channel <#channel>",
            description: "გამოსამშვიდობებელი შეტყობინების კონფიგურაცია",
          },
          {
            trigger: "preview",
            description: "წინასწარ დაათვალიერეთ კონფიგურირებული გამოსამშვიდობებელი შეტყობინება",
          },
          {
            trigger: "desc <text>",
            description: "ჩაშენების აღწერილობის დაყენება",
          },
          {
            trigger: "thumbnail <ON|OFF>",
            description: "ჩაშენების ესკიზის ჩართვა/გამორთვა",
          },
          {
            trigger: "color <hexcolor>",
            description: "ჩაშენების ფერის დაყენება",
          },
          {
            trigger: "footer <text>",
            description: "ჩაშენებული ქვედა კოლონტიტულის დაყენება",
          },
        ],
      },
      slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
          {
            name: "status",
            description: "ჩართეთ ან გამორთეთ გამოსამშვიდობებელი შეტყობინება",
            type: "SUB_COMMAND",
            options: [
              {
                name: "status",
                description: "enabled or disabled",
                required: true,
                type: "STRING",
                choices: [
                  {
                    name: "ON",
                    value: "ON",
                  },
                  {
                    name: "OFF",
                    value: "OFF",
                  },
                ],
              },
            ],
          },
          {
            name: "preview",
            description: "წინასწარ დაათვალიერეთ კონფიგურირებული გამოსამშვიდობებელი შეტყობინება",
            type: "SUB_COMMAND",
          },
          {
            name: "channel",
            description: "set farewell channel",
            type: "SUB_COMMAND",
            options: [
              {
                name: "channel",
                description: "channel name",
                type: "CHANNEL",
                channelTypes: ["GUILD_TEXT"],
                required: true,
              },
            ],
          },
          {
            name: "desc",
            description: "ჩაშენების აღწერილობის დაყენება",
            type: "SUB_COMMAND",
            options: [
              {
                name: "content",
                description: "description content",
                type: "STRING",
                required: true,
              },
            ],
          },
          {
            name: "thumbnail",
            description: "configure embed thumbnail",
            type: "SUB_COMMAND",
            options: [
              {
                name: "status",
                description: "thumbnail status",
                type: "STRING",
                required: true,
                choices: [
                  {
                    name: "ON",
                    value: "ON",
                  },
                  {
                    name: "OFF",
                    value: "OFF",
                  },
                ],
              },
            ],
          },
          {
            name: "color",
            description: "ჩაშენების ფერის დაყენება",
            type: "SUB_COMMAND",
            options: [
              {
                name: "hex-code",
                description: "hex color code",
                type: "STRING",
                required: true,
              },
            ],
          },
          {
            name: "footer",
            description: "set embed footer",
            type: "SUB_COMMAND",
            options: [
              {
                name: "content",
                description: "footer content",
                type: "STRING",
                required: true,
              },
            ],
          },
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   * @param {object} data
   */
  async messageRun(message, args, data) {
    const type = args[0].toLowerCase();
    const settings = data.settings;
    let response;

    // preview
    if (type === "preview") {
      response = await sendPreview(settings, message.member);
    }

    // status
    else if (type === "status") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply("Invalid status. Value must be `on/off`");
      response = await setStatus(settings, status);
    }

    // channel
    else if (type === "channel") {
      const channel = message.mentions.channels.first();
      response = await setChannel(settings, channel);
    }

    // desc
    else if (type === "desc") {
      if (args.length < 2) return message.safeReply("Insufficient arguments! Please provide valid content");
      const desc = args.slice(1).join(" ");
      response = await setDescription(settings, desc);
    }

    // thumbnail
    else if (type === "thumbnail") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply("Invalid status. Value must be `on/off`");
      response = await setThumbnail(settings, status);
    }

    // color
    else if (type === "color") {
      const color = args[1];
      if (!color || !isHex(color)) return message.safeReply("Invalid color. Value must be a valid hex color");
      response = await setColor(settings, color);
    }

    // footer
    else if (type === "footer") {
      if (args.length < 2) return message.safeReply("Insufficient arguments! Please provide valid content");
      const content = args.slice(1).join(" ");
      response = await setFooter(settings, content);
    }

    //
    else response = "Invalid command usage!";
    return message.safeReply(response);
  }

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {object} data
   */
  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;

    let response;
    switch (sub) {
      case "preview":
        response = await sendPreview(settings, interaction.member);
        break;

      case "status":
        response = await setStatus(settings, interaction.options.getString("status"));
        break;

      case "channel":
        response = await setChannel(settings, interaction.options.getChannel("channel"));
        break;

      case "desc":
        response = await setDescription(settings, interaction.options.getString("content"));
        break;

      case "thumbnail":
        response = await setThumbnail(settings, interaction.options.getString("status"));
        break;

      case "color":
        response = await setColor(settings, interaction.options.getString("color"));
        break;

      case "footer":
        response = await setFooter(settings, interaction.options.getString("content"));
        break;

      default:
        response = "Invalid subcommand";
    }

    return interaction.followUp(response);
  }
};

async function sendPreview(settings, member) {
  if (!settings.farewell?.enabled) return "Farewell message not enabled in this server";

  const targetChannel = member.guild.channels.cache.get(settings.farewell.channel);
  if (!targetChannel) return "No channel is configured to send farewell message";

  const response = await buildGreeting(member, "FAREWELL", settings.farewell);
  await sendMessage(targetChannel, response);

  return `Sent farewell preview to ${targetChannel.toString()}`;
}

async function setStatus(settings, status) {
  const enabled = status.toUpperCase() === "ON" ? true : false;
  settings.farewell.enabled = enabled;
  await settings.save();
  return `Configuration saved! Farewell message ${status ? "enabled" : "disabled"}`;
}

async function setChannel(settings, channel) {
  if (!canSendEmbeds(channel)) {
    return (
      "Ugh! I cannot send greeting to that channel? I need the `Write Messages` and `Embed Links` permissions in " +
      channel.toString()
    );
  }
  settings.farewell.channel = channel.id;
  await settings.save();
  return `Configuration saved! Farewell message will be sent to ${channel ? channel.toString() : "Not found"}`;
}

async function setDescription(settings, desc) {
  settings.farewell.embed.description = desc;
  await settings.save();
  return "Configuration saved! Farewell message updated";
}

async function setThumbnail(settings, status) {
  settings.farewell.embed.thumbnail = status.toUpperCase() === "ON" ? true : false;
  await settings.save();
  return "Configuration saved! Farewell message updated";
}

async function setColor(settings, color) {
  settings.farewell.embed.color = color;
  await settings.save();
  return "Configuration saved! Farewell message updated";
}

async function setFooter(settings, content) {
  settings.farewell.embed.footer = content;
  await settings.save();
  return "Configuration saved! Farewell message updated";
}
