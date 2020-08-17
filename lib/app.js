const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

const fakeUser = {
  id: 1,
  email: 'jon@arbuckle.net',
  hash: '42r8c24',
};

// c_READ_ud
app.get('/players', async(req, res) => {
  const data = await client.query(`
      SELECT player.id, name, age, injured, position.name AS position 
          FROM players AS player
          JOIN positions AS position
          ON player.position_id = position.id
      `);
  
  res.json(data.rows);
});

// c_READ_ud
app.get('/positions', async(req, res) => {
  const data = await client.query(`
      SELECT * FROM positions`);
  
  res.json(data.rows);
});

// c_READ_ud
app.get('/players/:id', async(req, res) => {
  const playerId = req.params.id;

  const data = await client.query(`
      SELECT player.id, name, age, injured, position.name AS position_name 
          FROM players AS player
          JOIN positions AS position
          ON player.position_id=position.id
          WHERE player.id=$1
  `, [playerId]);

  res.json(data.rows[0]);
});

// cru_DELETE_
app.delete('/players/:id', async(req, res) => {
  const playerId = req.params.id;

  const data = await client.query('DELETE FROM players WHERE players.id=$1;', [playerId]);

  res.json(data.rows[0]);
});

// cr_UPDATE_d
app.put('/players/:id', async(req, res) => {
  const playerId = req.params.id;

  try {
    const updatedPlayer = {
      name: req.body.name,
      age: req.body.age,
      injured: req.body.injured,
      position_id: req.body.position_id
    };
  
    const data = await client.query(`
      UPDATE players
        SET name=$1, age=$2, injured=$3, position_id=$4
        WHERE players.id = $5
        RETURNING *
  `, [updatedPlayer.name, updatedPlayer.age, updatedPlayer.injured, updatedPlayer.position_id, playerId]); 
    
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }});

// _CREATE_rud
app.post('/players', async(req, res) => {
  try {
    const realNewPlayer = {
      name: req.body.name,
      age: req.body.age,
      injured: req.body.injured,
      position_id: req.body.position_id
    };
  
    const data = await client.query(`
    INSERT INTO players(name, age, injured, position_id, owner_id)
    VALUES($1, $2, $3, $4, $5)
    RETURNING *
  `, [realNewPlayer.name, realNewPlayer.age, realNewPlayer.injured, realNewPlayer.position_id, fakeUser.id]); 
    
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
