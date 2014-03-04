// includes
// config
var config = require('../../config');
// db
var User = require('../../db/user').User;
// passport
var passport = require('passport');
var passportFacebook = require('passport-facebook');

// make passport policy
var FacebookStrategy = passportFacebook.Strategy;
passport.use(new FacebookStrategy(config.facebook,
    function (accessToken, refreshToken, profile, done) {
        var username = profile.username;
        var fbId = profile.id;
        var query = {
            username: username,
            'social_networks.network': 'facebook',
            'social_networks.id': fbId
        };
        // try to find user
        User.findOne(query, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                // register new user if none found
                return registerNewUser(profile, done);
            }
            // if all is OK, return user
            return done(null, user);
        });
    }
));

var registerNewUser = function(profile, done) {
    var user = {
        username: profile.username,
        first_name: profile.name.givenName,
        last_name: profile.name.familyName,
        social_networks: [{
            network: 'facebook',
            id: profile.id
        }]
    };

    // check username
    User.findOne({username: user.username}, function(err, exuser) {
        if(err) {
            return done(err);
        }

        // if username is taken, append random string
        if(exuser) {
            user.username += Date.now();
        }

        // save
        var userData = new User(user);
        userData.save(function(err) {
            if(err) {
                return done(err);
            }

            return done(null, userData);
        });
    });
};

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
exports.facebook = {
    path: '/auth/facebook',
    method: 'get',
    returns: passport.authenticate('facebook')
};

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
exports.facebook_callback = {
    path: '/auth/facebook/callback',
    method: 'get',
    returns: passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    })
};
