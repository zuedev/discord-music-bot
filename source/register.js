import { REST, Routes } from "discord.js";

export default async function register(client, commands) {
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });

    console.log("Slash commands registered.");
  } catch (error) {
    console.error(error);
  }
}
