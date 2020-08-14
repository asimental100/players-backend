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
  email: 'jon@doe.com',
  hash: '1234',
};

// c_Read_ud
app.get('/players', async(req, res) => {
  const data = await client.query('SELECT * from players'); // client.query is a function that RETURNS A PROMISE (await or .then)
  
  res.json(data.rows);
});

// c_Read_ud
app.get('/players/:id', async(req, res) => {
  const playerId = req.params.id;

  const data = await client.query(`SELECT * from players where id=${playerId}`);
  
  res.json(data.rows[0]);
});

// _Create_rud
app.post('/players', async(req, res) => {
  const realNewPlayer = {
    name: req.body.name,
    age: req.body.age,
    injured: req.body.injured,
    position: req.body.position
  };

  const data = await client.query(`
  INSERT INTO players(name, age, injured, position, owner_id)
  VALUES($1, $2, $3, $4, $5)
  RETURNING *
`, [realNewPlayer.name, realNewPlayer.age, realNewPlayer.injured, realNewPlayer.position, fakeUser.id]);
  
  res.json(data.rows[0]);
});

app.use(require('./middleware/error'));

module.exports = app;
