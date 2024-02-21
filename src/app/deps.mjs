import dbConnection from '../lib/redisConnection.mjs';
import server from './server.mjs';

export default async () => {
  try {
    const dependencies = [dbConnection, server];

    await Promise.all(dependencies.map((d) => d()));
  } catch (e) {
    console.error('error initialising deps...');
    console.log(e);
  }
};
