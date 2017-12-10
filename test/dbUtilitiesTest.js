let mongoose = require('mongoose');     // require mongoose

// require functions to test
const getProjectAndAdjacents = require('../app/db-utilities').getProjectAndAdjacents;

//Require the dev-dependencies
let chai = require('chai');
let should = chai.should();
let expect = chai.expect;
let assert = chai.assert;

// load environment variables
require('dotenv').config();

//Our parent block
describe('DB Utilities', () => {
    // connect to database before starting the tests
    before((done) => {
        mongoose.connect(process.env.DB_URI, done);
    });

    // close connection to database after finishing all the tests
    after((done) => {
        mongoose.connection.close(done);
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
