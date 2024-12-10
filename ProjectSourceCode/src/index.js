const express = require('express'); // To build an application server or API
const app = express();
const axios = require('axios');
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcryptjs'); //  To hash passwords

Handlebars.registerHelper('json', function (context) {
  return JSON.stringify(context);
});

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layout',
  partialsDir: __dirname + '/views/partials',
});
// database configuration
const dbConfig = {
  host: 'dpg-ctbsp6rtq21c73dfmqr0-a', // the database server dpg-csvofntds78s73enunc0-a
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
app.use(express.static(__dirname, + '/resources'));

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const redirect_uri = 'https://spotu-012-group-1.onrender.com/spotify_callback';

function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

app.get('/', (req, res) => {
  const loggedIn = Boolean(req.session.userId);  // Convert to Boolean to ensure it's true/false
  if (!req.session.userId) {
    return res.redirect('/login');  // If not logged in, redirect to login
  } else {
    return res.redirect('/explore');  // If logged in, redirect to 'explore'
  }
});

// LOGIN ROUTES
// render login page
app.get('/login', (req, res) => {
  res.render('pages/login');
});

// login submission
app.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // look for user
  const userQuery = 'SELECT * FROM users WHERE username = $1 LIMIT 1';
  const user = await db.oneOrNone(userQuery, [username]);
  if (!user) {
    return res.render('pages/login', {
      error: 'This User does not exist,',
      message: 'User does not exist'
    });
  }

  // check if password matches with username
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.render('pages/login', {
      error: 'Invalid Username/Password.',
      message: 'Invalid Username/Password'
    });
  }
  req.session.userId = user.userid;
  req.session.username = username;
  req.session.save();

  res.redirect('/spotify_connect');// redirect to spotify connect page
});

app.get('/register', (req, res) => {
  res.render('pages/register');
});

app.post('/register', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;

  try {
    const hash = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, password, firstName, lastName) VALUES ($1, $2, $3, $4) RETURNING userId';
    await db.one(query, [username, hash, firstName, lastName]);

    console.log('User registered successfully.');
    var state = "some_random_state";
    var scope = 'user-read-private user-read-email';

    res.redirect('/spotify_connect');
  } catch (error) {
    console.error('Error during registration:', error);
    res.redirect('/register');
  }
});

app.get('/spotify_connect', function (req, res) {
  const scope = 'user-read-private user-read-email';

  res.redirect('https://accounts.spotify.com/authorize?' +
    'response_type=code&' +
    `client_id=${process.env.SPOTIFY_CLIENT_ID}&` +

    `scope=${scope}&` +
    `redirect_uri=${redirect_uri}&`
  );
});

app.get('/spotify_callback', async function (req, res) {
  var code = req.query.code || null;

  if (code === null) {
    //TODO: Display a better error message
    console.log("Some error has occured")
  } else {
    const token_url = 'https://accounts.spotify.com/api/token';
    const data = {
      "grant_type": "authorization_code",
      "code": code,
      "redirect_uri": redirect_uri
    }


    const response = await axios.post(token_url, data, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`, 'utf-8').toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    //return access token
    console.log(response.data.access_token)
    res.cookie("clientId", response.data.access_token)
    res.redirect("/")
  }
});

app.use(isAuthenticated);

app.get('/welcome', (req, res) => {
  res.json({ status: 'success', message: 'Welcome!' });
});

app.get('/search', (req, res) => {
  res.render('pages/search');
});

function getClientIdFromCookies(req) {
  return req.headers.cookie.split("clientId=")[1]
}


async function getUserProfile(req) {
  const clientId = getClientIdFromCookies(req);
  if (!clientId) {
    console.log("Error getting clientId from cookie");
    return null;
  }
  const url = "https://api.spotify.com/v1/me";
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${clientId}`
      }
    });
    return response.data;
  } catch (error) {
    console.log("Error fetching user profile:", error.message);
    return null;
  }
}

let storedTracks = [];

