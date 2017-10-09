// load mongoose
var mongoose = require('mongoose');

// the Portfolio schema
var portfolioSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    projectList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project'
        }
    ]
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Portfolio', portfolioSchema);
