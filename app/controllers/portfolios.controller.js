// User model
const User = require('../models/user');

// Project model
const Project = require('../models/project');

// Portfolio model
const Portfolio = require('../models/portfolio');

module.exports = {
    createDummy: createDummy,
    viewPortfolio: viewPortfolio
}

/**
 * Create a dummy portfolio for logged user
 * @param {request} req 
 * @param {response} res 
 */
function createDummy(req, res) {
    // create dummy portfolio
    const newUserPortfolio = new Portfolio();
    newUserPortfolio.createdBy = req.user.id;
    newUserPortfolio.userDescription = "<h2>Senior web full-stack, desktop, mobile developer</h2><ul><li>Expert in advanced development methodologies, tools and processes contributing to the design and rollout of cutting-edge software applications.</li><li>Troubleshooting skills – able to analyse code and engineer well-researched, cost-effective and responsive solutions, used to work both alone and in team with high-quality results.</li><li>Lust for knowledge and for new technologies (NodeJS, ReactJS, QML, Npm, ES6)</li><li>Top ranking in C++ practice on HackerRank: www.hackerrank.com/danilo_carrabino</li><li>Always looking for the most appropriate algorithmic technique to accomplish the task</li></ul>";
    newUserPortfolio.webportals.github = "https://github.com/evildead";
    newUserPortfolio.webportals.stackoverflow = "https://stackoverflow.com/users/1424179/danilo-carrabino";
    newUserPortfolio.webportals.linkedin = "https://www.linkedin.com/in/danilocarrabino/";
    newUserPortfolio.webportals.hackerrank = "https://www.hackerrank.com/danilo_carrabino";
    newUserPortfolio.cv = "/users/117555122180909325816/cv/DaniloCarrabino_Resume.pdf";
    newUserPortfolio.projectList = [];

    const project1 = new Project();
    project1.createdBy = req.user.id;
    project1.name = 'react to curr ex';
    project1.title = 'React to Currency Exchange';
    project1.briefDescription = '"React to Currency Exchange" is a one-page application built using ReactJS';
    project1.detailedDescription = '"React to Currency Exchange" is a one-page application built using ReactJS. It computes currency exchange by using the latest exchange rates provided by the fixer.io API <br><a href="https://evildead.github.io/reacttocurrex">https://evildead.github.io/reacttocurrex</a>';
    project1.mediaList = [{
            mediaUrl: 'https://ichef.bbci.co.uk/news/660/cpsprodpb/1456/production/_93260250_gettyimages-622113366.jpg',
            mediaTitle: 'Basketball',
            description: 'Throwing into a basket.'
        },
        {
            mediaUrl: 'http://www.nhs.uk/Livewell/fitness/PublishingImages/getting%20started%20guides/T_1216_swimming_612848960_A.jpg',
            mediaTitle: 'Swimming',
            description: 'Michael Phelps is the fast fish.'
        },
        {
            mediaUrl: 'http://tamildiplomat.com/wp-content/uploads/2016/09/Weight-Lifting.gif',
            mediaTitle: 'Heavy Weights',
            description: 'Lifting heavy things up'
        }
    ];
    // save the project1
    var promise1 = project1.save((err) => {
        if(err) {
            throw err;
        }
        newUserPortfolio.projectList.push(project1.id);
    });

    const project2 = new Project();
    project2.createdBy = req.user.id;
    project2.name = 'create crud app node mongodb';
    project2.title = 'Create a CRUD App with NodeJS and Mongodb';
    project2.briefDescription = 'This is a CRUD application built with NodeJS in a Scotch.io course';
    project2.detailedDescription = 'This is a CRUD application built with NodeJS in a Scotch.io course<br>It features: Create, Read, Update, Delete of Olympics events';
    project2.mediaList = [{
            mediaUrl: 'http://www.bloglet.com/gallery/country-artists/country-artists.png',
            mediaTitle: 'Country',
            description: 'Country is beautiful.'
        },
        {
            mediaUrl: 'http://photos.prnewswire.com/prnvar/20120405/CL82910LOGO',
            mediaTitle: 'Hard Rock',
            description: 'Hard Rock kicks asses!'
        },
        {
            mediaUrl: 'http://www.macsome.com/guide/images/heavy-metal.jpg',
            mediaTitle: 'Heavy Metal',
            description: 'Heavy Metal is the law \mm/'
        }
    ];
    // save the project2
    var promise2 = project2.save((err) => {
        if(err) {
            throw err;
        }
        newUserPortfolio.projectList.push(project2.id);
    });

    Promise.all([promise1, promise2]).then(values => { 
        console.log(values);

        // save the portfolio
        newUserPortfolio.save((err) => {
            if(err) {
                throw err;
            }

            // set a successful flash message
            req.flash('success', 'Successfully created dummy portfolio!');

            // redirect to the newly created portfolio
            res.redirect(`/portfolios/${req.user.google.id}`);
        });
    });
}

/**
 * View the user's portfolio
 * @param {request} req 
 * @param {response} res 
 */
function viewPortfolio(req, res) {
    User.findOne({'google.id' : req.params.googleid}, function(err, user) {
        if(err) {
            throw err;
        }

        console.log(user);

        if(user == null) {
            // set a error flash message
            req.flash('errors', 'Oooops: No portfolio found');
            
            // redirect to the home page
            res.redirect('/');
        }
        else {
            Portfolio.findOne({'createdBy' : user.id})
                .populate('createdBy')
                .populate('projectList')
                .exec(function(err, portfolio) {
                    res.render('pages/viewPortfolio', {
                        portfolio: portfolio,
                        errors: req.flash('errors')
                    });
                });
        }
    });
}
