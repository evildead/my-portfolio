// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt');

// google profile: https://developers.google.com/+/web/api/rest/latest/people#resource

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String,
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : {type: String, index: true},
        name         : {type: String, index: true},
        imageUrl     : String,
        eslug        : String
    },
    mustacceptterms  : {
        type: Boolean,
        default: 'false'
    }
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// make sure that the google.eslug is created from google.email
// when we execute save, the terms will have been accepted
userSchema.pre('save', function(next) {
    this.google.eslug = eslugify(this.google.email);
    next();
});

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);

// function to slugify a google email
function eslugify(email) {
    let splitted = email.split('@');
    if(splitted.length > 0) {
        return splitted[0].toString().toLowerCase();
    }
    // invalid email
    else {
        return '';
    }
}
