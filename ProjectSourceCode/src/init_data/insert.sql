-- Insert test users
INSERT INTO users (username, password, spotifyClientID, firstName, lastName) VALUES
('john_doe', 'password123', 'spotify-id-001', 'John', 'Doe'),
('jane_smith', 'password123', 'spotify-id-002', 'Jane', 'Smith'),
('alice_wonder', 'password123', 'spotify-id-003', 'Alice', 'Wonder'),
('bob_builder', 'password123', NULL, 'Bob', 'Builder'),
('charlie_brown', 'password123', NULL, 'Charlie', 'Brown');

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
('Shape of You', 'Ed Sheeran', 'https://example.com/shape-of-you', 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96'),
('Blinding Lights', 'The Weeknd', 'https://example.com/blinding-lights', 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96'),
('Bohemian Rhapsody', 'Queen', 'https://example.com/bohemian-rhapsody', 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96'),
('Havana', 'Camila Cabello', 'https://example.com/havana', 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96'),
('Stairway to Heaven', 'Led Zeppelin', 'https://example.com/stairway-to-heaven', 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96');

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