app.get('/search-song', async (req, res) => {
  if (!req.query.songName) {
    return res.redirect('/search');
  }

  const songName = req.query.songName;
  const tracks = await searchSong(req, songName);

  if (tracks) {
    // Temporarily store the tracks in-memory
    storedTracks = tracks; // Overwrite stored tracks with new search results

    res.render('pages/search', { tracks });
  } else {
    res.status(500).send('Error searching for song');
  }
});

async function searchSong(req, songName) {
  const clientId = getClientIdFromCookies(req);
  if (!clientId) {
    console.log("Error getting clientId from cookie");
    return null;
  }

  const url = "https://api.spotify.com/v1/search";
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${clientId}`
      },
      params: {
        q: songName,
        type: 'track',
        limit: 36
      }
    });
    return response.data.tracks.items;
  } catch (error) {
    console.log("Error searching for song:", error.message);
    return null;
  }
}

app.get('/get-track-details', async (req, res) => {
  const trackId = req.query.trackId; // Get the trackId from the query parameter

  if (!trackId) {
    return res.status(400).send('Track ID is required');
  }

  const new_post_details = await getTrackDetails(req, trackId);
  if (new_post_details) {
    // Render a new page with the track details
    const currentUsername = req.session.username
    const trackImageUrl = new_post_details.album.images.length > 0 ? new_post_details.album.images[0].url : '';
    res.render('pages/new_posts', {
      track: new_post_details,
      track_image: trackImageUrl,
      username: currentUsername
    });
  } else {
    res.status(500).send('Error fetching track details');
  }
});

// Function to fetch detailed information about a track from Spotify API
async function getTrackDetails(req, trackId) {
  const clientId = getClientIdFromCookies(req);
  if (!clientId) {
    console.log("Error getting clientId from cookie");
    return null;
  }

  const url = `https://api.spotify.com/v1/tracks/${trackId}`;
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${clientId}`
      }
    });
    return response.data; // Return the detailed track information
  } catch (error) {
    console.log("Error fetching track details:", error.message);
    return null;
  }
}

app.post('/new_post', async (req, res) => {
  const song_name = req.body.track_name;
  const artist = req.body.track_artists;
  const song_link = req.body.track_uri;
  const song_image = req.body.track_image;
  const userid = req.session.userId;

  try {
    const songQuery = 'INSERT INTO songs (name, artist, link, image_url) VALUES ($1, $2, $3, $4) RETURNING songId';
    const songResult = await db.one(songQuery, [song_name, artist, song_link, song_image]);
    const songid = songResult.songid;

    // Insert the post into the posts table
    const postQuery = 'INSERT INTO posts (userId, songId, playlistId, likes) VALUES ($1, $2, $3, $4) RETURNING postId';
    const postResult = await db.one(postQuery, [userid, songid, null, 0]);
    console.log(postResult)

    // Return success response
    res.redirect('/explore')

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create song and post' });
  }
});

app.get('/explore', async (req, res) => {
  try {
    // Retrieve the userId from session
    const userId = req.session.userId;
    const query = `
      SELECT 
        posts.postId,
        posts.userId AS authorId,
        users.username AS authorUsername,
        posts.songId,
        songs.name AS songName,
        songs.artist AS songArtist,
        songs.link AS songLink,
        songs.image_url AS songImage,
        posts.playlistId,
        playlists.name AS playlistName,
        posts.likes,
        (SELECT json_agg(
            json_build_object(
                'commentId', comments.commentId,
                'userId', comments.userId,
                'comment', comments.comment,
                'commentAuthor', users.username
            )
        )
        FROM comments 
        INNER JOIN users ON comments.userId = users.userId
        WHERE comments.postId = posts.postId) AS comments
      FROM 
        posts
      INNER JOIN 
        users ON posts.userId = users.userId
      LEFT JOIN 
        songs ON posts.songId = songs.songId
      LEFT JOIN 
        playlists ON posts.playlistId = playlists.playlistId
      ORDER BY 
        posts.postId DESC;
    `;

    // Execute query
    const posts = await db.any(query, [userId]);

    console.log(posts)

    // If there are no posts, send an empty array
    if (!posts || posts.length === 0) {
      return res.render('pages/explore', { posts: [] });
    }

    // Format posts and handle potential null comments
    const formattedPosts = posts.map(post => ({
      ...post,
      comments: post.comments ? post.comments : []
    }));

    // Render the 'explore' page with the posts data
    res.render('pages/explore', { posts: formattedPosts });

  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).send('Server Error');
  }
});

app.post('/new_comment', async (req, res) => {
  try {

    const commentText = req.body.comment;
    const postId = req.body.postId;
    const userId = req.session.userId;
    console.log(userId)
    console.log(req.session);

    console.log(commentText, postId, userId);
    // Validation
    if (!commentText || commentText.trim() === '') {
      return res.status(400).json({
        error: 'Comment cannot be empty'
      });
    }

    // Insert into DB
    const query = `
      INSERT INTO comments (userId, postId, comment) 
      VALUES ($1, $2, $3) 
      RETURNING commentId`;

    await db.one(query, [userId, postId, commentText]);

    res.redirect('back');
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      error: 'Failed to add comment',
      details: error.message
    });
  }
});


// inilize the profile page
app.get('/profile', async (req, res) => {
  try {
    // Retrieve the userId from the session
    const userId = req.session.userId;

    // Query to fetch posts associated with the logged-in user
    const postsQuery = `
        SELECT 
          posts.postId,
          posts.userId AS authorId,
          users.username AS authorUsername,
          posts.songId,
          songs.name AS songName,
          songs.artist AS songArtist,
          songs.link AS songLink,
          songs.image_url AS songImage,
          posts.playlistId,
          playlists.name AS playlistName,
          posts.likes,
          (SELECT json_agg(
              json_build_object(
                  'commentId', comments.commentId,
                  'userId', comments.userId,
                  'comment', comments.comment,
                  'commentAuthor', users.username
              )
          )
          FROM comments 
          INNER JOIN users ON comments.userId = users.userId
          WHERE comments.postId = posts.postId) AS comments
        FROM 
          posts
        INNER JOIN 
          users ON posts.userId = users.userId
        LEFT JOIN 
          songs ON posts.songId = songs.songId
        LEFT JOIN 
          playlists ON posts.playlistId = playlists.playlistId
        WHERE 
          posts.userId = $1 
        ORDER BY 
          posts.postId DESC;
      `;

    const posts = await db.any(postsQuery, [userId]);

    // Query to count how many people the user is following
    const followingCountQuery = `
        SELECT COUNT(*) AS followingCount
        FROM followers
        WHERE followerId = $1;
      `;
    const followingCountResult = await db.one(followingCountQuery, [userId]);
    const followingCount = followingCountResult.followingcount;

    // Query to count how many people follow  the user
    const followersCountQuery = `
       SELECT COUNT(*) AS followersCount
       FROM followers
       WHERE followeeId = $1;
     `;
    const followersCountResult = await db.one(followersCountQuery, [userId]);
    const followersCount = followersCountResult.followerscount;
    // If there are no posts, send an empty array
    if (!posts || posts.length === 0) {
      return res.render('pages/profile', { posts: [], followingCount, followersCount });
    }

    // Format posts and handle potential null comments
    const formattedPosts = posts.map(post => ({
      ...post,
      comments: post.comments ? post.comments : []
    }));

    // Render the profile page with posts and following count
    res.render('pages/profile', { posts: formattedPosts, followingCount, followersCount });

  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).send('Server Error');
  }
});


app.post('/update-profile-photo', async (req, res) => {
  const userId = req.session.userId;
  const newProfilePhoto = req.body.newProfilePhoto;
  try {
    // Update profile photo in the database for the given userId
    const result = await db.any(
      'UPDATE users SET profile_photo = $1 WHERE userId = $2 RETURNING profile_photo',
      [newProfilePhoto, userId]
    );
    res.json({
      success: true,
      profile_photo: result[0].profile_photo,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating profile photo' });
  }
});


app.get('/edit', (req, res) => {
  res.render('pages/edit')
});
// authentication
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

app.use(auth);

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Failed to log out.');
    }
    res.redirect('/login');  // Redirect to login page after logging out
  });
});

module.exports = app.listen(3000);