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

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layout',
  partialsDir: __dirname + '/views/partials',
});
// database configuration
const dbConfig = {
  host: 'db', // the database server dpg-csvofntds78s73enunc0-a
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

const redirect_uri = 'http://localhost:3000/spotify_callback';

app.get('/', (req, res) => {
  if(!req.session.user){
    res.redirect('/login');
  }
  else{
    res.redirect('/explore')
  }
});


app.get('/search', (req, res) => {
  res.render('pages/search');
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
    res.redirect("/explore")
  }
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

async function searchSong(req, songName) {
  const clientId = getClientIdFromCookies(req);
  // const clientId = 'BQB6w_YfPgjwL5hY8nIeCdSmFq1QopegUkV28mfAOLzEglYTZWdB9GkFxmwRH6Sgw8TN86XiL3m4F3M0apAdFiwtkjW45O1-5nPNrt07PYXiIsiA83uf0hhDrWoq-FILm9z8BEF4GDaetyyHG0pK_TjC9_QdyQKiiVSPOxjtUJgU5p8zvW2S9oCB8v7IqYyGmU2J0Qug1ZAQGlTJrxVL4jAbdpo3lgL8SdqUPY54zX8kwSDwuNFtPVsZ7fGSXPa_feeF_r_0S0SPx8CbTQ4oLesbX92aGsPC';
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
        limit: 12
      }
    });
    return response.data.tracks.items;
  } catch (error) {
    console.log("Error searching for song:", error.message);
    return null;
    
  }
}

app.get('/search-song', async (req, res) => {
  if (!req.query.songName) {
    return res.redirect('/search');
  }
  const songName = req.query.songName;
  const tracks = await searchSong(req, songName);
  console.log(tracks);
  if (tracks) {
    res.render('pages/search', { tracks });
  } else {
    res.status(500).send('Error searching for song');
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
  req.session.user = user;
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
    const query = 'INSERT INTO users (username, password, firstName, lastName) VALUES ($1, $2, $3, $4)';
    await db.none(query, [username, hash, firstName, lastName]);

    console.log('User registered successfully.');
    var state = "some_random_state";
    var scope = 'user-read-private user-read-email';

    res.redirect('/spotify_connect');
  } catch (error) {
    console.error('Error during registration:', error);
    res.redirect('/register');
  }
});

app.get('/new_posts', (req, res) => {
  res.render('pages/new_posts');
});

app.post('/new_posts', (req, res) => {
  const songname = req.body.Song_Name;
  searchSong(req, songname)
});

app.get('/explore', async (req, res) => {
  try {
    //Change this to req.session.userId in the future 
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

    const posts = await db.any(query, [userId]);
    console.log(posts);

    res.render('pages/explore', { posts });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post('/new_comment', async (req, res) => {
  try {

    const commentText = req.body.comment;
    const postId = req.body.postId;
    const userId = req.session.user.userid; //Change this to req.session.userId in the future 
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
  app.get('/profile', (req, res) => {
    res.render('pages/profile')
  });


  
  app.get('/profile/:username', async (req, res) =>{
    try {
    const { username } = req.params;

    const query = `
        SELECT 
            u.userId, 
            u.username AS username, 
            u.profile_photo as profile_photo,
            COALESCE(f.follower_count, 0) AS follower_count, 
            COALESCE(g.following_count, 0) AS following_count,
            p.postId,
            p.likes AS likes,
            p.dislikes AS dislikes
        FROM 
            users u
        LEFT JOIN 
            user_follower_count f ON u.userId = f.userId
        LEFT JOIN 
            user_following_count g ON u.userId = g.userId
        LEFT JOIN 
            posts p ON u.userId = p.userId
        WHERE 
            u.username = $1;
    `;

    const posts_query = `
        SELECT 
            posts.postId,
            posts.userId AS authorId,
            users.username AS authorUsername,
            posts.songId,
            songs.name AS songName,
            songs.artist AS songArtist,
            songs.link AS songLink,
            posts.playlistId,
            playlists.name AS playlistName,
            posts.likes
        FROM 
            posts
        INNER JOIN 
            users ON posts.userId = users.userId
        LEFT JOIN 
            songs ON posts.songId = songs.songId
        LEFT JOIN 
            playlists ON posts.playlistId = playlists.playlistId
        WHERE 
            users.username = $1
        ORDER BY 
            posts.postId DESC;
    `;

    console.log(username)

    
    const user_info = await db.any(query, [username]);
    const posts = await db.any(posts_query, [username]);

    

    res.render('pages/profile', {user_info: user_info[0], posts: posts });

    console.log('User Info:', user_info);


  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post('/profile/:username/updatepfp', async (req, res) => {
  const { profile_photo } = req.body;
  const { username } = req.params;

  try {
      const query = `
          UPDATE users
          SET profile_photo = $1
          WHERE username = $2
      `;
      await db.none(query, [profile_photo, username]);
      res.json({ success: true });
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
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

app.listen(3000);