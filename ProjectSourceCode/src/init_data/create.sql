
CREATE TABLE IF NOT EXISTS users(
    userId SERIAL PRIMARY KEY NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password CHAR(60) NOT NULL,
    spotifyClientID VARCHAR(200),
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS followers(
    followerId INT REFERENCES users(userId) ON DELETE CASCADE,
    followeeId INT REFERENCES users(userId) ON DELETE CASCADE,
    PRIMARY KEY (followerId, followeeId) -- prevents duplicates
);

CREATE TABLE IF NOT EXISTS songs(
    songId SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(200) NOT NULL,
    artist VARCHAR(200) NOT NULL,
    link TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS playlists(
    playlistId SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS playlistSongs(
    songId INT REFERENCES songs(songId) ON DELETE CASCADE,
    playlistId INT REFERENCES playlists(playlistId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts(
    postId SERIAL PRIMARY KEY NOT NULL,
    userId INT REFERENCES users(userId) ON DELETE CASCADE,
    songId INT REFERENCES songs(songId),
    playlistId INT REFERENCES playlists(playlistId),
    likes INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS comments(
    commentId SERIAL PRIMARY KEY NOT NULL,
    userId INT REFERENCES users(userId) ON DELETE CASCADE NOT NULL,
    postId INT REFERENCES posts(postId) ON DELETE CASCADE NOT NULL,
    comment TEXT NOT NULL
);

CREATE VIEW user_follower_count AS
SELECT u.userId, u.username, COUNT(f.followerId) AS follower_count
FROM users u
LEFT JOIN followers f ON u.userId = f.followeeId
GROUP BY u.userId, u.username;

CREATE VIEW user_following_count AS
SELECT u.userId, u.username, COUNT(f.followerId) AS following_count
FROM users u
LEFT JOIN followers f ON u.userId = f.followerId
GROUP BY u.userId, u.username;

-- Use this Query for follower and following count
--COALESCE keeps the query from blowing up. Defaults to 0

-- SELECT 
--     u.userId,
--     u.username,
--     COALESCE(f.follower_count, 0) AS follower_count,
--     COALESCE(g.following_count, 0) AS following_count
-- FROM 
--     users u
-- LEFT JOIN 
--     user_follower_count f ON u.userId = f.userId
-- LEFT JOIN 
--     user_following_count g ON u.userId = g.userId
-- WHERE 
--     u.username = '<username>';