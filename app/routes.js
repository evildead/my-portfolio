// create a new express Router
const express = require('express'),
    router = express.Router(),
    mainController = require('./controllers/main.controller'),
    authController = require('./controllers/auth.controller'),
    portfoliosController = require('./controllers/portfolios.controller');

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, pass the control to the "next()" handler
    if (req.isAuthenticated()) {
        return next();
    }

    // if they aren't redirect them to the home page
    res.redirect('/');
}

// export router
module.exports = router;

// define routes
// main routes
router.get('/', mainController.showHome);

// Google OAuth authentication
router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

// the callback after Google has authenticated the user
router.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect : '/account',
        failureRedirect : '/'
    })
);

// route for showing the profile page
router.get('/account', isLoggedIn, authController.showAccount);

// route for logging out
router.get('/logout', authController.doLogout);

// route for creating a dummy portfolio for the logged user
router.get('/portfolios/createDummy', isLoggedIn, portfoliosController.createDummy);

// route for viewing the portfolio page
router.get('/portfolios/:googleid', portfoliosController.viewPortfolio);

// route for viewing the project page
router.get('/portfolios/:googleid/:projectslug', portfoliosController.viewProject);
