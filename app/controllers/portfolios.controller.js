// User model
const User = require('../models/user');
// Project model
const Project = require('../models/project');
// Portfolio model
const Portfolio = require('../models/portfolio');

const path = require('path'),                       // require path module
    fs = require('fs'),                             // require fs module
    summernoteSave = require('summernote-nodejs'),  // require summernote image saver
    fsExtra = require('fs-extra');                  // require fs-extra

module.exports = {
    createDummy: createDummy,
    showEraseAccount: showEraseAccount,
    processEraseAccount: processEraseAccount,
    viewPortfolioList: viewPortfolioList,
    viewPortfolio: viewPortfolio,
    viewProject: viewProject,
    showEditPortfolioInfos: showEditPortfolioInfos,
    processEditPortfolioInfos: processEditPortfolioInfos,
    showEditPortfolioProjects: showEditPortfolioProjects,
    processEditPortfolioProjects: processEditPortfolioProjects
}

/**
 * Check valid url
 * @param {String} url 
 */
function isUrlValid(url) {
    return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
}

/**
 * Check if url is a valid relative url for user's media
 * @param {String} url 
 * @param {Number} userId 
 */
function isValidUserMediaUrl(url, userId) {
    if(url.startsWith('/users/' + userId +'/media/')) {
        return true;
    }
    else {
        return false;
    }
}

// function to slugify a project name
function slugifyProject(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, '') // Trim - from end of text
        .replace(/-/g, '_'); // Replace remaining '-' with '_'
}

/**
 * Return a map built from project.mediaList array
 * @param {Object} project 
 */
function projectMediaListToMap(project) {
    let outMediaMap = new Map();
    for(media of project.mediaList) {
        outMediaMap.set(media.id, media);
    }

    return outMediaMap;
}

/**
 * Transform the asynchronous function rimraf "recursive folder remove" to Promise
 * @param {String} folderName 
 */
/*
function removeRecursiveFolderPromise(folderName) {
    return new Promise(function(resolve, reject) {
        rimraf(folderName, function(err) {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
*/

/**
 * Erase user's account => both fs folder structure and database
 * @param {Object} user 
 */
function eraseAccount(user) {
    // Promise Usage
    fsExtra.remove('./public/users/' + user.google.id)      // recursive remove public/users/{userId} folder from file system
        .then(Project.remove({'createdBy' : user.id}))      // remove all user's projects from MongoDb
        .then(Portfolio.remove({'createdBy' : user.id}))    // remove user's portfolio from MongoDb
        .then(User.remove({_id: user.id}))                  // remove user from MongoDb
        .catch(err => {
            console.error(err)
        });

    /*
    rimraf('./public/users/' + user.google.id, function(err) {
        if (err) {
            console.log(err);
        }

        // remove all user's projects from MongoDb
        Project.remove({'createdBy' : user.id}, (err) => {
            if (err) {
                console.log(err);
            }

            // remove user's portfolio from MongoDb
            Portfolio.remove({'createdBy' : user.id}, (err) => {
                if (err) {
                    console.log(err);
                }

                // remove user from MongoDb
                User.remove({_id: user.id}, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            });
        });
    });
    */
}

/**
 * Save dataImageText to file and return the relative path.
 * Return empty string on error
 * @param {String} dataImageText 
 * @param {String} pathToSaveImg 
 * @param {String} baseUrl 
 * @param {Boolean} append 
 */
