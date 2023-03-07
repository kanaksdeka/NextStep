let logger = getLogger('sequencejs');
let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
const sequenceNumber = require(path.join(appRoot, 'api/models/UserSequence.js'));
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));

function Sequence() {}

/**
 * [idNumber Util to generate idNumber for registered profiles]
 * @return {[object]} [Returns idNumber]
 */
Sequence.prototype.sequenceNumber = function(requestId,collectionName) {
    if (logLevel === "INFO") {
        logger.info("begin sequenceNumber method of sequencejs");
    }
    if (logLevel === "DEBUG") {
        logger.debug("requestId :: " + requestId + ":: collection name in getSequenceNumber is:" + collectionName);
    }
    return new Promise(function(resolve, reject) {
        //db.collection(collectionName).findAndModify({
            sequenceNumber.findByIdAndUpdate(
            {
                _id: 'idNumber'
            },{
                '$inc': {
                    'sequence_value': 1
                }
            }, {
                new:true,upsert:true
            },
            function(error, data) {
                if (error) {
                    logger.error("requestId :: " + requestId + ":: error getting sequence" + error);
                    reject(mapError.errorCodeToDesc(requestId, '501','sequenceNumber'));
                } else {
                    if (logLevel === "DEBUG") {
                        logger.debug("requestId :: " + requestId + ":: Sequence Number generation output is:" + JSON.stringify(data));
                    }
                    let sequence = {};

                    if (data!= null) {
                        sequence.sequence_value = data.sequence_value;
                        if (logLevel === "DEBUG") {
                            logger.debug("requestId :: " + requestId + ":: Sequence Number value is:" + sequence.sequence_value);
                        }
                        resolve({'sequence_value': sequence.sequence_value});
                    } else {
                        resolve(mapError.errorCodeToDesc(requestId, '502','sequenceNumber'));
                       
                    }

                }

            });
        if (logLevel === "INFO") {
            logger.info("requestId :: " + requestId + ":: end of sequenceNumber method of sequencejs");
        }
    });


}


Sequence.prototype.Initialize = function() {}



module.exports = new Sequence();
