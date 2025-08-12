<img src="avatar.png" height="100px"/>

# Discord Music Bot

> A Discord music bot that actually works.

## Installation

The bot can be installed either by inviting it to your server or by self-hosting it.

### Official Public Instance

You can invite the official public instance of the bot to your server using the following link:

[Invite Bot](https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot&permissions=YOUR_PERMISSIONS)

### Self-Hosting

If you prefer to self-host the bot, you can do so by using Docker:

1. Clone the repository:

```bash
git clone https://github.com/zuedev/discord-music-bot.git
cd discord-music-bot
```

2. Build the Docker image:

```bash
docker build -t discord-music-bot .
```

3. Create a `.env` file in the root directory and add your Discord bot token:

```env
DISCORD_BOT_TOKEN=abcdef123456
```

4. Start the bot:

```bash
docker run -d --name discord-music-bot --env-file .env discord-music-bot
```

## Development

**This project is mirrored!** Please do not push directly to this repository. Instead, format your changes using [`git format-patch`](https://git-scm.com/docs/git-format-patch) and send them to me via [email](mailto:git@zue.dev) or [Discord](https://discord.com/users/723361818940276736).
