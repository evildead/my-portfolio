module.exports = {
    doLogout: doLogout,
    showAccount: showAccount
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
