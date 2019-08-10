const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));


// ROUTERS
app.get('/',
  (req, res) => {
    res.render('index');
  });

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.post('/signup',
  (req, res, next) => {
    var usernameInput = req.body.username;
    var password = req.body.password;

    models.Users.get({ username: usernameInput })
      .then(usernameFromDB => {
        // if user doesn't exist:
        if (!usernameFromDB) {
          // console.log(username.username)
          models.Users.create({ username: usernameInput, password: password })
          .then(result => {
            res.redirect('/');
            res.send(`Successfully created user ${usernameInput}!`, 200);
          })
          .catch(err => {
            res.send(err.code)}
          );
        // if user exists:
        } else {
          // redirect
          res.redirect('/signup');
        }
      })
  }); // app.post

app.post('/login',
  (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;

    models.Users.get({ username })
    .then(result => {
      // if username doesn't exist
      if (result) {
        // if password is incorrect
        if (models.Users.compare( password, result.password, result.salt ) === false) {
          res.set('location', '/login');
          res.send('Incorrect password.');
          // Password sucessful
        } else {
          models.Users.compare( password, result.password, result.salt );
          res.set('location', '/');
          res.send('Logged in!');
        }
      } else {
        res.set('location', '/login');
        res.send('Username does not exist.')
      }
    });
  }); // app.post

/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
