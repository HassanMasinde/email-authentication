const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const express = require('express');
const User = require('../dal/models/user.model');

const router = express.Router();
require('dotenv').config();

passport.use(
  new FacebookStrategy(
    {
      clientID: '783594323397-r2lcfsp1dgif35e8hv003br77stv2pfn.apps.googleusercontent.com', // Replace with your Facebook App's client ID
      clientSecret: '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', // Replace with your Facebook App's client secret
      callbackURL: 'http://localhost:3000/auth/facebook/callback', // Replace with your Facebook App's callback URL
    },
    async function (accessToken, refreshToken, profile, cb) {
      const user = await User.findOne({
        accountId: profile.id,
        provider: 'facebook',
      });
      if (!user) {
        console.log('Adding new Facebook user to DB..');
        const newUser = new User({
          accountId: profile.id,
          name: profile.displayName,
          provider: 'facebook',
        });
        await newUser.save();
        return cb(null, profile);
      } else {
        console.log('Facebook User already exists in DB..');
        return cb(null, profile);
      }
    }
  )
);

router.get('/', passport.authenticate('facebook', { scope: 'email' }));

router.get(
  '/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/auth/facebook/error',
  }),
  function (req, res) {
    // Successful authentication, redirect to success screen.
    res.redirect('/auth/facebook/success');
  }
);

router.get('/success', async (req, res) => {
  const userInfo = {
    id: req.session.passport.user.id,
    displayName: req.session.passport.user.displayName,
    provider: req.session.passport.user.provider,
  };
  res.render('fb-github-success', { user: userInfo });
});

router.get('/error', (req, res) => res.send('Error logging in via Facebook...'));

router.get('/signout', (req, res) => {
  try {
    req.session.destroy(function (err) {
      console.log('Session destroyed.');
    });
    res.render('auth');
  } catch (err) {
    res.status(400).send({ message: 'Failed to sign out Facebook user' });
  }
});

module.exports = router;