function saveDataImage(dataImageText, pathToSaveImg = path.join(path.join(process.cwd(), 'images')), baseUrl = '', append = true) {
    if(!dataImageText.startsWith('data:')) {
        return '';
    }

    var splitted = dataImageText.split(';');
    if(splitted.length < 2) {
        return '';
    }

    var contentType = splitted[0];
    var encContent = splitted[1];
    if(encContent.length < 6) {
        return '';
    }
    if (encContent.substr(0,6) != 'base64') {
        return '';
    }

    var imgBase64 = encContent.substr(6);
    var imgFilename = imgBase64.substr(1,8).replace(/[^\w\s]/gi, '') + Date.now() + String(Math.random() * (900000000)).replace('.',''); // Generate a unique filename
    
    var imgExt = '';
    switch(contentType.split(':')[1]) {
        case 'image/jpeg': imgExt = 'jpg'; break;
        case 'image/gif': imgExt = 'gif'; break;
        case 'image/png': imgExt = 'png'; break;
        default: return ''; 
    }

    if (!fs.existsSync(pathToSaveImg)){
        fs.mkdirSync(pathToSaveImg);
    }
    
    var imgPath = path.join(pathToSaveImg, imgFilename+'.'+imgExt);
    var base64Data = encContent.replace(/^base64,/, "");
    fs.writeFile(imgPath, base64Data, 'base64', function(err) {
        console.log(err); // Something went wrong trying to save Image
    });
    
    if(baseUrl) {
        var formattedBaseUrl = (((baseUrl[baseUrl.len - 1]) == '/')? baseUrl : (baseUrl+'/'));
    }
    else {
        var formattedBaseUrl = './';
    }

    if(append){
        return formattedBaseUrl+pathToSaveImg+'/'+imgFilename+'.'+imgExt;
    }
    else {
        return formattedBaseUrl+imgFilename+'.'+imgExt;
    }
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
 * View the erase account page
 * @param {request} req 
 * @param {response} res 
 */
function showEraseAccount(req, res) {
    res.render('pages/showEraseAccount', {
        user : req.user
    });
}

/**
 * Perform the account removal
 * @param {request} req 
 * @param {response} res 
 */
function processEraseAccount(req, res) {
    eraseAccount(req.user);
    res.redirect(`/logout`);
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
 * View logged user's infos editing page
 * @param {request} req 
 * @param {response} res 
 */
function showEditPortfolioInfos(req, res) {
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

                    res.render('pages/showEditPortfolioInfos', {
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
                res.render('pages/showEditPortfolioInfos', {
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
 * Update logged user's infos
 * @param {request} req 
 * @param {response} res 
 */
function processEditPortfolioInfos(req, res) {
    // validate information
    req.checkBody('profileTitle', 'profileTitle is required!').notEmpty();
    req.checkBody('profileDescription', 'profileDescription is required!').notEmpty();

    // if there are errors, redirect and save errors to flash
    const errors = req.validationErrors();
    if(errors) {
        req.flash('errors', errors.map(err => err.msg));
        return res.redirect(`/portfolios/editPortfolioInfos`);
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
            res.redirect(`/portfolios/editPortfolioInfos`);
        }
        // A portfolio already exists for user req.user
        else {
            // profile title
            portfolio.profileTitle = req.body.profileTitle;

            // profile description: summernote save images (if there are any)
            var pathToSaveImg = "./public/users/" + req.user.google.id + "/media";
            var baseUrl = "/users/" + req.user.google.id + "/media";
            var outputSummernoteSave = summernoteSave(req.body.profileDescription,  // htmlContentsFromSummernote
                                                      pathToSaveImg,                // destinationFolder
                                                      baseUrl,                      // baseUrl
                                                      false);                       // append
            portfolio.profileDescription = outputSummernoteSave;


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

                                res.redirect('/portfolios/editPortfolioInfos');
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
            
                            res.redirect('/portfolios/editPortfolioInfos');
                        });
                    });
                }
            }
            // No CV file present in req object
            else {
                const cvIsDeletedInt = parseInt(req.body.cvIsDeleted);
                // user has deleted his Curriculum Vitae
                if((cvIsDeletedInt > 0) && (portfolio.cv.length > 0)) {
                    // remove any previous uploaded CV files
                    fs.unlink("./public" + portfolio.cv, (err, result) => {
                        if(err) {
                            console.log("Failed to delete old cv file: " + err);
                        }

                        portfolio.cv = '';

                        portfolio.save((err) => {
                            if(err) {
                                // set a error flash message
                                req.flash('errors', 'Oooops: Cannot edit portfolio for user ' + req.user.google.name);
                                
                                // redirect to the home page
                                res.redirect('/');
                            }
            
                            // set a successful flash message
                            req.flash('success', 'Successfully updated portfolio!');
            
                            res.redirect('/portfolios/editPortfolioInfos');
                        });
                    });
                }
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
        
                        res.redirect('/portfolios/editPortfolioInfos');
                    });
                }
            }
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        }
    });
}

