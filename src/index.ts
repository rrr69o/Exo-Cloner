import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface HypixelPlayer {
  displayname: string;
  uuid: string;
  stats?: {
    SkyBlock?: {
      profiles: Record<string, any>;
    };
    Duels?: any;
    BedWars?: any;
    SkyWars?: any;
  };
}

interface HypixelApiResponse {
  success: boolean;
  player: HypixelPlayer | null;
}

class HypixelDiscordBot {
  private client: Client;
  private rest: REST;
  private hypixelApiKey: string;

  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds]
    });

    this.rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!);
    this.hypixelApiKey = process.env.HYPIXEL_API_KEY!;

    this.setupEvents();
    this.registerCommands();
  }

  private setupEvents(): void {
    this.client.once('ready', () => {
      console.log(`✅ Bot logged in as ${this.client.user?.tag}!`);
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      if (interaction.commandName === 'list') {
        await this.handleListCommand(interaction);
      }
    });
  }

  private async registerCommands(): Promise<void> {
    const commands = [
      new SlashCommandBuilder()
        .setName('list')
        .setDescription('List Hypixel player stats')
        .addSubcommand(subcommand =>
          subcommand
            .setName('account')
            .setDescription('Show account stats for a player')
            .addStringOption(option =>
              option
                .setName('username')
                .setDescription('Minecraft username')
                .setRequired(true)
            )
        )
    ];

    try {
      console.log('🔄 Registering application commands...');
      
      await this.rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID!),
        { body: commands }
      );

      console.log('✅ Successfully registered application commands.');
    } catch (error) {
      console.error('❌ Error registering commands:', error);
    }
  }

  private async handleListCommand(interaction: CommandInteraction): Promise<void> {
    const subcommand = interaction.options.data[0];
    
    if (subcommand.name === 'account') {
      const username = subcommand.options?.[0]?.value as string;
      
      await interaction.deferReply();

      try {
        const playerData = await this.getHypixelPlayer(username);
        
        if (!playerData) {
          await interaction.editReply({
            content: `❌ Player "${username}" not found or has never joined Hypixel.`
          });
          return;
        }

        const embed = this.createPlayerStatsEmbed(playerData);
        await interaction.editReply({ embeds: [embed] });
        
      } catch (error) {
        console.error('Error fetching player data:', error);
        await interaction.editReply({
          content: '❌ An error occurred while fetching player data. Please try again later.'
        });
      }
    }
  }

  private async getHypixelPlayer(username: string): Promise<HypixelPlayer | null> {
    try {
      // First get UUID from Mojang API
      const mojangResponse = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`);
      const uuid = mojangResponse.data.id;

      // Then get Hypixel data
      const hypixelResponse = await axios.get<HypixelApiResponse>(
        `https://api.hypixel.net/player?key=${this.hypixelApiKey}&uuid=${uuid}`
      );

      if (!hypixelResponse.data.success || !hypixelResponse.data.player) {
        return null;
      }

      return hypixelResponse.data.player;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  private createPlayerStatsEmbed(player: HypixelPlayer): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle(`📊 Hypixel Stats for ${player.displayname}`)
      .setThumbnail(`https://crafatar.com/avatars/${player.uuid}?size=64`)
      .setFooter({ text: 'Hypixel Network Stats' })
      .setTimestamp();

    // General Info
    embed.addFields({
      name: '🎮 General Info',
      value: `**Username:** ${player.displayname}\n**UUID:** ${player.uuid.slice(0, 8)}...`,
      inline: false
    });

    // SkyBlock Stats
    if (player.stats?.SkyBlock?.profiles) {
      const profiles = Object.keys(player.stats.SkyBlock.profiles);
      const profileCount = profiles.length;
      
      embed.addFields({
        name: '🏝️ SkyBlock',
        value: `**Profiles:** ${profileCount}\n**Profile Names:** ${profiles.slice(0, 3).join(', ')}${profiles.length > 3 ? '...' : ''}`,
        inline: true
      });
    } else {
      embed.addFields({
        name: '🏝️ SkyBlock',
        value: 'No SkyBlock data found',
        inline: true
      });
    }

    // BedWars Stats
    if (player.stats?.BedWars) {
      const bedwars = player.stats.BedWars;
      const wins = bedwars.wins_bedwars || 0;
      const losses = bedwars.losses_bedwars || 0;
      const kills = bedwars.kills_bedwars || 0;
      const deaths = bedwars.deaths_bedwars || 0;
      const level = bedwars.Experience ? Math.floor(bedwars.Experience / 487000) + 1 : 1;

      embed.addFields({
        name: '🛏️ BedWars',
        value: `**Level:** ${level}\n**Wins:** ${wins}\n**Losses:** ${losses}\n**K/D:** ${deaths > 0 ? (kills/deaths).toFixed(2) : kills}`,
        inline: true
      });
    }

    // SkyWars Stats  
    if (player.stats?.SkyWars) {
      const skywars = player.stats.SkyWars;
      const wins = skywars.wins || 0;
      const losses = skywars.losses || 0;
      const kills = skywars.kills || 0;

      embed.addFields({
        name: '☁️ SkyWars',
        value: `**Wins:** ${wins}\n**Losses:** ${losses}\n**Kills:** ${kills}`,
        inline: true
      });
    }

    // Duels Stats
    if (player.stats?.Duels) {
      const duels = player.stats.Duels;
      const wins = duels.wins || 0;
      const losses = duels.losses || 0;

      embed.addFields({
        name: '⚔️ Duels',
        value: `**Wins:** ${wins}\n**Losses:** ${losses}`,
        inline: true
      });
    }

    return embed;
  }

  public async start(): Promise<void> {
    try {
      await this.client.login(process.env.DISCORD_BOT_TOKEN);
    } catch (error) {
      console.error('❌ Failed to start bot:', error);
      process.exit(1);
    }
  }
}

// Start the bot
const bot = new HypixelDiscordBot();
bot.start();
