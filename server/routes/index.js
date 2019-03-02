const express = require('express');
const router = express.Router();
const pg = require('pg');
const connectionString = 'postgres://localhost:5432/videoDB';

router.get('/users/:user_id', (req, res, next) => {
  const results = [];
  // Get a Postgres client from the connection pool
  const id = req.params.user_id;
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    // user country
    const query = client.query('SELECT country FROM users WHERE user_id=($1)',
    [id]);
    // // videos uploaded
    // const query = client.query('SELECT video_id FROM videos WHERE user_id=($1)',
    // [id]);
    // // videos watched
    // const query = client.query('SELECT video_id FROM user_watched WHERE user_id=($1)',
    // [id]);
    // // videos liked
    // const query = client.query('SELECT video_id FROM user_liked WHERE user_id=($1)',
    // [id]);
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

router.patch('/users/:user_id', (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters
  const id = req.params.user_id;
  // Grab data from http request
  const data = {country: req.body.country};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Update Data
    client.query('UPDATE users SET country=($1) WHERE id=($2)',
    [data.country, id]);
    // SQL Query > Select Data
    const query = client.query("SELECT * FROM users ORDER BY id ASC");
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', function() {
      done();
      return res.json(results);
    });
  });
});

router.delete('/users/:user_id', (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters
  const id = req.params.user_id;
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Delete Data
    client.query('DELETE FROM users WHERE id=($1)', [id]);
    // SQL Query > Select Data
    var query = client.query('SELECT * FROM users ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

router.post('/users', (req, res, next) => {
  const results = [];
  // Grab data from http request
  const data = {text: req.body.country};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Insert Data
    client.query('INSERT INTO users(user_id, country) values(SELECT MAX(user_id) + 1 FROM USERS, $1)',
    data.country);
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM items ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

router.get('/videos/:video_id', (req, res, next) => {
  const results = [];
  const id = req.params.video_id;
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT user_id FROM user_watched ORDER BY num_views DESC LIMIT 5');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

router.get('/countries/:name', (req, res, next) => {
  const results = [];
  // Get a Postgres client from the connection pool
  const country = req.params.name;
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT id FROM users WHERE country=($1)',
    [country]);
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

router.get('/top', (req, res, next) => {
  const results = [];
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT video_id FROM user_watched ORDER BY num_views DESC LIMIT 5');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

module.exports = router;
