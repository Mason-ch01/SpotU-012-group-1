// ********************** Initialize server **********************************

const { server, db } = require('../src/index'); //TODO: Make sure the path to your index.js is correctly added
const bcryptjs = require('bcryptjs');

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


describe('login', () => {
  it('Positive: successfully logged in', done => {
    chai
      .request(server)
      .post('/login')
      .send({'username': 'test', 'password': 'test'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('Success');
        done();

      });
  });

  it('Negative: not successfully logged in', done => {
    chai
      .request(server)
      .post('/login')
      .send({'username': 'test1', 'password': 'test'})
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();

      });
  });

});



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

    // Example Negative Testcase :
    // API: /add_user
    // Input: {id: 5, name: 10, dob: '2020-02-20'}
    // Expect: res.status == 400 and res.body.message == 'Invalid input'
    // Result: This test case should pass and return a status 400 along with a "Invalid input" message.
    // Explanation: The testcase will call the /add_user API with the following invalid inputs
    // and expects the API to return a status of 400 along with the "Invalid input" message.

    it('Negative : /add_user. Checking invalid name', done => {
        chai
          .request(server)
          .post('/add_user')
          .send({id: '5', name: 10, dob: '2020-02-20'})
          .end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equals('Invalid input');
            done();
          });
      });
  });


  describe('Testing Render', () => {
    // Sample test case given to test /test endpoint.
    it('test "/login" route should render with an html response', done => {
      chai
        .request(server)
        .get('/login') // for reference, see lab 8's login route (/login) which renders home.hbs
        .end((err, res) => {
          res.should.have.status(200); // Expecting a success status code
          res.should.be.html; // Expecting a HTML response
          done();
        });
    });
  });

// ********************************************************************************
//CHange to test register endpoints
describe('testing login route', () => {
    let agent;
    const testUser = {
      username: 'testuser',
      password: 'testpass123',
      firstName: 'test',
      lastName: 'user'
    };

    const negativeTestUser = {
        username: 'negative',
        password: 'negative',
        firstName: 'negative',
        lastName: 'negative'
    };
  
    before(async () => {
      // Clear users table and create test user
      await db.query('TRUNCATE TABLE users CASCADE');
      const hashedPassword = await bcryptjs.hash(testUser.password, 10);
      await db.query('INSERT INTO users (username, password, firstName, lastName) VALUES ($1, $2, $3, $4)', [
        testUser.username,
        hashedPassword,
        testUser.firstName,
        testUser.lastName,
      ]);
    });
  
    beforeEach(() => {
      // Create new agent for session handling
      agent = chai.request.agent(server);
    });
  
    afterEach(() => {
      // Clear cookie after each test
      agent.close();
    });
  
    after(async () => {
      // Clean up database
      await db.query('TRUNCATE TABLE users CASCADE');
    });
  
    describe('post /login route test', () => {
        //Positive test case
        it('Negative: should return 401 if user is not authenticated and render login', async () => {
            const res = await agent.post('/login').send(negativeTestUser)

            expect(res).to.have.status(401);
            res.should.be.html;
            });
        });

        it('testing login success', async () => {
            const login = await agent.post('/login').send(testUser);

            expect(login).to.have.status(200);
            expect(login.body.message).to.equal('Success');
        });

    });
