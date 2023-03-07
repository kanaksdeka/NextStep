let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
const async = require('async');
var _ = require("lodash");
var co = require('co');
const { resolve } = require('path');
const Grade = require(path.join(appRoot, 'api/models/Grade'));
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));


exports.creategrade = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('creategrade');


    var initiatedby = typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
    logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

    if (initiatedby != 1)
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))

    try {

        if (typeof req.body.grade === 'undefined' || req.body.grade.length < 0) {
            res.send(mapError.errorCodeToDesc(requestId, '422', "metadata"))
        } else {


            let _grade = new Grade();
            _grade.grade = req.body.grade.trim().toUpperCase()


            let queryPayload = { 'grade': req.body.grade.trim().toUpperCase() }

            Grade.find(queryPayload, (err, grade) => {
                if (grade.length > 0) {
                    logger.error("requestId :: " + requestId + ":: Grade found with provided input - " + req.body.grade.trim().toUpperCase());
                    res.send(mapError.errorCodeToDesc(requestId, '503', "metadata"))
                } else if (err) {
                    logger.error("requestId :: " + requestId + ":: Grade search encountered error  - " + JSON.stringify(err));
                    res.send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
                }
                else {
                    logger.debug("requestId :: " + requestId + ":: No duplicate Grade found Continuing ");
                    _grade.save(function (err, sub) {
                        if (err) {
                            logger.debug("requestId :: " + requestId + ":: error inserting Grade -" + err);
                            res.send(mapError.errorCodeToDesc(requestId, '501', "metadata"));
                        } else {
                            logger.debug("requestId :: " + requestId + ":: creategrade grade created -" + JSON.stringify(sub));
                            //delete sub['_id']
                            //res.send(sub)
                            res.send(mapError.errorCodeToDesc(requestId, '200', "metadata"))
                        }
                    })
                }
            })
        }

    } catch (err) {
        logger.error("requestId :: " + requestId + " :: creategrade Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};


exports.getgrades = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('getgrade');
    try {

        Grade.find({}, (err, grade) => {
            if (grade.length > 0) {
                logger.error("requestId :: " + requestId + ":: Grade found with provided input - " + JSON.stringify(grade));
                res.send(grade)
            } else if (err) {
                logger.error("requestId :: " + requestId + ":: Grade search encountered error  - " + JSON.stringify(err));
                res.send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
            } else {
                logger.error("requestId :: " + requestId + ":: Grade search No data found");
                res.send(mapError.errorCodeToDesc(requestId, '504', "metadata"))
            }
        })
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: creategrade Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};



exports.deletegrade = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('deletegrade');


    var initiatedby = typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
    logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

    if (initiatedby != 1)
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))

    try {

        if (typeof req.body.key === 'undefined' || req.body.key.length < 0) {
            res.send(mapError.errorCodeToDesc(requestId, '422', "metadata"))
        } else {
            let queryPayload = { '_id': req.body.key }
            Grade.deleteOne(queryPayload, (err, deletedrecord) => {
                if (err) {
                    logger.error("requestId :: " + requestId + ":: Grade search encountered error  - " + JSON.stringify(err));
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
        logger.error("requestId :: " + requestId + " :: deletegrade Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};

exports.updategrade = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('updategrade');


    var initiatedby = typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
    logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

    if (initiatedby ==2)
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))

    try {

        if (typeof req.body.grade === 'undefined' || req.body.grade.length < 0 || typeof req.body.key === 'undefined' || req.body.key.length < 0) {
            res.send(mapError.errorCodeToDesc(requestId, '422', "metadata"))
        } else {
            let queryPayload = { '_id': req.body.key }
            Grade.findOne(queryPayload, (err, gradeFetched) => {
                if (gradeFetched.length < 0) {
                    logger.error("requestId :: " + requestId + ":: No Grade found with provided input - " + req.body.grade.trim().toUpperCase());
                    res.send(mapError.errorCodeToDesc(requestId, '504', "metadata"))
                } else if (err) {
                    logger.error("requestId :: " + requestId + ":: Grade search encountered error  - " + JSON.stringify(err));
                    res.send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
                } else{
                    logger.debug("requestId :: " + requestId + ":: Updating the record ");
                    gradeFetched.grade = req.body.grade.trim().toUpperCase()
                    gradeFetched.save((err) => {
                        if (err) {
                            logger.debug("requestId :: " + requestId + ":: error updating Grade -" + err);
                            res.send(mapError.errorCodeToDesc(requestId, '501', "metadata"));
                        } else {
                            logger.debug("requestId :: " + requestId + ":: updategrade grade updated -" + JSON.stringify(gradeFetched));
                            //delete gradeFetched['_id']
                            //res.send(gradeFetched)
                            res.send(mapError.errorCodeToDesc(requestId, '200', "metadata"))
                        }
                    })
                }
            })
        }

    } catch (err) {
        logger.error("requestId :: " + requestId + " :: updategrade Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};