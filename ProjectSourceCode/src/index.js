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
    host: 'db', // the database server
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

var redirect_uri = 'http://localhost:3000/spotify_callback';

  app.get('/', (req,res) => {
    res.redirect('/login');
  });

// app.get('/login', function(req, res) {

//   var state = "some_random_state";
//   var scope = 'user-read-private user-read-email';

//   res.redirect('https://accounts.spotify.com/authorize?' +
//       'response_type=code&'+
//       `client_id=${process.env.SPOTIFY_CLIENT_ID}&`+
//       `scope=${scope}&`+
//       `redirect_uri=${redirect_uri}&`+
//       `state=${state}`
//     );
// });

// app.get('/spotify_callback', async function(req, res) {

//     var code = req.query.code || null;
//     var state = req.query.state || null;
  
//     if (state === null) {
//         console.log("Some error has occured")
//     } else {
//         const token_url = 'https://accounts.spotify.com/api/token';
//         const data = `grant_type=client_credentials`
    
//         const response = await axios.post(token_url, data, {
//           headers: { 
//             'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`, 'utf-8').toString('base64')}`,
//             'Content-Type': 'application/x-www-form-urlencoded' 
//           }
//         })
//         //return access token
//         console.log(response.data.access_token); 

//     }
//   });
  // LOGIN ROUTES
  // render login page
  app.get('/login', (req, res) => {
    res.status(200).render('pages/login');
  });
  
  // login submission
  app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // look for user
    const userQuery = 'SELECT * FROM users WHERE username = $1 LIMIT 1';
    const user = await db.oneOrNone(userQuery, [username]);
    if (!user) {
      return res.status(401).render('pages/login', {
        error: 'This User does not exist,'
      });
    }

    // check if password matches with username
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).render('pages/login', {
        error: 'Invalid Username/Password.'
      });
    }
    req.session.user = user;
    req.session.save();

    res.status(200).json({message: 'Success'});

    // res.redirect('/home'); redirect to home page if successful login?
  });

  app.get('/share', (req, res) => {
    res.render('pages/share');
  });

  //########################### Testing ##################################
  app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'});
  });

  app.post('/add_user', async (req, res) => {
    const { id, name, dob } = req.body;
    try {
      await db.none(
        'INSERT INTO users_db (id, name, dob) VALUES ($1, $2, $3);',
        [id, name, dob]
      );

      res.status(200).json({ message: 'Success' });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: 'Invalid input' });
    }
  });


// authentication
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};
  
  app.use(auth);
  
  // app.listen(3000);
  // module.exports = app.listen(3000);
  const server = app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });
  
  // Export `server` and `db` for use in tests
  module.exports = { server, db };