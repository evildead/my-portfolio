module.exports = {
    // show the home page
    showHome: (req, res) => {
        res.render('pages/home', {
            user : req.user,
            errors: req.flash('errors')
        });
    },
    showTermsOfUse: (req, res) => {
        res.render('pages/termsOfUse', {
            
        });
    }
};
