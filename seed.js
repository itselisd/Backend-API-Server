const fs = require('fs');

var stream = fs.createWriteStream("seedfile.sql", { flags:'a' });

let lineReader = require('readline').createInterface({
  input: fs.createReadStream('svc_data')
});

stream.write(`DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS videos;
  DROP TABLE IF EXISTS user_watched;
  DROP TABLE IF EXISTS user_liked;

  CREATE TABLE users (
    user_id INTEGER,
    country VARCHAR(5) DEFAULT NULL,
    PRIMARY KEY (user_id)
    );

  CREATE TABLE videos (
    video_id INTEGER,
    user_id INTEGER
  );

  CREATE TABLE user_watched (
    user_id INTEGER,
    video_id INTEGER
  );

  CREATE TABLE user_liked (
    user_id INTEGER,
    video_id INTEGER
  );

  TRUNCATE table user_watched, user_liked, videos, users;

`)

lineReader.on('line', function (line) {
  let tokens = line.split(' ');
  let recordType = tokens[1];
  switch (recordType) {
    case "REGISTER":
      stream.write("INSERT INTO users (user_id, country) VALUES (" + tokens[2] + ", '" + tokens[3] + "');\n");
      break;
    case "UPLOAD":
      stream.write("INSERT INTO videos (video_id, user_id) VALUES (" + tokens[2] + ", " + tokens[3] + ");\n");
      break;
    case "WATCH":
      stream.write("INSERT INTO user_watched (user_id, video_id) VALUES (" + tokens[2] + ", " + tokens[3] + ");\n");
      break;
    case "LIKE":
      stream.write("INSERT INTO user_liked (user_id, video_id) VALUES (" + tokens[2] + ", " + tokens[3] + ");\n");
      break;
  }

});
