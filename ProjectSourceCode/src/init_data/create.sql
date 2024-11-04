
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
    likes INT NOT NULL
);

CREATE TABLE IF NOT EXISTS comments(
    commentId SERIAL PRIMARY KEY NOT NULL,
    userId INT REFERENCES users(userId) ON DELETE CASCADE NOT NULL,
    postId INT REFERENCES posts(postId) ON DELETE CASCADE NOT NULL,
    comment TEXT NOT NULL
);