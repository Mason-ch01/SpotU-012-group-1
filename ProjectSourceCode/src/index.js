const express = require('express'); // To build an application server or API
const app = express();
const axios = require('axios');
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.


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


app.listen(3000);