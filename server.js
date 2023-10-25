const express = require('express');
const app = express();
const session = require('express-session');
const authRouter = require('./src/controllers/google-auth');
const facebookRouter = require('./src/controllers/facebook-auth');
const githubRouter = require('./src/controllers/github-auth');
const protectedRouter = require('./src/controllers/protected-route');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy; // Add this line
const mongoose = require('mongoose');

require('dotenv').config();

app.set('view engine', 'ejs');

// Update the MongoDB connection string with your actual database name
mongoose.connect('mongodb://localhost:27017/your-database-name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(
  session({
    secret: 'aHs2#dV9$lQpZ3!vE5tY', // Replace with your secret key
    resave: false,
    saveUninitialized: true,
  })
);

// Passport Twitter Strategy Configuration
passport.use(
  new TwitterStrategy(
    {
      consumerKey: 'YOUR_TWITTER_CONSUMER_KEY',
      consumerSecret: 'YOUR_TWITTER_CONSUMER_SECRET',
      callbackURL: 'http://localhost:3000/auth/twitter/callback', // Update with your callback URL
    },
    (token, tokenSecret, profile, done) => {
      // Handle the user's Twitter profile and authentication here
      return done(null, profile);
    }
  )
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

app.get('/', (req, res) => {
  res.render('auth');
});

app.use('/auth/google', authRouter);
app.use('/auth/facebook', facebookRouter);
app.use('/auth/github', githubRouter);
app.use('/protected', protectedRouter);

// Twitter Authentication Routes
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get(
  '/auth/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect: '/success', // Update with your success route
    failureRedirect: '/error', // Update with your error route
  })
);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('App listening on port ' + port));

