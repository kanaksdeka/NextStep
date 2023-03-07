var path = require('path');
var appRoot = path.join(require('app-root-dir').get(), '/server/');
const sequenceNumber = require(path.join(appRoot, '/api/models/UserSequence.js'));

var logger = getLogger('sequencejs');

function Sequence() {}

/**
 * [serviceRequestNumber Util to generate sequence number]
 * @return {[object]} [Returns sequence number]
 */
Sequence.prototype.sequenceNumber = function(collectionName) {
    if (logLevel === "INFO") {
        logger.info("begin sequenceNumber method of sequencejs");
    }
    if (logLevel === "DEBUG") {
        logger.debug("collection name in getSequenceNumber is:" + collectionName);
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
                    logger.error("error getting sequence  -" + error);
                    reject(error);
                } else {
                    if (logLevel === "DEBUG") {
                        logger.debug("Sequence Number generation ouput is:" + JSON.stringify(data));
                    }
                    var sequence = {};

                    if (data!= null) {
                        sequence.sequence_value = data.sequence_value;
                        if (logLevel === "DEBUG") {
                            logger.debug("Sequence Number value is:" + sequence.sequence_value);
                        }
                        resolve({
                                'sequence_value': sequence.sequence_value
                        });
                    } else {
                        resolve(mapError.errorCodeToDesc(requestId, '501', 'registerUser'));
                    }

                }

            });
        if (logLevel === "INFO") {
            logger.info("end of sequenceNumber method of sequencejs");
        }
    });


}
Sequence.prototype.Initialize = function() {}



module.exports = new Sequence();