/**
 * View logged user's projects editing page
 * @param {request} req 
 * @param {response} res 
 */
function showEditPortfolioProjects(req, res) {
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

                    res.render('pages/showEditPortfolioProjects', {
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
                res.render('pages/showEditPortfolioProjects', {
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
 * Update logged user's projects
 * @param {request} req 
 * @param {response} res 
 */
function processEditPortfolioProjects(req, res) {
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
            res.redirect(`/portfolios/editPortfolioProjects`);
        }
        // A portfolio already exists for user req.user
        else {
            const myPromises = [];

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
                        if(obj.isdeleted == "no") {
                            portfolioProjectList.push(obj.id);
                        }
                        else {
                            // add a 'remove media project folder promise'
                            myPromises.push(
                                fsExtra.remove('./public/users/' + req.user.google.id + '/media/' + obj.slug)
                            );
                            // add a 'remove project from mongoDb promise'
                            myPromises.push(
                                Project.remove({_id: obj.id}, (err) => {
                                    if(err) {
                                        console.log("Failed to delete project: " + obj.slug);
                                    }
                                })
                            );
                        }
                    }
                    
                    // update portfolio's projectList
                    portfolio.projectList = portfolioProjectList;
                }
                else {
                    // set a error flash message
                    req.flash('errors', 'Oooops: cannot find the project list structure while editing portfolio for user ' + req.user.google.name);
                    // redirect to the edit portfolio page
                    res.redirect(`/portfolios/editPortfolioProjects`);
                }
            }
            else {
                // set a error flash message
                req.flash('errors', 'Oooops: cannot find the project list structure while editing portfolio for user ' + req.user.google.name);
                // redirect to the edit portfolio page
                res.redirect(`/portfolios/editPortfolioProjects`);
            }

            // Check if there's a project to be added/updated
            if((req.body.projectId !== 'undefined') && (req.body.projectId)) {
                // add a new project
                if(req.body.projectId == '0') {
                    const newProject = new Project();
                    newProject.createdBy = req.user.id;
                    newProject.name = req.body.projectName;
                    newProject.title = req.body.projectTitle;
                    newProject.briefDescription = req.body.projectBriefDescription;
                    newProject.detailedDescription = req.body.projectDetailedDescription;
                    newProject.mediaList = [];

                    /**
                     * Handle project images here
                     */
                    if( (req.body.hiddenMediaList !== 'undefined') &&
                        (req.body.hiddenMediaList) &&
                        (req.body.hiddenMediaList.length > 0) ) {
                        // parse string to JSON
                        let hiddenMediaListJson = JSON.parse(req.body.hiddenMediaList);
                        
                        if((Array.isArray(hiddenMediaListJson)) && (hiddenMediaListJson.length > 0)) {
                            let tmpMediaList = hiddenMediaListJson[0];
                            let projectMediaList = [];
                            for(obj of tmpMediaList) {
                                if(obj.isdeleted == "no") {
                                    if(isUrlValid(obj.mediaurl) || isValidUserMediaUrl(obj.mediaurl, req.user.google.id)) {
                                        projectMediaList.push({
                                            mediaUrl: obj.mediaurl,
                                            mediaTitle: obj.mediatitle,
                                            description: obj.mediadescription
                                        });
                                    }
                                    // check if we have a Data Text Image
                                    else if(obj.mediaurl.startsWith('data:')) {
                                        let pathToSaveImg = "./public/users/" + req.user.google.id + "/media/" + slugifyProject(newProject.name);
                                        let baseUrl = "/users/" + req.user.google.id + "/media/" + slugifyProject(newProject.name);
                                        let outputSave = saveDataImage(obj.mediaurl,  // mediaurl data
                                                                       pathToSaveImg, // destinationFolder
                                                                       baseUrl,       // baseUrl
                                                                       false);        // append
                                        if(isValidUserMediaUrl(outputSave, req.user.google.id)) {
                                            projectMediaList.push({
                                                mediaUrl: outputSave,
                                                mediaTitle: obj.mediatitle,
                                                description: obj.mediadescription
                                            });
                                        }
                                    }
                                }
                            }
                            newProject.mediaList = projectMediaList;
                        }
                    }

                    // add promise
                    myPromises.push(
                        // add the newProject to mongoDB
                        newProject.save((err) => {
                            if(err) {
                                throw err;
                            }
                            portfolio.projectList.push(newProject.id);
                        })
                    );
                }
                // update an existing project
                else {
                    // look for the project created by user.id with slug = req.params.projectslug
                    Project.findOne({_id : req.body.projectId})
                        .populate('createdBy')
                        .exec(function(err, project) {
                            if(err) { throw err; }
                            
                            // cannot find project
                            if(project == null) {
                                // set a error flash message
                                req.flash('errors', 'Oooops: Cannot update project for user ' + req.user.google.name);
                                // redirect to the home page
                                res.redirect('/');
                            }
                            
                            // project found
                            project.name = req.body.projectName;
                            project.title = req.body.projectTitle;
                            project.briefDescription = req.body.projectBriefDescription;
                            project.detailedDescription = req.body.projectDetailedDescription;

                            let projectMediaMap = projectMediaListToMap(project);

                            /**
                             * Handle project images here
                             */
                            if( (req.body.hiddenMediaList !== 'undefined') &&
                                (req.body.hiddenMediaList) &&
                                (req.body.hiddenMediaList.length > 0) ) {
                                // parse string to JSON
                                let hiddenMediaListJson = JSON.parse(req.body.hiddenMediaList);
                                
                                if((Array.isArray(hiddenMediaListJson)) && (hiddenMediaListJson.length > 0)) {
                                    let tmpMediaList = hiddenMediaListJson[0];
                                    let projectMediaList = [];
                                    for(obj of tmpMediaList) {
                                        if(obj.isdeleted == "no") {
                                            if(isUrlValid(obj.mediaurl) || isValidUserMediaUrl(obj.mediaurl, req.user.google.id)) {
                                                projectMediaList.push({
                                                    mediaUrl: obj.mediaurl,
                                                    mediaTitle: obj.mediatitle,
                                                    description: obj.mediadescription
                                                });
                                            }
                                            // check if we have a Data Text Image
                                            else if(obj.mediaurl.startsWith('data:')) {
                                                let pathToSaveImg = "./public/users/" + req.user.google.id + "/media/" + slugifyProject(project.name);
                                                let baseUrl = "/users/" + req.user.google.id + "/media/" + slugifyProject(project.name);
                                                let outputSave = saveDataImage(obj.mediaurl,  // mediaurl data
                                                                               pathToSaveImg, // destinationFolder
                                                                               baseUrl,       // baseUrl
                                                                               false);        // append
                                                console.log(outputSave);
                                                if(isValidUserMediaUrl(outputSave, req.user.google.id)) {
                                                    projectMediaList.push({
                                                        mediaUrl: outputSave,
                                                        mediaTitle: obj.mediatitle,
                                                        description: obj.mediadescription
                                                    });
                                                }
                                            }
                                        }
                                        // remove file if it was a local one
                                        else if((obj.isdeleted == "yes") && (projectMediaMap.get(obj.id)) && (isValidUserMediaUrl(projectMediaMap.get(obj.id)))) {
                                            let mediaInMap = projectMediaMap.get(obj.id);
                                            if((mediaInMap) && isValidUserMediaUrl(mediaInMap.mediaUrl)) {
                                                myPromises.push(
                                                    fsExtra.remove('./public' + mediaInMap.mediaUrl)
                                                );
                                            }
                                        }
                                    }
                                    project.mediaList = projectMediaList;
                                }
                            }

                            // add promise
                            myPromises.push(
                                // update project to mongoDB
                                project.save((err) => {
                                    if(err) {
                                        throw err;
                                    }
                                })
                            );
                        });
                }
            }
            
            // Update the portfolio at the end of the execution of all the promises
            Promise.all(myPromises).then(values => {
                // update the portfolio
                portfolio.save((err) => {
                    if(err) { throw err; }
                    // set a successful flash message
                    req.flash('success', 'Successfully updated portfolio!');
                    // redirect to the projects editing page
                    res.redirect(`/portfolios/editPortfolioProjects`);
                });
            });
        }
    });
}
