const fsExtra = require('fs-extra');    // require fs-extra
let mongoose = require('mongoose');     // require mongoose

// require functions to test
const isUrlValid = require('../app/utilities').isUrlValid;
const isValidUserMediaUrl = require('../app/utilities').isValidUserMediaUrl;
const slugifyProject = require('../app/utilities').slugifyProject;
const initUserFolderStructure = require('../app/utilities').initUserFolderStructure;
const getProjectAndAdjacents = require('../app/utilities').getProjectAndAdjacents;

//Require the dev-dependencies
let chai = require('chai');
let should = chai.should();
let expect = chai.expect;
let assert = chai.assert;

// load environment variables
require('dotenv').config();

//Our parent block
describe('Utilities', () => {
    // connect to database before starting the tests
    before((done) => {
        mongoose.connect(process.env.DB_URI, done);
    });

    // close connection to database after finishing all the tests
    after((done) => {
        mongoose.connection.close(done);
    });

    //isUrlValid: https://upload.wikimedia.org/wikipedia/commons/a/ae/Michael_Jordan_in_2014.jpg
    describe('isUrlValid method with: https://upload.wikimedia.org/wikipedia/commons/a/ae/Michael_Jordan_in_2014.jpg', () => {
        it('The url should be a valid one', () => {
            expect(isUrlValid('https://upload.wikimedia.org/wikipedia/commons/a/ae/Michael_Jordan_in_2014.jpg')).to.be.true;
        });
    });

    //isUrlValid: /I/am/an/invalid/u.rl
    describe('isUrlValid method with: /I/am/an/invalid/u.rl', () => {
        it('The url should be a non valid one', () => {
            expect(isUrlValid('/I/am/an/invalid/u.rl')).to.be.false;
        });
    });

    //isValidUserMediaUrl: url => /users/654111/media/testProj/9j4AAQ15090613761117517008014297131.jpeg, userId => 654111
    describe('isValidUserMediaUrl method with: url => /users/654111/media/testProj/9j4AAQ15090613761117517008014297131.jpeg and userId => 654111', () => {
        it('The url should be correct', () => {
            expect(isValidUserMediaUrl('/users/654111/media/testProj/9j4AAQ15090613761117517008014297131.jpeg', 654111)).to.be.true;
        });
    });

    //isValidUserMediaUrl: url => /users/654111/media/testProj/9j4AAQ15090613761117517008014297131.jpeg, userId => 658111
    describe('isValidUserMediaUrl method with: url => /users/654111/media/testProj/9j4AAQ15090613761117517008014297131.jpeg and userId => 658111', () => {
        it('The url should not be correct', () => {
            expect(isValidUserMediaUrl('/users/654111/media/testProj/9j4AAQ15090613761117517008014297131.jpeg', 658111)).to.be.false;
        });
    });

    //isValidUserMediaUrl: url => /users/658111/media/testProj/9j4AAQ15090613761117517008014297131.jpeg, userId => 658111
    describe('isValidUserMediaUrl method with: url => /users/658111/mdia/testProj/9j4AAQ15090613761117517008014297131.jpeg and userId => 658111', () => {
        it('The url should not be correct', () => {
            expect(isValidUserMediaUrl('/users/658111/mdia/testProj/9j4AAQ15090613761117517008014297131.jpeg', 658111)).to.be.false;
        });
    });

    //slugifyProject: 'Welcome to My-Portfolio'
    describe('slugifyProject method with: name => Welcome to My-Portfolio', () => {
        it('The slugified name should not contain spaces', () => {
            let slugified = slugifyProject('Welcome to My-Portfolio');
            slugified.should.not.include(' ');
        });
    });

    //slugifyProject: 'Welcome to My-Portfolio'
    describe('slugifyProject method with: name => Welcome to My-Portfolio', () => {
        it('The slugified name should be welcome_to_my_portfolio', () => {
            let slugified = slugifyProject('Welcome to My-Portfolio');
            slugified.should.equal('welcome_to_my_portfolio');
        });
    });

    //initUserFolderStructure: user id 658111
    describe('initUserFolderStructure method with: userId => 658111', () => {
        //Before each test we remove the folder ./public/users/658111
        beforeEach(() => {
            fsExtra.removeSync('./public/users/658111');
        });

        //After each test we remove the folder ./public/users/658111
        afterEach(() => {
            fsExtra.removeSync('./public/users/658111');
        });

        it('The folder ./public/users/658111/cv should exist', (done) => {
            initUserFolderStructure(658111, () => {
                let pathExists = fsExtra.pathExistsSync('./public/users/658111/cv');
                pathExists.should.equal(true);
                done();
            });
        });
    });

    //getProjectAndAdjacents
    describe('getProjectAndAdjacents method', () => {
        it('with ("danilo.carrabino", "react_to_curr_ex") the method should pass a correct object to the callback', (done) => {
            getProjectAndAdjacents('danilo.carrabino', 'react_to_curr_ex', (err, obj) => {
                assert.isObject(obj);
                assert.isObject(obj.current);
                done();
            });
        });

        it('with ("danilo.carrabino", "myportfolio") The method should pass a correct object to the callback', (done) => {
            getProjectAndAdjacents('danilo.carrabino', 'myportfolio', (err, obj) => {
                assert.isObject(obj);
                assert.isObject(obj.current);
                done();
            });
        });

        it('with ("danilo.carrabin", "react_to_curr_ex") the value passed to obj should be null and err.message should be "No User Found"', (done) => {
            getProjectAndAdjacents('danilo.carrabin', 'react_to_curr_ex', (err, obj) => {
                assert.isNull(obj);
                expect(err).to.exist
                    .and.be.instanceof(Error)
                    .and.have.property('message', 'No User Found');
                done();
            });
        });

        it('with ("danilo.carrabino", "wrong-proj") the value passed to obj should be null and err.message should be "No Project Found"', (done) => {
            getProjectAndAdjacents('danilo.carrabino', 'wrong-proj', (err, obj) => {
                assert.isNull(obj);
                expect(err).to.exist
                    .and.be.instanceof(Error)
                    .and.have.property('message', 'No Project Found');
                done();
            });
        });

        it('with ("danilo.carrabino", "react_to_curr_e") the value passed to obj should be null and err.message should be "No Project Found"', (done) => {
            getProjectAndAdjacents('danilo.carrabino', 'react_to_curr_e', (err, obj) => {
                assert.isNull(obj);
                expect(err).to.exist
                    .and.be.instanceof(Error)
                    .and.have.property('message', 'No Project Found');
                done();
            });
        });
    });
});
