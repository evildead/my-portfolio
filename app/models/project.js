// load mongoose
var mongoose = require('mongoose');

const slugifyProject = require('../utilities').slugifyProject;

// The Project schema
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
        index: true,
        default: function() {
            return("Project " + (Math.floor(Math.random()*2000000000) + 1000));
        }
    },
    slug: {
        type: String
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
            mediaTitle: {
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

// add index
projectSchema.index({ createdBy: 1, slug: 1 }, {unique: true});

// middleware section
// make sure that the slug is created from the name
projectSchema.pre('save', function(next) {
    this.slug = slugifyProject(this.name);
    next();
});

// create the model for project and expose it to our app
module.exports = mongoose.model('Project', projectSchema);
