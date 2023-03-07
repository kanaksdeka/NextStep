let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
const async = require('async');
var _ = require("lodash");
var co = require('co');
const { resolve } = require('path');
const Subject = require(path.join(appRoot, 'api/models/Subject'));
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));


exports.createsubject = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('createsubject');
    try {

        if (typeof req.body.subject === 'undefined' || req.body.subject.length < 0) {
            res.send(mapError.errorCodeToDesc(requestId, '401', "metadata"))
        } else {


            let _subject = new Subject();
            _subject.subject = req.body.subject.trim().toUpperCase()


            let queryPayload = { 'subject': req.body.subject.trim().toUpperCase() }

            Subject.find(queryPayload, (err, subject) => {
                if (subject.length > 0) {
                    logger.error("requestId :: " + requestId + ":: Subject found with provided input - " + req.body.subject.trim().toUpperCase());
                    res.send(mapError.errorCodeToDesc(requestId, '503', "metadata"))
                } else if (err) {
                    logger.error("requestId :: " + requestId + ":: Subject search encountered error  - " + JSON.stringify(err));
                    res.send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
                }
                else {
                    logger.debug("requestId :: " + requestId + ":: No duplicate Subject found Continuing ");
                    _subject.save(function (err, sub) {
                        if (err) {
                            logger.debug("requestId :: " + requestId + ":: error inserting Subject -" + err);
                            res.send(mapError.errorCodeToDesc(requestId, '501', "metadata"));
                        } else {
                            logger.debug("requestId :: " + requestId + ":: createsubject subject created -" + JSON.stringify(sub));
                            //delete sub['_id']
                            //res.send(sub)
                            res.send(mapError.errorCodeToDesc(requestId, '200', "metadata"))
                        }
                    })
                }
            })
        }

    } catch (err) {
        logger.error("requestId :: " + requestId + " :: createsubject Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};


exports.getsubjects = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('getsubject');
    try {

        Subject.find({}, (err, subject) => {
            if (subject.length > 0) {
                logger.error("requestId :: " + requestId + ":: Subject found with provided input - " + JSON.stringify(subject));
                res.send(subject)
            } else if (err) {
                logger.error("requestId :: " + requestId + ":: Subject search encountered error  - " + JSON.stringify(err));
                res.send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
            } else {
                logger.error("requestId :: " + requestId + ":: Subject search No data found");
                res.send(mapError.errorCodeToDesc(requestId, '504', "metadata"))
            }
        })
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: createsubject Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};



exports.deletesubject = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('deletesubject');
    try {

        if (typeof req.body.key === 'undefined' || req.body.key.length < 0) {
            res.send(mapError.errorCodeToDesc(requestId, '401', "metadata"))
        } else {
            let queryPayload = { '_id': req.body.key }
            Subject.findByIdAndDelete(queryPayload, (err, deletedrecord) => {
                if (err) {
                    logger.error("requestId :: " + requestId + ":: Subject search encountered error  - " + JSON.stringify(err));
                    res.send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
                } else{
                    if(deletedrecord.deletedCount===1){
                       logger.debug("requestId :: " + requestId + ":: Deleted the record -"+JSON.stringify(deletedrecord));
                       res.send(mapError.errorCodeToDesc(requestId, '200', "metadata"))
                    }else{
                        logger.debug("requestId :: " + requestId + ":: Deleted the record unable to find a match-"+JSON.stringify(deletedrecord));
                        res.send(mapError.errorCodeToDesc(requestId, '504', "metadata"))

                    }
                }
            })
        }

    } catch (err) {
        logger.error("requestId :: " + requestId + " :: deletesubject Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};

exports.updatesubject = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('updatesubject');
    try {

        if (typeof req.body.subject === 'undefined' || req.body.subject.length < 0 || typeof req.body.key === 'undefined' || req.body.key.length < 0) {
            res.send(mapError.errorCodeToDesc(requestId, '401', "metadata"))
        } else {
            let queryPayload = { '_id': req.body.key }
            Subject.findOne(queryPayload, (err, subjectFetched) => {
                if (subjectFetched.length < 0) {
                    logger.error("requestId :: " + requestId + ":: No Subject found with provided input - " + req.body.subject.trim().toUpperCase());
                    res.send(mapError.errorCodeToDesc(requestId, '504', "metadata"))
                } else if (err) {
                    logger.error("requestId :: " + requestId + ":: Subject search encountered error  - " + JSON.stringify(err));
                    res.send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
                } else{
                    logger.debug("requestId :: " + requestId + ":: Updating the record ");
                    subjectFetched.subject = req.body.subject.trim().toUpperCase()
                    subjectFetched.save((err) => {
                        if (err) {
                            logger.debug("requestId :: " + requestId + ":: error updating Subject -" + err);
                            res.send(mapError.errorCodeToDesc(requestId, '501', "metadata"));
                        } else {
                            logger.debug("requestId :: " + requestId + ":: updatesubject subject updated -" + JSON.stringify(subjectFetched));
                            //delete subjectFetched['_id']
                            //res.send(subjectFetched)
                            res.send(mapError.errorCodeToDesc(requestId, '200', "metadata"))
                        }
                    })
                }
            })
        }

    } catch (err) {
        logger.error("requestId :: " + requestId + " :: updatesubject Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};