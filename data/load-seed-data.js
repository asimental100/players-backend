const client = require('../lib/client');
// import our seed data:
const players = require('./players.js');
const usersData = require('./users.js');
const positions = require('./positions.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      positions.map(position => {
        return client.query(`
                      INSERT INTO positions (name)
                      VALUES ($1);
                    `,
        [position.name]);
      })
    );

    await Promise.all(
      players.map(player => {
        return client.query(`
                    INSERT INTO players (name, age, injured, owner_id, position_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [player.name, player.age, player.injured, user.id, player.position_id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
