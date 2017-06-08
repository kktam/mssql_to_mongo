/*!
 * mssql_to_mongo
 * Copyright(c) 2017 Nelson Tam
 * MIT Licensed
 */

// mssql_to_mongo 
// uses Seriate to copy the SQL server data, and 
// insert it into Mongo DB
// https://github.com/LeanKit-Labs/seriate

// Node events module
var events = require('events');
// MSSQL library
var sql = require("seriate");
// Mongo DB
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

// Module exports
exports.mssql_to_mongo = function (sqlConfig, sqlTable, mongoUrl, mongoCollection, clientCallback) {
    // validate input
    if (typeof sqlTable != 'string' || sqlTable == '') {
        console.log("Please provide a valid MS SQL Table name");
        return;
    }
    if (typeof sqlTable != 'string' || mongoCollection == '') {
        console.log("Please provide a valid Mongo collection name");
        return;
    }    

    var debug = 0;
    var tabledata = [];

    // insert a single document into Mongo collection
    var insertDocument = function (db, mongoCollection, data, callback) {
        db.collection(mongoCollection).insertOne(data, function (err, result) {
            assert.equal(err, null);
            if (debug)  { console.log("Inserted a document into the " + mongoCollection + " collection."); }
            if (typeof callback != 'undefined') { callback(); }
        });
    };

    // get triggered when SQL server table is fully extracted
    var sqlListen = function () {
        if (debug) console.log(tabledata);

        // connect to Mongo DB
        MongoClient.connect(mongoUrl, function (err, db) {
            assert.equal(null, err);

            //create collection
            db.createCollection(mongoCollection, function (err, collection) {
                if (err) throw err;

                console.log("Created " + mongoCollection);
                console.log(collection);

                if (tabledata.length > 0) {
                    for (var i = 0; i < tabledata.length; i++) {
                        insertDocument(db, mongoCollection, tabledata[i], function () { });
                    }
                }

                // close db
                db.close();

                // call client callback
                if (typeof clientCallback == 'function' && clientCallback != null) {
                    clientCallback(tabledata);
                }
            });

        });
    }

    // Create an eventEmitter object
    var eventEmitter = new events.EventEmitter();
    eventEmitter.addListener('mssql-done', sqlListen);

    sql.setDefaultConfig(sqlConfig);

    sql.execute({
        query: "SELECT * FROM " + sqlTable
    }).then(function (results) {
        if (debug) console.log(results);

        // save data
        tabledata = results;

        // close SQL connection
        sql.closeConnection();

        // Fire the connection event 
        eventEmitter.emit('mssql-done');
    }, function (err) {
        console.log("Something bad happened:", err);
    });
};