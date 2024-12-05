-- Insert test users
INSERT INTO users (username, password, spotifyClientID, firstName, lastName) VALUES
('john_doe', '$2a$10$3OM8KJMTQ6QxU3U8lIcugO8sz.2CvZDaiHCS288g6bkDHBHt7H0RO', 'spotify-id-001', 'John', 'Doe'),
('jane_smith', '$2a$10$3OM8KJMTQ6QxU3U8lIcugO8sz.2CvZDaiHCS288g6bkDHBHt7H0RO', 'spotify-id-002', 'Jane', 'Smith'),
('alice_wonder', '$2a$10$3OM8KJMTQ6QxU3U8lIcugO8sz.2CvZDaiHCS288g6bkDHBHt7H0RO', 'spotify-id-003', 'Alice', 'Wonder'),
('bob_builder', '$2a$10$3OM8KJMTQ6QxU3U8lIcugO8sz.2CvZDaiHCS288g6bkDHBHt7H0RO', NULL, 'Bob', 'Builder'),
('charlie_brown', '$2a$10$3OM8KJMTQ6QxU3U8lIcugO8sz.2CvZDaiHCS288g6bkDHBHt7H0RO', NULL, 'Charlie', 'Brown');

-- Insert test followers
INSERT INTO followers (followerId, followeeId) VALUES
(1, 2),
(1, 3),
(2, 1),
(2, 3),
(3, 1),
(4, 1),
(5, 2);

-- Insert test songs
INSERT INTO songs (name, artist, link, image_url) VALUES
('Shape of You', 'Ed Sheeran', 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3', 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96'),
('Blinding Lights', 'The Weeknd', 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b', 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36'),
('Bohemian Rhapsody', 'Queen','https://open.spotify.com/track/6l8GvAyoUZwWDgF1e4822w', 'https://i.scdn.co/image/ab67616d0000b2735a7602f0e508660b2ba40f8c'),
('Havana', 'Camila Cabello','https://open.spotify.com/track/1rfofaqEpACxVEHIZBJe6W', 'https://i.scdn.co/image/ab67616d0000b2736eb0b9e73adcf04e4ed3eca4'),
('Stairway to Heaven', 'Led Zeppelin','https://open.spotify.com/track/5CQ30WqJwcep0pYcV4AMNc', 'https://i.scdn.co/image/ab67616d0000b273c8a11e48c91a982d086afc69');

-- Insert test playlists
INSERT INTO playlists (name) VALUES
('Chill Vibes'),
('Workout Playlist'),
('Top Hits 2024'),
('Rock Classics'),
('Pop Favorites');

-- Insert test playlist songs
INSERT INTO playlistSongs (songId, playlistId) VALUES
(1, 1), (2, 1), (3, 1),
(4, 2), (5, 2),
(1, 3), (2, 3), (3, 3), (4, 3), (5, 3),
(3, 4), (5, 4),
(1, 5), (4, 5);

-- Insert test posts
INSERT INTO posts (userId, songId, playlistId, likes) VALUES
(1, 1, NULL, 10),
(2, NULL, 2, 25),
(3, 3, NULL, 15),
(4, 5, NULL, 5),
(5, NULL, 3, 8);

-- Insert test comments
INSERT INTO comments (userId, postId, comment) VALUES
(2, 1, 'Great song!'),
(3, 1, 'Classic Ed Sheeran'),
(1, 2, 'Love this playlist!'),
(4, 3, 'Queen is legendary.'),
(5, 4, 'One of my favorites!'),
(4, 3, 'Great Song.'),
(4, 3, 'Listening to it Right now!');

-- Insert into testing table `users_db`
-- INSERT INTO users_db (name, dob) VALUES
-- ('Emily Davis', '1995-06-12'),
-- ('Michael Brown', '1988-09-23'),
-- ('Sarah Johnson', '2000-11-05'),
-- ('Chris Evans', '1985-02-17'),
-- ('Taylor Swift', '1989-12-13');
