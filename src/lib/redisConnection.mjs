import { Redis } from 'ioredis';

const connectionDetails = process.env.CONNECTION_STRING;
const sentinelHost = process.env.SENTINEL_HOST;
const sentinelPort = process.env.SENTINEL_PORT ?? 26379;
const sentinelName = process.env.SENTINEL_NAME;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const usernameSentinel = process.env.SENTINEL_USERNAME;
const passwordSentinel = process.env.SENTINEL_PASSWORD;
const tls = process.env.TLS_ENABLED;

const sentinelEnabled = sentinelHost !== undefined;
const normalModeEnabled = connectionDetails !== undefined;
const url = normalModeEnabled && new URL(connectionDetails);

let initialConnect = false;

const redisOptionsNormal = normalModeEnabled
  ? {
      host: url.hostname,
      port: url.port,
      username: url.username,
      password: url.password,
      ...(url.protocol === 'rediss:' && {
        tls: { servername: url.hostname },
      }),
    }
  : {};

const redisOptionsSentinel = {
  username,
  password,
  sentinelUsername: usernameSentinel ?? username,
  sentinelPassword: passwordSentinel ?? password,
  sentinels: [{ host: sentinelHost, port: sentinelPort }],
  name: sentinelName,
  ...(tls === 'true' && {
    tls: { servername: sentinelHost },
    sentinelTLS: { servername: sentinelHost },
    enableTLSForSentinelMode: true,
  }),
};

let redisOptions = sentinelEnabled ? redisOptionsSentinel : redisOptionsNormal;
console.log(
  sentinelEnabled
    ? `Connecting via sentinel (${sentinelHost}:${sentinelPort}->${sentinelName}}})`
    : `Connecting to: ${connectionDetails}`
);
const client = new Redis(redisOptions);

const INIT_REDIS = async () => {
  initialConnect = true;
  let info = await client.info();
  console.log('connected, ', info.split('\n')[1]);
  return client;
};

export default async () => {
  await INIT_REDIS();
};

export { client, initialConnect };
