/**
 * Express configuration
 */

'use strict';

var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var compression = require('compression');
var argv = require('minimist')(process.argv.slice(2));
var swagger = require("swagger-node-express");
var bodyParser = require( 'body-parser' );
var subpath = express();
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('./environment');
//var expressValidator = require("express-validator");
var addRequestId = require('express-request-id')();


var cors = require('cors');
module.exports = function(app) {
  var env = app.get('env');

  app.set('views', config.root + '/views');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser());
  //app.use(cors({preflightContinue:true,headers:'Content-Type,X-Requested-With,Origin,If-Modified-Since,Authorization,accept,XMLHttpRequest' }));
  app.use(cors());
  app.disable('etag');
  //app.use(expressValidator());
  app.use(addRequestId);

  var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,// some legacy browsers (IE11, various SmartTVs) choke on 204 ,
    preflightContinue:true,
    headers:'Content-Type,X-Requested-With,Origin,If-Modified-Since,Authorization,accept,XMLHttpRequest'
  }
  //app.options('*', cors())

  //app.use(cors(corsOptions));

  app.use("/docs", subpath);
  swagger.setAppHandler(subpath);
/*
  swagger.setApiInfo({
    title: "example Express & Swagger API",
    description: "API to do something, manage something...",
    termsOfServiceUrl: "",
    contact: "yourname@something.com",
    license: "",
    licenseUrl: ""
});*/

  if ('production' === env) {
     app.use(express.static(path.join(config.root, '../client')));

    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last

    subpath.get('/', function (req, res) {
        res.render(path.join(config.root, '../client') + '/index.html');
    });

    swagger.configureSwaggerPaths('', 'api-docs', '');

  }

  if ('development' === env || 'test' === env) {
    app.use(require('connect-livereload')());
    app.use(express.static(path.join(config.root, '../client')));

    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last

    subpath.get('/', function (req, res) {
        res.render(path.join(config.root, '../client') + '/index.html');
    });

    swagger.configureSwaggerPaths('', 'api-docs', '');
  }
};
