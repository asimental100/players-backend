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

app.use('/auth', authRoutes);

app.use('/api', ensureAuth);

app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

const fakeUser = {
  id: 1,
  email: 'jon@doe.org',
  hash: '1234',
};

//READ
app.get('/players', async(req, res) => {
  try {
    const data = await client.query(`
        SELECT players.id, players.name, age, injured, positions.name AS position_name 
            FROM players
            JOIN positions
            ON players.position_id = positions.id
        `);
    
    res.json(data.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

//READ
app.get('/positions', async(req, res) => {
  try {
    const data = await client.query(`
        SELECT * FROM positions`);
    
    res.json(data.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

//READ
app.get('/players/:id', async(req, res) => {
  try {
    const playerId = req.params.id;
  
    const data = await client.query(`
        SELECT players.id, players.name, age, injured, positions.name AS position_name 
            FROM players
            JOIN positions
            ON players.position_id=positions.id
            WHERE players.id=$1
    `, [playerId]);
  
    res.json(data.rows[0]);  
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

//DELETE
app.delete('/players/:id', async(req, res) => {
  try {
    const playerId = req.params.id;
  
    const data = await client.query('DELETE FROM players WHERE players.id=$1;', [playerId]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

//UPDATE
app.put('/players/:id', async(req, res) => {
  try {
    const playerId = req.params.id;

    const updatedPlayer = {
      name: req.query.name,
      age: req.query.age,
      injured: req.query.injured,
      position_id: req.query.position_id
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

//CREATE
app.post('/players', async(req, res) => {
  try {
    const realNewPlayer = {
      name: req.query.name,
      age: req.query.age,
      injured: req.query.injured,
      position_id: req.query.position_id
    };
  
    const data = await client.query(`
    INSERT INTO players (name, age, injured, owner_id, position_id)
    VALUES($1, $2, $3, $4, $5)
    RETURNING *
  `, [realNewPlayer.name, realNewPlayer.age, realNewPlayer.injured, fakeUser.id, realNewPlayer.position_id]); 
    
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
