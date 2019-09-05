var express = require('express');
var logger = require('morgan');

var key_api_router = require('./routes/key-api');
var lang_detect_api_router = require('./routes/lang-detect-api');
var sequelize = require('./models').sequelize;

var app = express();
sequelize.sync();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/keys', key_api_router);
app.use('/language_detect', lang_detect_api_router);

module.exports = app;
