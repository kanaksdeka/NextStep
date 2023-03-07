let path = require('path');
let schedulerRoot = path.join(require('app-root-dir').get(), '/server/');
let mapError = require(path.join(schedulerRoot, '/utils/codeToErrorMapping.js'));
let Elastic = require(path.join(schedulerRoot, 'api/models/Elastic'));
let async = require('async');
let chalk = require('chalk');
let textract = require('textract');
let cron = require('node-schedule');
let apiDetails = require(path.join(schedulerRoot, 'api/config/settings.js'));

global.getLogger = require(path.join(schedulerRoot, 'scheduler_log4js'));
const logger = getLogger('schedulerLogger');

/**
* Connect to Database.
*/
let mongoose = require('mongoose');

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
            auth: apiDetails.elastic.username + ':' + apiDetails.elastic.password,
            protocol: apiDetails.elastic.protocol,
            port: apiDetails.elastic.port
        }
    ]
});
// ping the client to be sure Elasticsearch is up
esclient.ping({
    requestTimeout: 30000,
}, function (error) {
    if (error) {
        console.log('%s Elastic Search Cluster is down. Please make sure Cluster is running.', chalk.red('✗'));
        process.exit();
    } else {
        console.log('%s Elastic Search Cluster is reachable.', chalk.green('✓'));
    }
});

//End of Connection to Elastic Search
setInterval(() => {
    try {
        Elastic.find(
            { isindexed: false },
            function (error, docObj) {
                if (error) {
                    logger.debug("Unable to find non indexed docuemnts  -" + error);
                    response.status(500).send(mapError.errorCodeToDesc('', '502', "scheduler"))

                } else if (docObj == null) {
                    logger.debug("docObj is set to null -", docObj);
                    response.status(204).send(mapError.errorCodeToDesc('', '204', "scheduler"))
                } else {
                    docObj.forEach(function (docToIndex) {
                        logger.debug("docObj fetched is  -", docToIndex);
                        let success = false;
                        async.waterfall([
                            function uplodToElastic(done) {
                                let config = {
                                    'preserveLineBreaks': true
                                }
                                textract.fromFileWithPath(docToIndex.ec2path, config, function (error, text) {
                                    if (error)
                                        console.log('Error is -', error)
                                    else {
                                        esclient.index({
                                            index: apiDetails.elastic.index,
                                            body: {
                                                'file': {
                                                    'filename': docToIndex.filename,
                                                    'url': docToIndex.awsurl
                                                },
                                                'content': text
                                            }
                                        })
                                            .then(response => {
                                                logger.debug("Indexing successful for-", docToIndex.filename);
                                                success = true;
                                                done(null, success)
                                            })
                                            .catch(err => {
                                                logger.debug("Indexing failure  for-", docToIndex.filename + '::  error -', err);
                                                done(null, success)
                                            })

                                    }
                                })

                            },
                            function updateInElasticDoc(success, done) {
                                if (success == false) {
                                    logger.debug("Failure received from Indexing of -", docToIndex.filename);
                                    done(null, success)
                                } else {
                                    Elastic.findOneAndUpdate({ _id: docToIndex._id }, { $set: { isindexed: true } }, { new: true }, (err, doc) => {
                                        if (err) {
                                            logger.debug("Something wrong when updating data! -", err);
                                            success = false;
                                            done(null, success)
                                        } else {
                                            logger.debug("Update of document Success for file - ", docToIndex.filename + ':: document index is -', docToIndex._id);
                                            done(null, success)
                                        }
                                    });
                                }
                            },
                            function deleteFileFromLocal(success, done) {
                                if (success == false) {
                                    logger.debug("Failure received from Update document  -", docToIndex.filename);
                                } else {
                                    try {
                                        logger.debug("Trying to delete temp file -", docToIndex.filename);
                                        fs.unlink(docToIndex.ec2path, (err) => {
                                            if (err) {
                                                logger.error("Delete of temp file failed -", docToIndex.ec2path);
                                            } else {
                                                logger.debug("Deleted temp file -", docToIndex.ec2path);
                                            }
                                        });
                                    } catch (err) {
                                        logger.debug("Exception while deleting temp file  -", docToIndex.ec2path);
                                    }

                                }
                            },

                        ], (err) => {
                            if (err) {
                                logger.debug("Scheduler Error in Async Waterfall -" + err);
                            }
                        }); // End of Async waterfall
                    });//End of foreach
                }
            })
    } catch (error) {
        logger.error("Error on -" + new Date + ":: Dec -" + JSON.stringify(error))
    }
}, 300000); // Every 5 minutes i.e 300 Sec. the value is in milli for setinterval 300000 , one minute is 60000


function stop() {
    logger.debug("Applicaiton Stopped calling release DB Connection");
    releaseDBConnection();
    server.close();
}

var releaseDBConnection = function () {
    logger.debug("Releasing DB Connection");
    mongoose.connection.close();
    process.exit();

}


process.on('SIGINT', releaseDBConnection);

process.on('SIGTERM', releaseDBConnection);

process.on('SIGQUIT', releaseDBConnection);