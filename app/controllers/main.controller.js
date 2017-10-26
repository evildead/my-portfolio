const fs = require('fs');

module.exports = {
    // show the home page
    showHome: (req, res) => {
        res.render('pages/home', {
            user : req.user,
            errors: req.flash('errors')
        });
    },
    showTermsOfUse: (req, res) => {
        fs.readFile('./public/assets/termsOfUse.html', (err, data) => {
            if (err) throw err;
            res.render('pages/termsOfUse', {
                user : req.user,
                termscontent: data
            });
        });
    }
};
