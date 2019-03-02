const express = require('express');
const router = express.Router();
const pg = require('pg');
const connectionString = 'postgres://localhost:5432/videoDB';

router.get('/users/:user_id', (req, res, next) => {
  // return country, videos uploaded, videos liked
  const id = req.params.user_id;

  const result = {
    id: id,
    country: null,
    total_videos_uploaded: null,
    videos_uploaded: [],
    total_videos_watched: null,
    videos_watched: [],
    total_videos_liked: null,
    videos_liked: []
  };

  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    // SQL Query > Select Data
    let query1 = client.query('SELECT country FROM users WHERE user_id=($1)', [id]); // country
    let query2 = client.query('SELECT video_id FROM videos WHERE user_id=($1)', [id]); // uploaded videos
    let query3 = client.query('SELECT video_id FROM user_watched WHERE user_id=($1)', [id]); // watched videos
    let query4 = client.query('SELECT video_id FROM user_liked WHERE user_id=($1)', [id]); // liked videos

    let count = 4;

    query1.on('end', endHandler);
    query2.on('end', endHandler);
    query3.on('end', endHandler);
    query4.on('end', endHandler);

    query1.on('row', row => result.country = row.country);
    query2.on('row', row => result.videos_uploaded.push(row.video_id));
    query3.on('row', row => result.videos_watched.push(row.video_id));
    query4.on('row', row => result.videos_liked.push(row.video_id));

    function endHandler () {
      count--; // decrement count by 1
      if (count === 0) {
        done();
        result.total_videos_uploaded = result.videos_uploaded.length;
        result.total_videos_liked = result.videos_liked.length;
        result.total_videos_watched = result.videos_watched.length;
        return res.json(result);
      }
   }
  });
});

router.patch('/users/:user_id', (req, res, next) => {
// Grab data from the URL parameters
  const id = req.params.user_id;
  // Grab data from http request
  const country = req.body.country;
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Update Data
    const query = client.query('UPDATE users SET country=($1) WHERE user_id=($2)',
    [country, id]);
    query.on('end', () => {
      return res.status(200).json({success: true, data: `User with id ${id} country patched to ${country}`});
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
    const query = client.query('DELETE FROM users WHERE user_id=($1)', [id]);
    query.on('end', () => {
      return res.status(200).json({success: true, data: `User with id ${id} deleted from DB`});
    });


    // // SQL Query > Select Data
    // var query = client.query('SELECT * FROM users ORDER BY id ASC');
    // // Stream results back one row at a time
    // query.on('row', (row) => {
    //   results.push(row);
    // });
    // // After all data is returned, close connection and return results
    // query.on('end', () => {
    //   done();
    //   return res.json(results);
    // });
  });
});

router.post('/users', (req, res, next) => {
  // Grab data from http request
  const country = req.body.country;
  const results = {user_id: null, country: country};

  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    // make new user_id by grabbing existing max in DB and insert new user in DB
    let query = client.query('SELECT MAX(user_id) + 1 as new_id FROM users LIMIT 1');
    query.on('row', (row) => {
      results.user_id = row.new_id;
    });
    query.on('end', () => {
      let query2 = client.query('INSERT INTO users(user_id, country) values($1, $2)', [results.user_id, country]);
      query2.on('end', () => {
        done();
        return res.json(results);
      });
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
  const country = req.params.name;
  const results = {country: country, total_users: null, user_ids:[]};
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query(`SELECT user_id FROM users WHERE country=($1)`, [country]);
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.user_ids.push(row.user_id);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      results.total_users = results.user_ids.length;
      done();
      return res.json(results);
    });
  });
});

router.get('/top', (req, res, next) => {
  const results = {video_ids:[]}
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT video_id, COUNT(*) FROM user_watched GROUP BY video_id ORDER BY 2 DESC LIMIT 5');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.video_ids.push(row.video_id);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

module.exports = router;
