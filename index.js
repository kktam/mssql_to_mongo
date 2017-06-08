/*!
 * mssql_to_mongo
 * Copyright(c) 2017 Nelson Tam
 * MIT Licensed
 */

var migrater = require("./mssql_to_mongo");

// Change the config settings to match your 
// SQL Server and database
// for example, see
// https://github.com/LeanKit-Labs/seriate
var sqlConfig = {
    "server": "<your SQL server name>",
    "user": "<your SQL server account",
    "password": "<your account password>",
    "database": "<SQL server database>"
};
var sqlTable = "<SQL database table name>";

var mongoDatabaseName = '<mongo database name>';
var mongoCollectionName = '<mongo collection name>';
var mongoUrl = 'mongodb://localhost:27017/' + mongoDatabaseName;

var clientCallback = function (data) {
    console.log( sqlTable + " to " + mongoCollectionName + " copied successfully!");
}

migrater.mssql_to_mongo(sqlConfig, sqlTable, mongoUrl, mongoCollectionName, clientCallback);
