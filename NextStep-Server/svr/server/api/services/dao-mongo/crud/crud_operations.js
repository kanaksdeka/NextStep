'use strict';

let co = require('co');
let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let mapError = require(path.join(appRoot, '/utils/codeToErrorMapping.js'));

function mongoOperation() {

}

mongoOperation.prototype.init = function () {
}

mongoOperation.prototype.createMultiDocument = function(collectionName,model, payLoad, requestId,moduleName) {
    let logger = getLogger('mongoOperation');

    let _requestId = typeof requestId !== 'undefined' && requestId.length > 0 ? requestId : '';
    let finalResponse={};
    if (logLevel === "INFO") {
        logger.info("requestId :: " + _requestId + "::in createData of mongoOperationjs");
    }
    /*if (logLevel === "DEBUG") {
        logger.debug("requestId :: " + _requestId + "::mongoOperation Controller :: createMultiDocument function collectionName -" +
            collectionName + " and payload received is:" + JSON.stringify(payLoad));
    }*/
    return new Promise(function(resolve, reject) {
        co(function*() {
            model.insertMany(payLoad,function(error, response) {

                if (error) {
                    logger.error("requestId :: " + _requestId + "::error while calling mongodb insert api is:" + error +
                        " for payload is:" + JSON.stringify(payLoad));
                    reject(mapError.errorCodeToDesc(_requestId, '3060',moduleName));

                } else {
                   // if (logLevel === "DEBUG") 
                      //  logger.debug("requestId :: " + _requestId + "::mongoOperation Controller :: create Data Resolving to -" + JSON.stringify(response));
                        resolve(response);

                }
            });
        }).catch(function(err) {
            logger.error("requestId :: " + _requestId + "::mongoOperation createData error message" + err);
            reject(mapError.errorCodeToDesc(_requestId, '3060',moduleName));

        });
    });
}


mongoOperation.prototype.updateData = function (collectionName,model ,queryPayload, updatePayload, requestId,moduleName) {
    let logger = getLogger('mongoOperation');

    let _requestId = typeof requestId !== 'undefined' && requestId.length > 0 ? requestId : '';
        logger.info("requestId :: " + _requestId + "::in updateData of mongoOperationjs");
    if (logLevel === "DEBUG") {
        logger.debug("requestId :: " + _requestId + ":: updateData with collectionName - " +
            collectionName + ", queryPayload received is -" + JSON.stringify(queryPayload) +
            ", updatePayload received is -" + JSON.stringify(updatePayload));
    }
    return new Promise(function (resolve, reject) {
        try {
            model.findOneAndUpdate(queryPayload, updatePayload,{upsert: true,new:true} ,function (error, response) {

                if (error) {
                    if (logLevel === "DEBUG")
                        logger.debug("requestId :: " + _requestId + "::error while calling mongodb query api is:" + error +
                            ",queryPayload received is:" + JSON.stringify(queryPayload) +
                            ",updatePayload received is:" + JSON.stringify(updatePayload));
                    reject(mapError.errorCodeToDesc(_requestId, '3000',moduleName));
                } else {

                        if (logLevel === "DEBUG")
                            logger.debug("requestId :: " + _requestId + ":: updated with mongodb response is:" + JSON.stringify(response) +
                                ",queryPayload received is:" + JSON.stringify(queryPayload) +
                                ",updatePayload received is:" + JSON.stringify(updatePayload));
                        resolve('Success');
                }
            });
        } catch (error) {
            logger.error("requestId :: " + _requestId + "::mongoOperation updateData error message" + error);
            reject(mapError.errorCodeToDesc(_requestId, '3020',moduleName));
        }
    });
}

mongoOperation.prototype.truncateCollection = function (collectionName, model, requestId,moduleName) {
    let logger = getLogger('mongoOperation');

    let _requestId = typeof requestId !== 'undefined' && requestId.length > 0 ? requestId : '';
    if (logLevel === "INFO") {
        logger.info("requestId :: " + _requestId + ":: In truncateCollection of crud_operationsjs");
    }
    if (logLevel === "DEBUG") {
        logger.debug("requestId :: " + _requestId + "::truncateCollection -" + collectionName );
    }
    return new Promise(function (resolve, reject) {
        try {
            model.remove(function (error, response) {
                if (error) {
                    if (logLevel === "DEBUG")
                        logger.debug("requestId :: " + _requestId + "::error while truncating -" + error);
                        reject(mapError.errorCodeToDesc(_requestId, '3060',moduleName));
                } else {
                    if (logLevel === "DEBUG") {
                        logger.debug("requestId :: " + _requestId + ":: Truncated collection -" + collectionName);
                    }
                    resolve(response)
                }
            });
        } catch (err) {
            logger.error("requestId :: " + _requestId + "::truncateCollection exception-" + err);
            reject(mapError.errorCodeToDesc(_requestId, '500','moduleName'));        
        }
    });
}


mongoOperation.prototype.getOne = function(collectionName, model,payLoad, requestId,moduleName) {
    let logger = getLogger('mongoOperation');

    let _requestId = typeof requestId !== 'undefined' && requestId.length > 0 ? requestId : '';
    
    if (logLevel === "INFO") {
        logger.info("requestId :: " + _requestId + "::in getOne of mongoOperation");
    }
    if (logLevel === "DEBUG") {
        logger.debug("requestId :: " + _requestId + "::Query Data with collectionName :" +
            JSON.stringify(collectionName) + " and payload received is:" + JSON.stringify(payLoad));
    }
    return new Promise(function(resolve, reject) {
        try{
            model.find(payLoad, function(error, response) {    
                if (error) {
                    logger.error("requestId :: " + _requestId + "::error while calling mongodb query api is:---" + error +
                        " for payload is:----" + JSON.stringify(payLoad));
                    reject(mapError.errorCodeToDesc(_requestId, '3070',moduleName));

                } else {
                        logger.debug("requestId :: " + _requestId + "::response obtained from query returning");
                        resolve(response);
                } 
            });
        }catch (err) {
            logger.error("requestId :: " + _requestId + "::crud_operations getOne error message" + err);
            reject(mapError.errorCodeToDesc(_requestId, '500',moduleName));
        }
    });
}





module.exports = new mongoOperation();