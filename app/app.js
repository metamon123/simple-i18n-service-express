var express = require('express');
var logger = require('morgan');

var api_router = require('./routes/api');
var sequelize = require('./models').sequelize;

var app = express();
sequelize.sync();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', api_router);

module.exports = app;
