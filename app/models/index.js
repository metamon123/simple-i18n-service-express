'use strict';

var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config/config.json')[env];
var db = {};

/* -- Initialize Sequelize to connect DB -- */
var sequelize = new Sequelize({
  ...config,
  define: {
    timestamps: false
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

/* -- Import data models -- */
fs.readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf('.') !== 0) && (file !== 'index.js');
    })
    .forEach(function(file) {
        var model = sequelize['import'](path.join(__dirname, file));
        var capitalized_name = model.name.charAt(0).toUpperCase() + model.name.slice(1);
        db[capitalized_name] = model;
    });

module.exports = db;