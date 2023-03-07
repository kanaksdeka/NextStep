let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
const async = require('async');
var _ = require("lodash");
var co = require('co');
const { resolve } = require('path');
const Section = require(path.join(appRoot, 'api/models/Section'));
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));


exports.createsection = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('createsection');

    var initiatedby = req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
    logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

    if (initiatedby != 1)
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))

    try {

        if (typeof req.body.section === 'undefined' || req.body.section.length < 0) {
            res.send(mapError.errorCodeToDesc(requestId, '422', "metadata"))
        } else {


            let _section = new Section();
            _section.section = req.body.section.trim().toUpperCase()


            let queryPayload = { 'section': req.body.section.trim().toUpperCase() }

            Section.find(queryPayload, (err, section) => {
                if (section.length > 0) {
                    logger.error("requestId :: " + requestId + ":: Section found with provided input - " + req.body.section.trim().toUpperCase());
                    res.send(mapError.errorCodeToDesc(requestId, '503', "metadata"))
                } else if (err) {
                    logger.error("requestId :: " + requestId + ":: Section search encountered error  - " + JSON.stringify(err));
                    res.send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
                }
                else {
                    logger.debug("requestId :: " + requestId + ":: No duplicate Section found Continuing ");
                    _section.save(function (err, sub) {
                        if (err) {
                            logger.debug("requestId :: " + requestId + ":: error inserting Section -" + err);
                            res.send(mapError.errorCodeToDesc(requestId, '501', "metadata"));
                        } else {
                            logger.debug("requestId :: " + requestId + ":: createsection section created -" + JSON.stringify(sub));
                            //delete sub['_id']
                            //res.send(sub)
                            res.send(mapError.errorCodeToDesc(requestId, '200', "metadata"))
                        }
                    })
                }
            })
        }

    } catch (err) {
        logger.error("requestId :: " + requestId + " :: createsection Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};


exports.getsections = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('getsection');
    try {

        Section.find({}, { section: 1 }, (err, section) => {
            if (section.length > 0) {
                logger.error("requestId :: " + requestId + ":: Section found with provided input - " + JSON.stringify(section));
                res.send(section)
            } else if (err) {
                logger.error("requestId :: " + requestId + ":: Section search encountered error  - " + JSON.stringify(err));
                res.send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
            } else {
                logger.error("requestId :: " + requestId + ":: Section search No data found");
                res.send(mapError.errorCodeToDesc(requestId, '504', "metadata"))
            }
        })
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: createsection Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};



exports.deletesection = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('deletesection');

    var initiatedby = req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
    logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

    if (initiatedby != 1)
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))

    try {

        if (typeof req.body.key === 'undefined' || req.body.key.length < 0) {
            res.send(mapError.errorCodeToDesc(requestId, '422', "metadata"))
        } else {
            let queryPayload = { '_id': req.body.key }
            Section.deleteOne(queryPayload, (err, deletedrecord) => {
                if (err) {
                    logger.error("requestId :: " + requestId + ":: Section search encountered error  - " + JSON.stringify(err));
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
        logger.error("requestId :: " + requestId + " :: deletesection Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};

exports.updatesection = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('updatesection');

    var initiatedby = req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
    logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

    if (initiatedby != 1)
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))

    try {

        if (typeof req.body.section === 'undefined' || req.body.section.length < 0 || typeof req.body.key === 'undefined' || req.body.key.length < 0) {
            res.send(mapError.errorCodeToDesc(requestId, '422', "metadata"))
        } else {
            let queryPayload = { '_id': req.body.key }
            Section.findOne(queryPayload, (err, sectionFetched) => {
                if (sectionFetched.length < 0) {
                    logger.error("requestId :: " + requestId + ":: No Section found with provided input - " + req.body.section.trim().toUpperCase());
                    res.send(mapError.errorCodeToDesc(requestId, '504', "metadata"))
                } else if (err) {
                    logger.error("requestId :: " + requestId + ":: Section search encountered error  - " + JSON.stringify(err));
                    res.send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
                } else{
                    logger.debug("requestId :: " + requestId + ":: Updating the record ");
                    sectionFetched.section = req.body.section.trim().toUpperCase()
                    sectionFetched.save((err) => {
                        if (err) {
                            logger.debug("requestId :: " + requestId + ":: error updating Section -" + err);
                            res.send(mapError.errorCodeToDesc(requestId, '501', "metadata"));
                        } else {
                            logger.debug("requestId :: " + requestId + ":: updatesection section updated -" + JSON.stringify(sectionFetched));
                            //delete sectionFetched['_id']
                            //res.send(sectionFetched)
                            res.send(mapError.errorCodeToDesc(requestId, '200', "metadata"))
                        }
                    })
                }
            })
        }

    } catch (err) {
        logger.error("requestId :: " + requestId + " :: updatesection Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};