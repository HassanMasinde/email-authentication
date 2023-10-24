const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const express = require('express');
const User = require('../dal/models/user.model');

const router = express.Router();
require('dotenv').config();

passport.use(
  new GitHubStrategy(
    {
      clientID: '783594323397-r2lcfsp1dgif35e8hv003br77stv2pfn.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, cb) => {
      const user = await User.findOne({
        accountId: profile.id,
        provider: 'github',
      });
      if (!user) {
        console.log('Adding new GitHub user to the DB..');
        const user = new User({
          accountId: profile.id,
          name: profile.username,
          provider: profile.provider,
        });
        await user.save();
        return cb(null, profile);
      } else {
        console.log('GitHub user already exists in the DB..');
        return cb(null, profile);
      }
    }
  )
);

router.get('/', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/callback',
  passport.authenticate('github', { failureRedirect: '/auth/github/error' }),
  function (req, res) {
    res.redirect('/auth/github/success');
  }
);

router.get('/success', async (req, res) => {
  const userInfo = {
    id: req.session.passport.user.id,
    displayName: req.session.passport.user.username,
    provider: req.session.passport.user.provider,
  };
  res.render('fb-github-success', { user: userInfo });
});

router.get('/error', (req, res) => res.send('Error logging in via GitHub..'));

router.get('/signout', (req, res) => {
  try {
    req.session.destroy(function (err) {
      console.log('Session destroyed.');
    });
    res.render('auth');
  } catch (err) {
    res.status(400).send({ message: 'Failed to sign out GitHub user' });
  }
});

module.exports = router;

