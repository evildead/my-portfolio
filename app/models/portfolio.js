// load mongoose
var mongoose = require('mongoose');

// the Portfolio schema
var portfolioSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    userDescription: {
        type: String,
        default: ''
    },
    projectList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project'
        }
    ],
    webportals: {
        github:         String,
        stackoverflow:  String,
        linkedin:       String,
        hackerrank:     String
    },
    cv: String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Portfolio', portfolioSchema);
