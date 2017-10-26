// load up the user model
const User = require('../models/user');
const fs = require('fs');

const initUserFolderStructure = require('../utilities').initUserFolderStructure;

module.exports = {
    doLogout: doLogout,
    showAccount: showAccount,
    processAcceptTermsOfUse: processAcceptTermsOfUse
}

/**
 * Perform logout
 * @param {request} req 
 * @param {response} res
 */
function doLogout(req, res) {
    req.logout();
    res.redirect('/');
}

/**
 * Show account information
 * @param {request} req 
 * @param {response} res
 */
function showAccount(req, res) {
    res.render('pages/account', {
        user : req.user // get the user out of session and pass to template
    });
}

/**
 * Perform the terms of use acceptance
 * @param {request} req 
 * @param {response} res
 */
function processAcceptTermsOfUse(req, res) {
    // Terms of Use Accepted
    if(req.body.acceptRadios == '1') {
        initUserFolderStructure(req.user.google.id, () => {
            req.user.mustacceptterms = false;
            req.user.save(function(err) {
                if (err) {
                    throw err;
                }
                res.redirect('/portfolios/editPortfolioInfos');
            });
        });
    }
    // Terms of Use Not Accepted
    else {
        User.remove({_id: req.user.id}, (err) => {
            if(err) {
                console.error(err);
            }
            res.redirect('/logout');
        });
    }
}
