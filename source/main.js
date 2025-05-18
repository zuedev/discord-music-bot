import {
  Client,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
  MessageFlags,
} from "discord.js";
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from "@discordjs/voice";
import { execSync } from "child_process";
import fs from "fs";
import register from "./register.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

const commands = [
  [
    new SlashCommandBuilder()
      .setName("play")
      .setDescription("Plays a song in the voice channel you are in.")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("youtube")
          .setDescription("Plays a song from YouTube.")
          .addStringOption((option) =>
            option
              .setName("url")
              .setDescription("The URL of the YouTube video.")
              .setRequired(true)
          )
      ),
    async (interaction) => {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === "youtube") {
        const url = interaction.options.getString("url");

        // is this a youtube link?
        if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
          return interaction.editReply({
            content: "Please provide a valid YouTube URL.",
          });
        }

        // extract video ID from URL
        const videoId =
          url.split("v=")[1]?.split("&")[0] || url.split("/").pop();

        if (!videoId) {
          return interaction.editReply({
            content: "Please provide a valid YouTube URL.",
          });
        }

        // check if video ID is valid
        const videoInfo = await execSync(
          `yt-dlp --get-id ${url}`,
          { encoding: "utf-8" },
          (error) => {
            if (error) {
              console.error("Error getting video ID:", error);
              return interaction.editReply({
                content: "Error getting video ID.",
              });
            }
          }
        );

        if (!videoInfo) {
          return interaction.editReply({
            content: "Please provide a valid YouTube URL.",
          });
        }

        let song = `./tmp/youtube/${videoId}.opus`;
        // does song exist already?
        if (fs.existsSync(song)) {
          interaction.editReply({
            content: "Song already exists in cache, playing it.",
          });
        }
        // if not, download it
        else {
          try {
            interaction.editReply({
              content: "Downloading song...",
            });

            await execSync(
              `yt-dlp -x --audio-format opus --audio-quality 0 -o "${song}" ${url}`
            );

            interaction.editReply({
              content: "Song downloaded and cached.",
            });
          } catch (error) {
            console.error("Error downloading song:", error);
            return interaction.editReply({
              content: "Error downloading song.",
            });
          }
        }

        // does song exist now?
        if (!fs.existsSync(song)) {
          return interaction.editReply({
            content: "Song not found.",
          });
        }

        const channel = interaction.member.voice.channel;

        if (!channel) {
          return interaction.editReply({
            content: "You need to be in a voice channel to play a song.",
          });
        }

        const connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer({
          behaviors: {
            noSubscriber: AudioPlayerStatus.Idle,
          },
        });

        const resource = createAudioResource(song, {
          inlineVolume: true,
        });

        connection.subscribe(player);

        player.play(resource);
      }
    },
  ],
  [
    new SlashCommandBuilder()
      .setName("stop")
      .setDescription("Stops the song and leaves the voice channel."),
    async (interaction) => {
      const channel = interaction.member.voice.channel;

      if (!channel) {
        return interaction.editReply({
          content: "You need to be in a voice channel to stop the song.",
        });
      }

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      connection.destroy();

      interaction.editReply({
        content: "Stopped the song and left the voice channel.",
      });
    },
  ],
];

client.on(Events.ClientReady, async (readyClient) => {
  console.log(
    `Logged in as ${readyClient.user.tag}! Here's my invite link: https://discord.com/oauth2/authorize?client_id=${readyClient.user.id}&scope=bot%20applications.commands&permissions=3145728`
  );

  await register(readyClient, [
    ...commands.map((command) => command[0].toJSON()),
  ]);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (!process.env.DISCORD_ID_WHITELIST.includes(interaction.guild.id))
    return interaction.editReply({
      content:
        "This guild isn't whitelisted to use this bot. Contact <@723361818940276736> to purchase your own instance, or [build me from source](<https://github.com/zuedev/DiscordJockey>).",
    });

  try {
    if (
      commands.some((command) => command[0].name === interaction.commandName)
    ) {
      const command = commands.find(
        (command) => command[0].name === interaction.commandName
      );
      await command[1](interaction);
    } else {
      await interaction.editReply({
        content: "Command not found.",
      });
    }
  } catch (error) {
    console.error("Error executing command:", error);

    await interaction.editReply({
      content: "Error executing command. I've notified my developer.",
    });
  }
});

client.login(process.env.TOKEN);
