// create a new express Router
const express = require('express'),
    router = express.Router(),
    multer = require('multer'),
    multerupload = multer({
        dest: 'uploads/',
        limits: { fieldSize: 25 * 1024 * 1024 }
    }),
    mainController = require('./controllers/main.controller'),
    authController = require('./controllers/auth.controller'),
    portfoliosController = require('./controllers/portfolios.controller');

const fs = require('fs');

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session and the terms of use have been accepted, pass the control to the "next()" handler
    if (req.isAuthenticated() && !req.user.mustacceptterms) {
        return next();
    }

    // otherwise redirect him to the home page
    res.redirect('/');
}

// route middleware to make sure a user is temporarily logged in to accept terms of use
function isLoggedInToAcceptTerms(req, res, next) {
    //console.log(req.user);
    // if user is authenticated in the session and the terms of use have not been accepted, pass the control to the "next()" handler
    if (req.isAuthenticated() && req.user.mustacceptterms) {
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
    passport.authenticate('google', {failureRedirect : '/'}),    // on failure Google authentication
    function(req, res) {        // on correct Google authentication
        // User must accept the terms of use before creating the account
        if(req.user.mustacceptterms) {
            fs.readFile('./public/assets/termsOfUse.html', (err, data) => {
                if (err) throw err;
                res.render('pages/acceptTermsOfUse', {
                    user : req.user,
                    termscontent: data
                });
            });
        }
        // User has already accepted the terms of use
        else {
            res.redirect('/portfolios/editPortfolioInfos');
        }
});

// route for showing the profile page
router.get('/account', isLoggedIn, authController.showAccount);

// route for handling the terms of use acceptance
router.post('/accepttermsofuse', isLoggedInToAcceptTerms, authController.processAcceptTermsOfUse);

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
