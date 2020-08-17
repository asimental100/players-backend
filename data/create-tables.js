const client = require('../lib/client');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    await client.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(256) NOT NULL,
                    hash VARCHAR(512) NOT NULL
                );
                CREATE TABLE positions (
                  id SERIAL PRIMARY KEY NOT NULL,
                  name VARCHAR(256) NOT NULL
                );
                CREATE TABLE players (
                    id SERIAL PRIMARY KEY NOT NULL,
                    name VARCHAR(256) NOT NULL,
                    age INTEGER NOT NULL,
                    injured VARCHAR(256) NOT NULL,
                    position_id INTEGER NOT NULL REFERENCES positions(id),
                    owner_id INTEGER NOT NULL REFERENCES users(id)
                );
        `);
    console.log('create tables complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}
