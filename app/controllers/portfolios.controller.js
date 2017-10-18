// User model
const User = require('../models/user');

// Project model
const Project = require('../models/project');

// Portfolio model
const Portfolio = require('../models/portfolio');

// require path module
const path = require('path');
// require fs module
const fs = require('fs');

module.exports = {
    createDummy: createDummy,
    viewPortfolioList: viewPortfolioList,
    viewPortfolio: viewPortfolio,
    viewProject: viewProject,
    showEditPortfolio: showEditPortfolio,
    processEditPortfolio: processEditPortfolio
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
    newUserPortfolio.profileTitle = "Senior web full-stack, desktop, mobile developer";
    newUserPortfolio.profileDescription = "<ul><li>Expert in advanced development methodologies, tools and processes contributing to the design and rollout of cutting-edge software applications.</li><li>Troubleshooting skills – able to analyse code and engineer well-researched, cost-effective and responsive solutions, used to work both alone and in team with high-quality results.</li><li>Lust for knowledge and for new technologies (NodeJS, ReactJS, QML, Npm, ES6)</li><li>Top ranking in C++ practice on HackerRank: <a href='www.hackerrank.com/danilo_carrabino' target='_blank'>Danilo Carrabino</a></li><li>Always looking for the most appropriate algorithmic technique to accomplish the task</li></ul>";
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
    project2.name = 'create crud app - node mongodb';
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
        //console.log(values);

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
 * View the portfolio list
 * @param {request} req 
 * @param {response} res 
 */
function viewPortfolioList(req, res) {
    // get all the portfolios
    Portfolio.find({})
        .populate('createdBy')
        .sort('createdOn')  // ascending order by creation date
        .exec(function(err, portfolios) {
            // error found
            if(err) {
                res.status(404);
                res.send('No portfolio found');
            }

            if(portfolios == null) {
                // set a error flash message
                req.flash('errors', 'Oooops: No portfolio found!');
                
                // redirect to the home page
                res.redirect('/');
            }
            else {
                res.render('pages/viewPortfolioList', {
                    user : req.user,
                    portfolios: portfolios,
                    path: path,
                    errors: req.flash('errors'),
                    success: req.flash('success')
                });
            }
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

        //console.log(user);

        if(user == null) {
            // set a error flash message
            req.flash('errors', 'Oooops: No user found with id ' + req.params.googleid);
            
            // redirect to the home page
            res.redirect('/');
        }
        else {
            Portfolio.findOne({'createdBy' : user.id})
                .populate('createdBy')
                .populate('projectList')
                .exec(function(err, portfolio) {
                    if(portfolio == null) {
                        // set a error flash message
                        req.flash('errors', 'Oooops: No portfolio found for user ' + user.google.name);
                        
                        // redirect to the home page
                        res.redirect('/');
                    }
                    else {
                        res.render('pages/viewPortfolio', {
                            user : req.user,
                            portfolio: portfolio,
                            path: path,
                            errors: req.flash('errors')
                        });
                    }
                });
        }
    });
}

/**
 * View the user's project
 * @param {request} req 
 * @param {response} res 
 */
function viewProject(req, res) {
    User.findOne({'google.id' : req.params.googleid}, function(err, user) {
        if(err) {
            throw err;
        }

        //console.log(user);

        if(user == null) {
            // set a error flash message
            req.flash('errors', 'Oooops: No user found with id ' + req.params.googleid);
            
            // redirect to the home page
            res.redirect('/');
        }
        else {
            // look for the project created by user.id with slug = req.params.projectslug
            Project.findOne({'createdBy' : user.id, 'slug' : req.params.projectslug})
                .populate('createdBy')
                .exec(function(err, project) {
                if(err) {
                    throw err;
                }
        
                //console.log(project);
        
                if(project == null) {
                    // set a error flash message
                    req.flash('errors', 'Oooops: No project "' + req.params.projectslug + '" found for user ' + user.google.name);
                    
                    // redirect to the home page
                    res.redirect('/');
                }
                else {
                    res.render('pages/viewProject', {
                        user : req.user,
                        project: project,
                        errors: req.flash('errors')
                    });
                }
            });
        }
    });
}

/**
 * View logged user's portfolio editing page
 * @param {request} req 
 * @param {response} res 
 */
function showEditPortfolio(req, res) {
    Portfolio.findOne({'createdBy' : req.user.id})
        .populate('createdBy')
        .populate('projectList')
        .exec(function(err, portfolio) {
            // No portfolio found for user req.user
            if(portfolio == null) {
                // create an empty portfolio
                const newUserPortfolio = new Portfolio();
                newUserPortfolio.createdBy = req.user.id;
                newUserPortfolio.projectList = [];
                newUserPortfolio.webportals = {
                    github: '',
                    stackoverflow: '',
                    linkedin: '',
                    hackerrank: ''
                };
                newUserPortfolio.save((err) => {
                    if(err) {
                        // set a error flash message
                        req.flash('errors', 'Oooops: Cannot create empty portfolio for user ' + req.user.google.name);
                        
                        // redirect to the home page
                        res.redirect('/');
                    }

                    res.render('pages/showEditPortfolio', {
                        user : req.user,
                        portfolio: newUserPortfolio,
                        path: path,
                        errors: req.flash('errors'),
                        success: req.flash('success')
                    });
                });
            }
            // A portfolio already exists for user req.user
            else {
                res.render('pages/showEditPortfolio', {
                    user : req.user,
                    portfolio: portfolio,
                    path: path,
                    errors: req.flash('errors'),
                    success: req.flash('success')
                });
            }
        });
}

/**
 * Update logged user's portfolio
 * @param {request} req 
 * @param {response} res 
 */
function processEditPortfolio(req, res) {
    // validate information
    req.checkBody('profileTitle', 'profileTitle is required!').notEmpty();
    req.checkBody('profileDescription', 'profileDescription is required!').notEmpty();

    // if there are errors, redirect and save errors to flash
    const errors = req.validationErrors();
    if(errors) {
        req.flash('errors', errors.map(err => err.msg));
        return res.redirect(`/portfolios/editPortfolio`);
    }

    Portfolio.findOne({'createdBy' : req.user.id})
    .populate('createdBy')
    .populate('projectList')
    .exec(function(err, portfolio) {
        if(err) {
            // set a error flash message
            req.flash('errors', 'Oooops: Error occurred while looking for portfolio for user ' + req.user.google.name);
            
            // redirect to the home page
            res.redirect('/');
        }

        // No portfolio found for user req.user
        if(portfolio == null) {
            // set a error flash message
            req.flash('errors', 'Oooops: no portfolio found for user ' + req.user.google.name);
            
            // redirect to the edit portfolio page
            res.redirect(`/portfolios/editPortfolio`);
        }
        // A portfolio already exists for user req.user
        else {
            portfolio.profileTitle = req.body.profileTitle;
            portfolio.profileDescription = req.body.profileDescription;

            // github
            if (typeof req.body.githubLink !== 'undefined') {
                if((req.body.githubLink) && (req.body.githubLink.length > 0)) {
                    portfolio.webportals.github = "https://github.com/" + req.body.githubLink;
                }
                else {
                    portfolio.webportals.github = "";
                }
            }

            // stackoverflow
            if (typeof req.body.stackoverflowLink !== 'undefined') {
                if((req.body.stackoverflowLink) && (req.body.stackoverflowLink.length > 0)) {
                    portfolio.webportals.stackoverflow = "https://stackoverflow.com/users/" + req.body.stackoverflowLink;
                }
                else {
                    portfolio.webportals.stackoverflow = "";
                }
            }

            // linkedin
            if (typeof req.body.linkedinLink !== 'undefined') {
                if((req.body.linkedinLink) && (req.body.linkedinLink.length > 0)) {
                    portfolio.webportals.linkedin = "https://www.linkedin.com/in/" + req.body.linkedinLink;
                }
                else {
                    portfolio.webportals.linkedin = "";
                }
            }

            // hackerrank
            if (typeof req.body.hackerrankLink !== 'undefined') {
                if((req.body.hackerrankLink) && (req.body.hackerrankLink.length > 0)) {
                    portfolio.webportals.hackerrank = "https://www.hackerrank.com/" + req.body.hackerrankLink;
                }
                else {
                    portfolio.webportals.hackerrank = "";
                }
            }

            // check the hiddenProjectList string
            if( (req.body.hiddenProjectList !== 'undefined') &&
                (req.body.hiddenProjectList) &&
                (req.body.hiddenProjectList.length > 0) ) {
                // parse string to JSON
                const hiddenProjectListJson = JSON.parse(req.body.hiddenProjectList);
                
                if((Array.isArray(hiddenProjectListJson)) && (hiddenProjectListJson.length > 0)) {
                    const tmpProjectList = hiddenProjectListJson[0];
                    var portfolioProjectList = [];
                    for(obj of tmpProjectList) {
                        portfolioProjectList.push(obj.id);
                    }
                    
                    portfolio.projectList = portfolioProjectList;
                }
            }

            /////////////  CV File  ///////////////////////////////////////////////////////////////////////////////////
            // A CV file is present in req object
            if((req.files !== 'undefined') && (req.files) && (Array.isArray(req.files)) && (req.files.length > 0)) {
                const cvObj = req.files[0];
                const publicCVFolder = "/users/" + req.user.google.id + "/cv/";
                
                // A cv file was already uploaded
                if(portfolio.cv.length > 0) {
                    // remove any previous uploaded CV files
                    fs.unlink("./public" + portfolio.cv, (err, result) => {
                        if(err) {
                            console.log("Failed to delete old cv file: " + err);
                        }

                        // move file from upload folder to user's cv folder
                        fs.rename(cvObj.path, "./public" + publicCVFolder + cvObj.originalname, (err) => {
                            if(err) {
                                // set a error flash message
                                req.flash('errors', 'Oooops: Error trying to move cv file from uploads folder');
                                
                                // redirect to the home page
                                res.redirect('/');
                            }

                            portfolio.cv = publicCVFolder + cvObj.originalname;
                            portfolio.save((err) => {
                                if(err) {
                                    // set a error flash message
                                    req.flash('errors', 'Oooops: Cannot edit portfolio for user ' + req.user.google.name);
                                    
                                    // redirect to the home page
                                    res.redirect('/');
                                }
                
                                // set a successful flash message
                                req.flash('success', 'Successfully updated portfolio!');

                                res.redirect('/portfolios/editPortfolio');
                            });
                        });
                    });
                }
                // No cv file was previously uploaded
                else {
                    // move file from upload folder to user's cv folder
                    fs.rename(cvObj.path, "./public" + publicCVFolder + cvObj.originalname, (err) => {
                        if(err) {
                            // set a error flash message
                            req.flash('errors', 'Oooops: Error trying to move cv file from uploads folder');
                            
                            // redirect to the home page
                            res.redirect('/');
                        }

                        portfolio.cv = publicCVFolder + cvObj.originalname;
                        portfolio.save((err) => {
                            if(err) {
                                // set a error flash message
                                req.flash('errors', 'Oooops: Cannot edit portfolio for user ' + req.user.google.name);
                                
                                // redirect to the home page
                                res.redirect('/');
                            }
            
                            // set a successful flash message
                            req.flash('success', 'Successfully updated portfolio!');
            
                            res.redirect('/portfolios/editPortfolio');
                        });
                    });
                }
            }
            // No CV file present in req object
            else {
                portfolio.save((err) => {
                    if(err) {
                        // set a error flash message
                        req.flash('errors', 'Oooops: Cannot edit portfolio for user ' + req.user.google.name);
                        
                        // redirect to the home page
                        res.redirect('/');
                    }
    
                    // set a successful flash message
                    req.flash('success', 'Successfully updated portfolio!');
    
                    res.redirect('/portfolios/editPortfolio');
                });
            }
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        }
    });
}
