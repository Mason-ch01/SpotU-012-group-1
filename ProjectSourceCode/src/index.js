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



var redirect_uri = 'http://localhost:3000/spotify_callback';

app.get('/login', function(req, res) {

  var state = "some_random_state";
  var scope = 'user-read-private user-read-email';

  res.redirect('https://accounts.spotify.com/authorize?' +
      'response_type=code&'+
      `client_id=${process.env.SPOTIFY_CLIENT_ID}&`+
      `scope=${scope}&`+
      `redirect_uri=${redirect_uri}&`+
      `state=${state}`
    );
});

app.get('/spotify_callback', async function(req, res) {

    var code = req.query.code || null;
    var state = req.query.state || null;
  
    if (state === null) {
        console.log("Some error has occured")
    } else {
        const token_url = 'https://accounts.spotify.com/api/token';
        const data = `grant_type=client_credentials`
    
        const response = await axios.post(token_url, data, {
          headers: { 
            'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`, 'utf-8').toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded' 
          }
        })
        //return access token
        console.log(response.data.access_token); 

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
        error: 'This User does not exist,'
      });
    }

    // check if password matches with username
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('pages/login', {
        error: 'Invalid Username/Password.'
      });
    }

    req.session.user = user;
    req.session.save();

    // res.redirect('/home'); redirect to home page if successful login?
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