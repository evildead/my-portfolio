const fsExtra = require('fs-extra');    // require fs-extra

// require functions to test
const isUrlValid = require('../app/utilities').isUrlValid;
const isValidUserMediaUrl = require('../app/utilities').isValidUserMediaUrl;
const slugifyProject = require('../app/utilities').slugifyProject;
const initUserFolderStructure = require('../app/utilities').initUserFolderStructure;

//Require the dev-dependencies
let chai = require('chai');
let should = chai.should();
let expect = chai.expect;
let assert = chai.assert;

//Our parent block
describe('Utilities', () => {
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
});
