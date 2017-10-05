// Project model
const Project = require('../models/project');

// Portfolio model
const Portfolio = require('../models/portfolio');

module.exports = {
    createDummy: createDummy
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
    newUserPortfolio.projectList = [];

    const project1 = new Project();
    project1.createdBy = req.user.id;
    project1.name = 'reacttocurrex';
    project1.title = 'React to Currency Exchange';
    project1.briefDescription = '"React to Currency Exchange" is a one-page application built using ReactJS';
    project1.detailedDescription = '"React to Currency Exchange" is a one-page application built using ReactJS. It computes currency exchange by using the latest exchange rates provided by the fixer.io API <br><a href="https://evildead.github.io/reacttocurrex">https://evildead.github.io/reacttocurrex</a>';
    project1.mediaList = [{
            mediaUrl: 'https://www.broadlandshoa.org/wp-content/uploads/2016/02/basketball_hoop.png',
            description: 'Throwing into a basket.'
        },
        {
            mediaUrl: 'http://www.nhs.uk/Livewell/fitness/PublishingImages/getting%20started%20guides/T_1216_swimming_612848960_A.jpg',
            description: 'Michael Phelps is the fast fish.'
        },
        {
            mediaUrl: 'http://tamildiplomat.com/wp-content/uploads/2016/09/Weight-Lifting.gif',
            description: 'Lifting heavy things up'
        }
    ];
    // save the project1
    project1.save((err) => {
        if(err) {
            throw err;
        }
        newUserPortfolio.projectList.push(project1.id);
    });

    const project2 = new Project();
    project2.createdBy = req.user.id;
    project2.name = 'create-a-crud-app-with-node-and-mongodb';
    project2.title = 'Create a CRUD App with NodeJS and Mongodb';
    project2.briefDescription = 'This is a CRUD application built with NodeJS in a Scotch.io course';
    project2.detailedDescription = 'This is a CRUD application built with NodeJS in a Scotch.io course<br>It features: Create, Read, Update, Delete of Olympics events';
    project2.mediaList = [{
            mediaUrl: 'http://www.bloglet.com/gallery/country-artists/country-artists.png',
            description: 'Country is beautiful.'
        },
        {
            mediaUrl: 'https://pbs.twimg.com/profile_images/755476864563613697/z1GgG2Ht.jpg',
            description: 'Hard Rock kicks asses!'
        },
        {
            mediaUrl: 'https://i.pinimg.com/736x/42/ca/bd/42cabd4006153a3856f7a5863dff8549--heavy-metal-music-heavy-metal-bands.jpg',
            description: 'Heavy Metal is the law \mm/'
        }
    ];
    // save the project2
    project2.save((err) => {
        if(err) {
            throw err;
        }
        newUserPortfolio.projectList.push(project2.id);
    });

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

    // seeded!
    res.send('Portfolio created!');
}
