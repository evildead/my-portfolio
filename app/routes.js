// create a new express Router
const express = require('express'),
    router = express.Router(),
    multer = require('multer'),
    multerupload = multer({ dest: 'uploads/' }),
    mainController = require('./controllers/main.controller'),
    authController = require('./controllers/auth.controller'),
    portfoliosController = require('./controllers/portfolios.controller');

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, pass the control to the "next()" handler
    if (req.isAuthenticated()) {
        return next();
    }

    // otherwise redirect him to the home page
    res.redirect('/');
}

// export router
module.exports = router;

// define routes
// main routes
router.get('/', mainController.showHome);

// route for showing the "Terms of Use" page
router.get('/termsofuse', mainController.showTermsOfUse);

// Google OAuth authentication
router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

// the callback after Google has authenticated the user
router.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect : '/portfolios/editPortfolioInfos',
        failureRedirect : '/'
    })
);

// route for showing the profile page
router.get('/account', isLoggedIn, authController.showAccount);

// route for show erase account page
router.get('/eraseAccount', isLoggedIn, portfoliosController.showEraseAccount);

// route for handling the account removal
router.post('/eraseAccount', isLoggedIn, portfoliosController.processEraseAccount);

// route for logging out
router.get('/logout', authController.doLogout);

// route for viewing the portfolio list on My-Portfolio
router.get('/portfolios', portfoliosController.viewPortfolioList);

// route for creating a dummy portfolio for the logged user
router.get('/portfolios/createDummy', isLoggedIn, portfoliosController.createDummy);

// route for showing logged user's portfolio infos editing page
router.get('/portfolios/editPortfolioInfos', isLoggedIn, portfoliosController.showEditPortfolioInfos);

// route to update logged user's portfolio infos
router.post('/portfolios/editPortfolioInfos', isLoggedIn, multerupload.any(), portfoliosController.processEditPortfolioInfos);

// route for showing logged user's portfolio projects editing page
router.get('/portfolios/editPortfolioProjects', isLoggedIn, portfoliosController.showEditPortfolioProjects);

// route to update logged user's portfolio projects
router.post('/portfolios/editPortfolioProjects', isLoggedIn, multerupload.any(), portfoliosController.processEditPortfolioProjects);

// route for viewing the portfolio page
router.get('/portfolios/:googleid', portfoliosController.viewPortfolio);

// route for viewing the project page
router.get('/portfolios/:googleid/:projectslug', portfoliosController.viewProject);
