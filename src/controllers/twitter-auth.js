const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const express = require('express');
const User = require('../dal/models/user.model');

const router = express.Router();
require('dotenv').config();

passport.use(
  new TwitterStrategy(
    {
      consumerKey: '783594323397-r2lcfsp1dgif35e8hv003br77stv2pfn.apps.googleusercontent.com',
      consumerSecret: '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',
      callbackURL: 'http://localhost:3000/auth/twitter/callback',
    },
    async function (token, tokenSecret, profile, cb) {
      const user = await User.findOne({
        accountId: profile.id,
        provider: 'twitter',
      });
      if (!user) {
        console.log('Adding new Twitter user to DB..');
        const newUser = new User({
          accountId: profile.id,
          name: profile.displayName,
          provider: 'twitter',
        });
        await newUser.save();
        return cb(null, profile);
      } else {
        console.log('Twitter User already exists in DB..');
        return cb(null, profile);
      }
    }
  )
);

router.get('/', passport.authenticate('twitter'));

router.get(
  '/callback',
  passport.authenticate('twitter', {
    failureRedirect: '/auth/twitter/error',
  }),
  function (req, res) {
    // Successful authentication, redirect to success screen.
    res.redirect('/auth/twitter/success');
  }
);

router.get('/success', async (req, res) => {
  const userInfo = {
    id: req.session.passport.user.id,
    displayName: req.session.passport.user.displayName,
    provider: req.session.passport.user.provider,
  };
  res.render('twitter-success', { user: userInfo });
});

router.get('/error', (req, res) => res.send('Error logging in via Twitter...'));

router.get('/signout', (req, res) => {
  try {
    req.session.destroy(function (err) {
      console.log('Session destroyed.');
    });
    res.render('auth');
  } catch (err) {
    res.status(400).send({ message: 'Failed to sign out Twitter user' });
  }
});

module.exports = router;

