// load mongoose
var mongoose = require('mongoose');

var projectSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ''
    },
    briefDescription: {
        type: String,
        default: ''
    },
    detailedDescription: {
        type: String,
        default: ''
    },
    mediaList: [
        {
            mediaUrl: {
                type: String,
                default: ''
            },
            description: {
                type: String,
                default: ''
            }
        }
    ]
});

// create the model for project and expose it to our app
module.exports = mongoose.model('Project', projectSchema);
