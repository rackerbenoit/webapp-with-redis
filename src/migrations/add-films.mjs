import { client, initialConnect } from '../lib/redisConnection.mjs';

let connectionErr = false;
let connectionErrMsg;
client.on('error', (err) => {
  if (initialConnect) {
    connectionErr = true;
    connectionErrMsg = err;
  }
});

export default async function addFilms() {
  const imdbTop10 = [
    'The Shawshank Redemption',
    'The Godfather',
    'The Dark Knight',
    "Schindler's List",
    'The Lord of the Rings: The Return of the King',
    'The Godfather Part II',
    '12 Angry Men',
    'The Lord of the Rings: The Fellowship of the Ring',
    'Pulp Fiction',
    'Inception',
  ];

  const entries = await client.lrange('films', 0, 100);

  for (const title of imdbTop10) {
    if (!entries.includes(title)) {
      await client.lpush(['films', title]);
    }
  }

  console.log('Done!');
  process.exit(0);
}
