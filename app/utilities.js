const async = require('async'),     // require async
    fsExtra = require('fs-extra');  // require fs-extra

let mongoose = require('mongoose'); // require mongoose

// User model
const User = require('./models/user');
// Project model
const Project = require('./models/project');
// Portfolio model
const Portfolio = require('./models/portfolio');

module.exports = {
    isUrlValid: isUrlValid,
    isValidUserMediaUrl: isValidUserMediaUrl,
    slugifyProject: slugifyProject,
    initUserFolderStructure: initUserFolderStructure,
    getProjectAndAdjacents: getProjectAndAdjacents
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
    return url.startsWith('/users/' + userId +'/media/') ? true : false;
}

/**
 * function to slugify a project name
 * @param {String} text => the project name
 */
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
 * Init the user folder structure
 * @param {Number} userId 
 * @param {Function} externCallback 
 */
function initUserFolderStructure(userId, externCallback) {
    // Use async.parallel to create two folder structures in parallel: 
    // '/public/users/{userId}/cv' and '/public/users/{userId}/media'
    async.parallel([
        function(callback) { //This is the first task, and `callback` is its callback task
            fsExtra.ensureDir('./public/users/' + userId + '/cv', (err) => {
                if (err) console.error(err);
                //Now we have created the folder structure, so let's tell Async that this task is done
                callback();
            });
        },
        function(callback) { //This is the second task, and `callback` is its callback task
            fsExtra.ensureDir('./public/users/' + userId + '/media', (err) => {
                if (err) console.error(err);
                //Now we have created the folder structure, so let's tell Async that this task is done
                callback();
            });
        },
    ], function(err) { //This is the final callback
        externCallback();
    });
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
