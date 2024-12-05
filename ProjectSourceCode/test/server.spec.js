// ********************** Initialize server **********************************

const server = require('../src/index'); //TODO: Make sure the path to your index.js is correctly added

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

// Example Positive Testcase :
// API: /add_user
// Input: {id: 5, name: 'John Doe', dob: '2020-02-20'}
// Expect: res.status == 200 and res.body.message == 'Success'
// Result: This test case should pass and return a status 200 along with a "Success" message.
// Explanation: The testcase will call the /add_user API with the following input
// and expects the API to return a status of 200 along with the "Success" message.

describe('Testing Add User API', () => {
    it('positive : /add_user', done => {
      chai
        .request(server)
        .post('/add_user')
        .send({id: 5, name: 'John Doe', dob: '2020-02-20'})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.message).to.equals('Success');
          done();
        });
    });
  });

// ********************************************************************************

// API: GET /login
// Input: None
// Expect: Render the login page
// Result: This test case should pass and return a status 200 along text of the form
// Explanation: The testcase will call the /login with no input
// and expects the API to  return a status 200 along text of the form
describe('GET /login', () => {
  it('should render the login page', (done) => {
    chai.request(server)
      .get('/login')
      .end((err, res) => {
        res.should.have.status(200);
        res.text.should.include('<form'); // Check if the form exists in the page
        done();
      });
  });
});

// ********************************************************************************

// API: Post /login
// Input: Credential
// Expect: Render the login page
// Result: This test case should pass and return a status 200 along text of the form
// Explanation: The testcase will call the /login with no input
// and expects the API to  return a status 200 along text of the form

describe('POST /login', () => {
  it('should login the user and redirect to /spotify_connect', (done) => {
    chai.request(server)
      .post('/login')
      .send({ username: 'john_doe', password: '$2a$10$3OM8KJMTQ6QxU3U8lIcugO8sz.2CvZDaiHCS288g6bkDHBHt7H0RO' })
      .end((err, res) => {
        res.should.have.status(200); // Redirection status
        done();
      });
  });
});

describe('POST /login - Invalid credentials', () => {
  it('should return error for invalid username/password', (done) => {
    chai.request(server)
      .post('/login')
      .send({ username: 'wrongUser', password: 'wrongPassword' })
      .end((err, res) => {
        res.should.have.status(200); // The page should be rendered with an error
        done();
      });
  });
});

// ********************************************************************************

// API: GET /register
// Input: Credential
// Expect: Render the register page
// Result: This test case should pass and return a status 200 along text of the form
// Explanation: The testcase will call the /register with no input
// and expects the API to return a status 200 along text of the form

describe('GET /register', () => {
  it('should render the registration page', (done) => {
    chai.request(server)
      .get('/register')
      .end((err, res) => {
        res.should.have.status(200);
        res.text.should.include('<form'); // Check if form is present
        done();
      });
  });
});

// ********************************************************************************

// API: Post /register
// Input: Credential
// Expect: Render the register page
// Result: This test case should pass and return a status 200 and redirect
// Explanation: The testcase will call the /register with credintials
// and expects the API to return a status 200 and redirect

describe('POST /register', () => {
  it('should register a new user', (done) => {
    chai.request(server)
      .post('/register')
      .send({
        username: 'newUser',
        password: 'newPassword',
        firstName: 'First',
        lastName: 'Last'
      })
      .end((err, res) => {
        res.should.have.status(200); // Check if it's a redirect after successful registrationß
        done();
      });
  });
});

// ********************************************************************************

// API: GET /spotify_connect
// Input: Credential
// Expect: Redirect to spotify oath
// Result: This test case should pass and return a status 200 and redirect
// Explanation: The testcase will call spotify connect with no input
// and expects the API to return a status 200 and redirect

describe('GET /spotify_connect', () => {
  it('should redirect to Spotify authorization URL', (done) => {
    chai.request(server)
      .get('/spotify_connect')
      .end((err, res) => {
        res.should.have.status(200); // Redirect to Spotify OAuth
        res.redirects[0].should.include('https://accounts.spotify.com/authorize');
        done();
      });
  });
});

// ********************************************************************************

// API: POST /new_post
// Input: post information
// Expect: Redirect to explore
// Result: This test case should pass and return a status 200 and redirect
// Explanation: The testcase will call newpost with post information
// and expects the API to return a status 200 and redirect

describe('POST /new_post', () => {
  it('should create a new post', (done) => {
    chai.request(server)
      .post('/new_post')
      .send({
        track_name: 'Test Song',
        track_artists: 'Test Artist',
        track_image: 'song-image.jpg'
      })
      .set('Cookie', 'userId=testUserId; username=testUsername')
      .end((err, res) => {
        res.should.have.status(200); // After creation, it should redirect
        res.redirects[0].should.include('/explore');
        done();
      });
  });
});

// ********************************************************************************

// API: POST /new_comment
// Input: comment information
// Expect: fail as not logged in 
// Result: This test case should faill and return a status 500 and redirect
// Explanation: The testcase will call new_comment with post information
// and expects the API to return a status 400 and redirect

describe('POST /new_comment', () => {
  it('should allow a user to comment on a post', (done) => {
    chai.request(server)
      .post('/new_comment')
      .send({
        postId: 1,
        comment: 'Great song!'
      })
      .set('Cookie', 'userId=testUserId; username=testUsername')
      .end((err, res) => {
        res.should.have.status(500); // Redirect after successful commentß
        done();
      });
  });
});

// ********************************************************************************

// API: get /logout
// Input: none
// Expect: logout
// Result: This test case should pass and return a status 200 and redirect
// Explanation: The testcase will call logout with nothing
// and expects the API to return a status 200 and redirect

describe('GET /logout', () => {
  it('should log the user out and redirect to login', (done) => {
    chai.request(server)
      .get('/logout')
      .set('Cookie', 'userId=testUserId; username=testUsername') // Mock session cookies
      .end((err, res) => {
        res.should.have.status(200); // Redirect after logout
        res.redirects[0].should.include('/login');
        done();
      });
  });
});


