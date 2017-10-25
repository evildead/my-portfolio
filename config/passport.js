// load only the Google strategy, because the login to My-Portfolio
// will be only possible by using the Google account
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const async = require('async'),     // require async
    fsExtra = require('fs-extra');  // require fs-extra

// load up the user model
var User = require('../app/models/user');

initUserFolderStructure = function(userId, externCallback) {
    /*
    // OLD Implementation Use async.parallel to create two folder structures in parallel: 
    // '/public/users/{userId}/cv' and '/public/users/{userId}/media'
    async.parallel([
        function(callback) { //This is the first task, and `callback` is its callback task
            mkdirp('./public/users/' + userId + '/cv', function (err) {
                if (err) console.error(err);
                //Now we have created the folder structure, so let's tell Async that this task is done
                callback();
            });
        },
        function(callback) { //This is the second task, and `callback` is its callback task
            mkdirp('./public/users/' + userId + '/media', function (err) {
                if (err) console.error(err);
                //Now we have created the folder structure, so let's tell Async that this task is done
                callback();
            });
        },
    ], function(err) { //This is the final callback
        externCallback();
    });
    */

    // OLD Implementation Use async.parallel to create two folder structures in parallel: 
    // '/public/users/{userId}/cv' and '/public/users/{userId}/media'
    async.parallel([
        function(callback) { //This is the first task, and `callback` is its callback task
            fsExtra.ensureDir('./public/users/' + userId + '/cv', (err) => {
                if (err) console.error(err);
                //Now we have created the folder structure, so let's tell Async that this task is done
                callback();
            });
        },
        function(callback) { //This is the second task, and `callback` is its callback task
            fsExtra.ensureDir('./public/users/' + userId + '/media', (err) => {
                if (err) console.error(err);
                //Now we have created the folder structure, so let's tell Async that this task is done
                callback();
            });
        },
    ], function(err) { //This is the final callback
        externCallback();
    });
}

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        clientID          : process.env.GOOGLEAUTH_clientID,
        clientSecret      : process.env.GOOGLEAUTH_clientSecret,
        callbackURL       : process.env.GOOGLEAUTH_callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {
        //console.log(profile);

        // check if the user is already logged in
        if (!req.user) {

            User.findOne({ 'google.id' : profile.id }, function(err, user) {
                if (err) {
                    return done(err);
                }

                if (user) {
                    // if there is a user id already but no token (user was linked at one point and then removed)
                    if (!user.google.token) {
                        user.google.token = token;
                        user.google.name  = profile.displayName;
                        user.google.email = profile.emails[0].value; // pull the first email
                        user.google.imageUrl = profile.photos[0].value; // pull the first image

                        initUserFolderStructure(profile.id, () => {
                            user.save(function(err) {
                                if (err) {
                                    throw err;
                                }
                                return done(null, user);
                            });
                        });
                    }

                    initUserFolderStructure(profile.id, () => {
                        return done(null, user);
                    });
                }
                else {
                    var newUser = new User();

                    newUser.google.id       = profile.id;
                    newUser.google.token    = token;
                    newUser.google.name     = profile.displayName;
                    newUser.google.email    = profile.emails[0].value; // pull the first email
                    newUser.google.imageUrl = profile.photos[0].value; // pull the first image

                    initUserFolderStructure(profile.id, () => {
                        newUser.save(function(err) {
                            if (err) {
                                throw err;
                            }
                            return done(null, newUser);
                        });
                    });
                }
            });

        }
        else {
            // user already exists and is logged in, we have to link accounts
            var user = req.user; // pull the user out of the session

            user.google.id    = profile.id;
            user.google.token = token;
            user.google.name  = profile.displayName;
            user.google.email = profile.emails[0].value; // pull the first email
            user.google.imageUrl = profile.photos[0].value; // pull the first image

            initUserFolderStructure(profile.id, () => {
                user.save(function(err) {
                    if (err) {
                        throw err;
                    }
                    return done(null, user);
                });
            });
        }

    }));
};
