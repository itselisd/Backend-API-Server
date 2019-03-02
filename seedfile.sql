DROP TABLE IF EXISTS users;
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

