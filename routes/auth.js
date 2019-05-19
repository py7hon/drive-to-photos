var express = require('express');
var router = express.Router();
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var CustomStrategy = require('passport-custom').Strategy;

var oauthConfig = require('../oauthConfig');

var gauthconfig = oauthConfig.google;
const uuidv1 = require('uuid/v1');

passport.use(new GoogleStrategy({
  clientID: gauthconfig.clientID,
  clientSecret: gauthconfig.clientSecret,
  callbackURL: gauthconfig.callbackURL
},
  function (request, refreshToken, accessToken, profile, done) {
    process.nextTick(function () {
      if (refreshToken) accessToken.refresh_token = refreshToken;
      accessToken.expiry_date = ((new Date()).getTime() + (accessToken.expires_in * 1000));
      var userProfile = {
        token: accessToken,
        profile: profile
      };
      return done(null, userProfile);
    });
  }
));

passport.use(new CustomStrategy(
  function (req, done) {
    var inviteKey = req.params.key;
    var invitationData = invitations[inviteKey];
    var userProfile = {
      token: invitationData,
      profile: {
        name: "Invite User"
      }
    };
    return done(null, userProfile);
  }
));

router.get('/google',
  passport.authenticate('google', {
    authType: 'rerequest',
    successRedirect: '/',
    scope: ['email',
      'https://www.googleapis.com/auth/drive',
      'https://picasaweb.google.com/data/',
      'https://photos.googleapis.com/data/',
      'https://www.googleapis.com/auth/youtube.force-ssl'],
    accessType: 'offline', prompt: 'consent'
  }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function (req, res) {
    res.redirect('/index');
  });


// router.get('/welcome/:key',
//   passport.authenticate('custom', {
//     failureRedirect: '/index'
//   })
// );

router.get('/welcome/:key', 
  passport.authenticate('custom', {
    failureRedirect: '/login'
  }), function(req, res) {
    res.redirect('/');
  });
// }, function (req, res) {
//   res.redirect('/');
// });

var invitations = [];
router.get('/invite', function (req, res, next) {
  if (req.isAuthenticated()) {
    var randomGuid = uuidv1();
    var data = JSON.parse(JSON.stringify(req.user.token));
    data.refresh_token = "";
    invitations[randomGuid] = data;
    var baseUrl=req.protocol + "://" + req.host;
    res.send(baseUrl + '/auth/Welcome/' + randomGuid);
  }
});


module.exports = router;
