# Hypixel Discord Bot

A Discord bot that displays Hypixel player statistics using slash commands.

## Features

- `/list account <username>` - Shows comprehensive Hypixel stats for a player
- Displays SkyBlock profiles and stats
- Shows BedWars, SkyWars, and Duels statistics
- Beautiful embed formatting with player avatars
- Error handling for invalid usernames

## Setup

### Prerequisites

1. **Discord Application & Bot**:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to "Bot" section and create a bot
   - Copy the bot token
   - Copy the Application ID (Client ID)

2. **Hypixel API Key**:
   - Join the Hypixel Minecraft server (`mc.hypixel.net`)
   - Run `/api new` command in-game to generate an API key

### Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   DISCORD_BOT_TOKEN=your_discord_bot_token_here
   HYPIXEL_API_KEY=your_hypixel_api_key_here
   CLIENT_ID=your_discord_application_client_id_here
   ```

4. Build the TypeScript code:
   ```bash
   npm run build
   ```

5. Start the bot:
   ```bash
   npm start
   ```

### Adding Bot to Server

1. Go to Discord Developer Portal → Your Application → OAuth2 → URL Generator
2. Select scopes: `bot` and `applications.commands`
3. Select bot permissions: `Send Messages`, `Use Slash Commands`, `Embed Links`
4. Use the generated URL to invite the bot to your server

## Usage

Once the bot is running and added to your server:

```
/list account <username>
```

Example:
```
/list account Technoblade
```

The bot will display:
- General player information
- SkyBlock profile count and names
- BedWars stats (level, wins, losses, K/D ratio)
- SkyWars stats (wins, losses, kills)
- Duels stats (wins, losses)

## Development

For development with auto-reload:
```bash
npm run dev
```

## Project Structure

```
├── src/
│   └── index.ts          # Main bot code
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── .env                  # Environment variables (create this)
└── README.md
```

## API Information

- **Discord.js**: v14 with slash commands
- **Hypixel API**: Official Hypixel Network API
- **Mojang API**: For username to UUID conversion

## Error Handling

The bot handles various error cases:
- Invalid or non-existent usernames
- Players who have never joined Hypixel
- API rate limits and network issues
- Missing or incomplete player data

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License
