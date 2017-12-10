// User model
const User = require('./models/user');
// Project model
const Project = require('./models/project');
// Portfolio model
const Portfolio = require('./models/portfolio');

module.exports = {
    getProjectAndAdjacents: getProjectAndAdjacents
}

/**
 * Get project and adjacents (previous and successive ones)
 * The object passed to callback is made like this
 * {
 *     current: null | obj
 *     previous: null | obj
 *     successive: null | obj
 * }
 * 
 * @param {Integer or String} googleid: google number identifier or google email
 * @param {String} projectslug: slugified project title
 * @param {Function} callback: callback which takes two parameters (err, obj)
 */
function getProjectAndAdjacents(googleid, projectslug, callback) {
    User.findOne({$or: [{'google.id' : googleid}, {'google.eslug' : googleid}]}, function(err, user) {
        if(err) {
            return callback(new Error(err), null);
        }
        if(user == null) {
            return callback(new Error('No User Found'), null);
        }

        // look for user's portfolio
        Portfolio.findOne({'createdBy' : user.id})
            .populate('createdBy')
            .populate({ 
                path: 'projectList',
                populate: {
                    path: 'createdBy',
                    model: 'User'
                } 
            })
            .exec(function(err, portfolio) {
                if(err) {
                    return callback(new Error(err), null);
                }
                if(portfolio == null) {
                    return callback(new Error('No Project Found'), null);
                }

                let projects = portfolio.projectList;

                let foundProj = projects.find((proj) => {
                    return proj.slug == projectslug;
                });

                if(typeof(foundProj) == 'undefined') {
                    return callback(new Error('No Project Found'), null);
                }

                let projectArr = {
                    current: foundProj,
                    previous: null,
                    successive: null
                };

                let foundProjIndex = projects.indexOf(foundProj);
                if(foundProjIndex < (projects.length-1)) {
                    projectArr.successive = projects[foundProjIndex+1];
                }
                if(foundProjIndex > 0) {
                    projectArr.previous = projects[foundProjIndex-1];
                }

                return callback(null, projectArr);
            });
    });
}
