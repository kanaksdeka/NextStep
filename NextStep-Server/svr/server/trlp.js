/**
 * Main application file
 */
'use strict';
var location_env = require('./config/local.env.js');
const chalk = require('chalk');
const fs = require('fs');


// Set default node environment to development
var PORT = location_env.PORT
process.env.NODE_ENV = location_env.NODE_ENV || 'development';



if (process.env.NODE_ENV === 'production') {
    console.log = function() {};
}
// Set Client id to default
process.env.CLIENT_ID = location_env.CLIENT_ID || 'default';
//console.log("CLIENT_ID" + process.env.CLIENT_ID );



// Set port to 9001 as default
process.env.PORT = location_env.PORT || '9001';


var express = require('express');
//var busboyBodyParser = require('busboy-body-parser');

var config = require('./config/environment');
var apiDetails = require('./api/config/settings.js');


// Setup server
var app = express();
//app.use(busboyBodyParser({ limit: '5mb' }));

global.getLogger = require('./log4js.js');


var apiv = require('api-version');
global.api1 = apiv.version(app, '', 'v1');
global.api2 = apiv.version(app, '', 'v2');

var path = require('path');
var cluster = require('cluster');
require('./config/express')(app);


var appRoot = path.join(require('app-root-dir').get(), '/server/');
global.errorHandler = require(path.join(appRoot, '/utils/codeToErrorMapping.js'));
var routes = require('./routes')(app);

var server = {};
var logger = getLogger('pwr-service-startup');

/**
 * Connect to Database.
 */
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

console.log("Mongo URL -" + apiDetails.PTU_MONGODB_URL);
mongoose.connect(apiDetails.PTU_MONGODB_URL, 
{ 
	//useMongoClient: true
       keepAlive: 1,
       useNewUrlParser: true,
        useUnifiedTopology: true,

 });
mongoose.connection.on('error', () => {
    console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
    process.exit();
});
//global.mongoose = require('mongoose');

//Connect to Elastic Search


const elasticsearch = require('elasticsearch');
// instantiate an elasticsearch client
global.esclient = new elasticsearch.Client({
    host: [
        {
          host: apiDetails.elastic.host,
          auth: apiDetails.elastic.username+':'+apiDetails.elastic.password,
          protocol: apiDetails.elastic.protocol,
          port: apiDetails.elastic.port
        }
      ]
});
// ping the client to be sure Elasticsearch is up
esclient.ping({
     requestTimeout: 30000,
 }, function(error) {
     if (error) {
        console.log('%s Elastic Search Cluster is down. Please make sure Cluster is running.', chalk.red('✗'));
        process.exit();
     } else {
        console.log('%s Elastic Search Cluster is reachable.', chalk.green('✓'));
    }
 });

//End of Connection to Elastic Search

// include passport authentication (after mongo since it requires it)
global.passport = require('passport');
require("./config/passport-configuration");
app.use(passport.initialize());
app.use(passport.session());

// db query configs
global.queryTimeout = 5000;
global.noOfRecordsToBefetched = 100;

//Initiate the singleton instances
var Mapper = require('./mapper');
global.mapper = new Mapper().getInstance();
mapper.fillSubjectMap();
mapper.fillSectionMap();
mapper.fillSemesterMap();
mapper.fillClassMap();
mapper.fillTeacherMap();
mapper.fillStudentMap();

try {

    // Code to run if we're in the master process
    if (cluster.isMaster) {
        var cpuCount = require('os').cpus().length;
        if (cpuCount === 1) {
            // Server is master and is not running in cluster
            server = require('http').createServer(app);

            server.listen(config.port, config.ip, () => {
                logger.info('Trueleap Service listening on %d, in %s mode', config.port, app.get('env'));
                console.log('%s App in HTTP mode is running at http://localhost:%d in %s mode', chalk.green('✓'), config.port, app.get('env'));
                console.log('  Press CTRL-C to stop\n');
            });

           /* server = require('https').createServer({
                 
               key: fs.readFileSync(path.join(appRoot, 'certificate/trueleap.key')),
                cert: fs.readFileSync(path.join(appRoot, 'certificate/trueleap_io.chained.crt')), //blocked as certificate moved to nginx
                //ca: fs.readFileSync('certificate/gd_bundle-g2-g1.crt'),
              },app).listen(config.port, config.ip, function() {
                logger.info('Worker Sharing PORT - %d, in %s mode', config.port, app.get('env'));
                logger.info('Trueleap Service listening on %d, in %s mode', config.port, app.get('env'));
                console.log('%s Truleap in HTTPS mode is running at http://localhost:%d in %s mode', chalk.green('✓'), config.port, app.get('env'));
                console.log('  Press CTRL-C to stop\n');

            });*/



        } else {
            console.log("Creating Worker for each CPU ")
            logger.info('CPU Count is -' + cpuCount);
            logger.info(`Master ${process.pid} is running`);
            // Create a worker for each CPU
            for (var i = 0; i < cpuCount; i += 1) {
                var id = i
                logger.info('Forking for cluster -' + (++id));
                cluster.fork();
            }
            // Listen for dying workers
            cluster.on('exit', (worker, code, signal) => {
                logger.error(`worker ${worker.process.pid} died`);
            });
        }
	
    } else {
        server = require('http').createServer(app);

        server.listen(config.port, config.ip, () => {
            logger.info('Trueleap Service listening on %d, in %s mode', config.port, app.get('env'));
            console.log('%s App in HTTP mode is running at http://localhost:%d in %s mode', chalk.green('✓'), config.port, app.get('env'));
            console.log('  Press CTRL-C to stop\n');
        });
      
      
        // Start server https
       /* server = require('https').createServer({
           key: fs.readFileSync(path.join(appRoot, 'certificate/trueleap.key')),
            cert: fs.readFileSync(path.join(appRoot, 'certificate/trueleap_io.chained.crt')), //blocked as certificate moved to nginx
            //ca: fs.readFileSync('certificate/gd_bundle-g2-g1.crt')
          },app).listen(config.port, config.ip, function() {
            logger.info('Worker Sharing PORT - %d, in %s mode', config.port, app.get('env'));
        });*/

    }
} catch (exp) {
    logger.error("exiting the process due to start up issues" + exp.stack);
}



function stop() {
    releaseDBConnection();
    server.close();
}

var releaseDBConnection = function() {
    mongoose.connection.close();
    process.exit();
}


process.on('SIGINT', releaseDBConnection);

process.on('SIGTERM', releaseDBConnection);

process.on('SIGQUIT', releaseDBConnection);

exports = module.exports = app;



