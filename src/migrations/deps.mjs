import dbConnection from '../lib/redisConnection.mjs';
import addFilms from './add-films.mjs';

export default async () => {
  try {
    const dependencies = [dbConnection, addFilms];

    await Promise.all(dependencies.map((d) => d()));
  } catch (e) {
    console.error('error initialising deps...');
    console.log(e);
  }
};
