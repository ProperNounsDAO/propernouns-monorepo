import dotenv from 'dotenv';

dotenv.config();

export const config = {
  redisPort: Number(process.env.REDIS_PORT ?? 6379),
  redisHost: process.env.REDIS_HOST ?? 'localhost',
  redisDb: Number(process.env.REDIS_DB ?? 0),
  redisPassword: process.env.REDIS_PASSWORD,
  nounsSubgraph:
    process.env.NOUNS_SUBGRAPH_URL ??
    'https://api.studio.thegraph.com/query/30189/proper-nouns-subgraph/v0.0.6',
  twitterEnabled: process.env.TWITTER_ENABLED === 'true',
  twitterAppKey: process.env.TWITTER_APP_KEY ?? '',
  twitterAppSecret: process.env.TWITTER_APP_SECRET ?? '',
  twitterAccessToken: process.env.TWITTER_ACCESS_TOKEN ?? '',
  twitterAccessSecret: process.env.TWITTER_ACCESS_SECRET ?? '',
  nounsTokenAddress:
    process.env.NOUNS_TOKEN_ADDRESS ?? '0x43F4c01b7D3E11914B79f77aD88ED91c82Ab04c0',
  jsonRpcUrl: process.env.JSON_RPC_URL ?? 'http://localhost:8545',
  discordEnabled: process.env.DISCORD_ENABLED === 'true',
  discordWebhookToken: process.env.DISCORD_WEBHOOK_TOKEN ?? '',
  discordWebhookId: process.env.DISCORD_WEBHOOK_ID ?? '',
  discordPublicWebhookToken: process.env.DISCORD_PUBLIC_WEBHOOK_TOKEN ?? '',
  discordPublicWebhookId: process.env.DISCORD_PUBLIC_WEBHOOK_ID ?? '',
  pinataEnabled: process.env.PINATA_ENABLED === 'true',
  pinataApiKey: process.env.PINATA_API_KEY ?? '',
  pinataApiSecretKey: process.env.PINATA_API_SECRET_KEY ?? '',
};
