const models = require('../models');
const parseCookies = require('./cookieParser');
const Promise = require('bluebird');

// const parseCookiesAsync = Promise.promisify(cookieParser);

// accesses the parsed cookies on the request
// looks up the user data related to that session
// assigns an object to a session property on the request that contains relevant user information.
// (Ask yourself: what information about the user would you want to keep in this session object?)

// Things to keep in mind:
// An incoming request with no cookies should generate a session with a unique hash and store it the sessions database. The middleware function should use this unique hash to set a cookie in the response headers. (Ask yourself: How do I set cookies using Express?).
// If an incoming request has a cookie, the middleware should verify that the cookie is valid (i.e., it is a session that is stored in your database).
// If an incoming cookie is not valid, what do you think you should do with that session and cookie?
//  Mount these two middleware functions in app.js so that they are executed for all requests received by your server.

module.exports.createSession = (req, res, next) => {
    // does request have session?
    req.session = {};
    if (Object.keys(req.session).length === 0 && req.session.constructor === Object) {
      return models.Sessions.create()
      .then(insertQueryResult => {
        console.log('---CREATING SESSION---');
        req.session.id = insertQueryResult.insertId;
        models.Sessions.get({ id: req.session.id })
        .then(queryResult => {
          console.log('---SETTING REQ.SESSION.HASH---');
          req.session.hash = queryResult.hash;
          // next();
        })
        .then(() => {
          console.log("ENTERING LAST THEN STATEMENT");
          console.log('---PARSING COOKIE FROM REQUEST');
          // parseCookies(req, function() {
          //   res.cookie(Object.keys(req.cookies)[0], req.cookies[Object.keys(req.cookies)[0]]);
          // });
          console.log('---DONE SETTING RES.COOKIES');
          next();
        })



      })
    }

}

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

