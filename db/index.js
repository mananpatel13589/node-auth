const knex = require('knex');

const db = knex({
  client: 'postgres',
  connection: {
    host: 'localhost',
    port: '5432',
    user: 'postgres',
    password: '',
    database: 'auth',
    charset: 'utf8',
    debug: false
  },
  pool: {
    min: 0,
    max: 50
  },
  useNullAsDefault: true
});

db.raw('select 1+1 as result')
  .then(result => {
    console.log('[db] Connected with db');
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

module.exports = db;
