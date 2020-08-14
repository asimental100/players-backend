require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  beforeAll(done => {
    return client.connect(done);
  });

  beforeEach(() => {
    // TODO: ADD DROP SETUP DB SCRIPT
    execSync('npm run setup-db');
  });

  afterAll(done => {
    return client.end(done);
  });

  test('returns players', async() => {

    const expectation = [
      {
        'name': 'Lionel Messi',
        'age': 33,
        'injured': false,
        'position': 'midfielder'
      },
      {
        'name': 'Cristiano Ronaldo',
        'age': 35,
        'injured': false,
        'position': 'attacker'
      },
      {
        'name': 'Neymar',
        'age': 28,
        'injured': false,
        'position': 'attacker'
      },
      {
        'name': 'Jan Oblak',
        'age': 27,
        'injured': false,
        'position': 'keeper'
      },
      {
        'name': 'Sergio Ramos',
        'age': 34,
        'injured': false,
        'position': 'defender'
      },
      {
        'name': 'Romelu Lukaku',
        'age': 27,
        'injured': false,
        'position': 'attacker'
      },
      {
        'name': 'Diego Godin',
        'age': 34,
        'injured': true,
        'position': 'defender'
      },
      {
        'name': 'Kevin de Bruyne',
        'age': 29,
        'injured': false,
        'position': 'midfielder'
      }
    ];

    const data = await fakeRequest(app)
      .get('/players')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(expectation);
  });
});
