let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
const async = require('async');
var _ = require("lodash");
var co = require('co');
const { resolve } = require('path');
const Semester = require(path.join(appRoot, 'api/models/semester'));
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));
let moment = require('moment');


exports.createsemester = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('createsemester');


    var initiatedby = typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
    logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

    if (initiatedby != 1)
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))

    try {

        if (typeof req.body.semester === 'undefined' || req.body.semester.length < 0) {
            res.send(mapError.errorCodeToDesc(requestId, '422', "metadata"))
        } else {

            let startDate = moment(req.body.startDate + "T00:00:00", "MM/DD/YYYYT00:00:00").format("MM/DD/YYYYT00:00:00");
            let endDate = moment(req.body.endDate + "T00:00:00", "MM/DD/YYYYT00:00:00").format("MM/DD/YYYYT00:00:00");
            logger.debug("requestId :: " + requestId + ":: createsemester :: Start Date Converted is -" + startDate);
            logger.debug("requestId :: " + requestId + ":: createsemester:: End Date Converted is -" + endDate);

            logger.debug("requestId :: " + requestId + ":: createsemester:: System Date time is -" + moment().format("MM/DD/YYYYT00:00:00"));


            let startDate1 = moment(new Date(req.body.startDate), 'ddd MMM D YYYY HH:mm:ss ZZ') 
            let endDate1 = moment(new Date(req.body.endDate), 'ddd MMM D YYYY HH:mm:ss ZZ')

            logger.debug("requestId :: " + requestId + ":: createsemester :: Start Date  is -" + startDate1.toDate());
            logger.debug("requestId :: " + requestId + ":: createsemester :: End Date  is -" + endDate1.toDate());

            var difference = endDate1.diff(startDate1, 'days');

            logger.debug("requestId :: " + requestId + ":: createsemester:: Date difference is  -" + difference);


            if (startDate < moment().format("MM/DD/YYYYT00:00:00")) {
                logger.debug("requestId :: " + requestId + ":: createsemester:: Start Date Validation Error ")
                res.send(mapError.errorCodeToDesc(requestId, '402', "metadata"))
                return;
            } else if (difference < 0) {
                logger.debug("requestId :: " + requestId + ":: createsemester:: End Date Validation Error ")
                res.send(mapError.errorCodeToDesc(requestId, '403', "metadata"))
                return;
            }
            else {
                if (logLevel === "DEBUG")
                    logger.debug("requestId :: " + requestId + ":: createsemester :: Dates passed is valid ");
            }

            let _semester = new Semester();
            _semester.semester = req.body.semester.trim().toUpperCase();
            _semester.startdate = moment(new Date(req.body.startDate), 'ddd MMM D YYYY HH:mm:ss ZZ')
            _semester.enddate = moment(new Date(req.body.endDate), 'ddd MMM D YYYY HH:mm:ss ZZ')
            _semester.isactive = true;


            let queryPayload = { 'semester': req.body.semester.trim().toUpperCase() }

            Semester.find(queryPayload, (err, semester) => {
                if (semester.length > 0) {
                    logger.error("requestId :: " + requestId + ":: Semester found with provided input - " + req.body.semester.trim().toUpperCase());
                    res.send(mapError.errorCodeToDesc(requestId, '503', "metadata"))
                } else if (err) {
                    logger.error("requestId :: " + requestId + ":: Semester search encountered error  - " + JSON.stringify(err));
                    res.send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
                }
                else {
                    logger.debug("requestId :: " + requestId + ":: No duplicate Semester found Continuing ");
                    _semester.save(function (err, sub) {
                        if (err) {
                            logger.debug("requestId :: " + requestId + ":: error inserting Semester -" + err);
                            res.send(mapError.errorCodeToDesc(requestId, '501', "metadata"));
                        } else {
                            logger.debug("requestId :: " + requestId + ":: createsemester semester created -" + JSON.stringify(sub));
                            //delete sub['_id']
                            //res.send(sub)
                            res.send(mapError.errorCodeToDesc(requestId, '200', "metadata"))
                        }
                    })
                }
            })
        }

    } catch (err) {
        logger.error("requestId :: " + requestId + " :: createsemester Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};


exports.getsemester = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('getsemester');
    try {

        Semester.find({}, { _id: 1, semester: 1, startdate: 1, enddate: 1, isactive: 1 }, (err, semester) => {
            if (semester.length > 0) {
                logger.error("requestId :: " + requestId + ":: Semester found with provided input - " + JSON.stringify(semester));
                res.send(semester)
            } else if (err) {
                logger.error("requestId :: " + requestId + ":: Semester search encountered error  - " + JSON.stringify(err));
                res.send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
            } else {
                logger.error("requestId :: " + requestId + ":: Semester search No data found");
                res.send(mapError.errorCodeToDesc(requestId, '504', "metadata"))
            }
        })
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: createsemester Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};



exports.deletesemester = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('deletesemester');


    var initiatedby = typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
    logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

    if (initiatedby != 1)
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))

    try {

        if (typeof req.body.semesterid === 'undefined' || req.body.semesterid.length < 0) {
            res.send(mapError.errorCodeToDesc(requestId, '422', "metadata"))
        } else {
           // let queryPayload = { "_id": req.body.semesterid}
            Semester.findByIdAndDelete(req.body.semesterid, (err, deletedrecord) => {
                if (err) {
                    logger.error("requestId :: " + requestId + ":: Semester search encountered error  - " + JSON.stringify(err));
                    res.send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
                }else if(deletedrecord==null){
                    logger.debug("requestId :: " + requestId + ":: No mathching record found for deletion -" +req.body.semesterid);
                    res.send(mapError.errorCodeToDesc(requestId, '204', "metadata"))
                } else {
                    logger.debug("requestId :: " + requestId + ":: Deleted the record -" + JSON.stringify(deletedrecord));
                    res.send(mapError.errorCodeToDesc(requestId, '200', "metadata"))
                }
            })
        }

    } catch (err) {
        logger.error("requestId :: " + requestId + " :: deletesemester Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};

exports.updatesemester = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('updatesemester');


    var initiatedby = typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
    logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

    if (initiatedby != 1)
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))

    try {

        if (typeof req.body.semesterid === 'undefined' || req.body.semesterid.length < 0) {
            logger.error("requestId :: " + requestId + ":: Validation failed for semesterid ");
            res.send(mapError.errorCodeToDesc(requestId, '422', "metadata"))
        } else if (typeof req.body.semester === 'undefined' || req.body.semester.length < 0) {
            logger.error("requestId :: " + requestId + ":: Validation failed for semester ");
            res.send(mapError.errorCodeToDesc(requestId, '422', "metadata"))
        } else if (typeof req.body.startdate === 'undefined' || req.body.startdate.length < 0) {
            logger.error("requestId :: " + requestId + ":: Validation failed for startdate ");
            res.send(mapError.errorCodeToDesc(requestId, '422', "metadata"))
        } else if (typeof req.body.enddate === 'undefined' || req.body.enddate.length < 0) {
            logger.error("requestId :: " + requestId + ":: Validation failed for enddate ");
            res.send(mapError.errorCodeToDesc(requestId, '422', "metadata"))
        } else if (typeof req.body.isactive === 'undefined'){// || (req.body.isactive !== Boolean(true) || req.body.isactive !== Boolean(false))) {
            logger.error("requestId :: " + requestId + ":: Validation failed for isactive -"+req.body.isactive);
            res.send(mapError.errorCodeToDesc(requestId, '422', "metadata"))
        } else {
            logger.error("requestId :: " + requestId + ":: Input payload validaiton success");

            let queryPayload = { '_id': req.body.semesterid }
            Semester.findOne(queryPayload, (err, semesterFetched) => {
                if (semesterFetched==null || semesterFetched.length < 0) {
                    logger.error("requestId :: " + requestId + ":: No Semester found with provided input - " + req.body.semester.trim().toUpperCase());
                    res.send(mapError.errorCodeToDesc(requestId, '504', "metadata"))
                } else if (err) {
                    logger.error("requestId :: " + requestId + ":: Semester search encountered error  - " + JSON.stringify(err));
                    res.send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
                } else {
                    logger.debug("requestId :: " + requestId + ":: Updating the record ");



                    let startDate = moment(req.body.startdate + "T00:00:00", "MM/DD/YYYYT00:00:00").format("MM/DD/YYYYT00:00:00");
                    let endDate = moment(req.body.enddate + "T00:00:00", "MM/DD/YYYYT00:00:00").format("MM/DD/YYYYT00:00:00");
                    logger.debug("requestId :: " + requestId + ":: updatesemester:: Start Date Converted is -" + startDate);
                    logger.debug("requestId :: " + requestId + ":: updatesemester ::End Date Converted is -" + endDate);

                    logger.debug("requestId :: " + requestId + ":: updatesemester ::System Date time is -" + moment().format("DD/MM/YYYYT00:00:00"));


                    if (startDate < moment().format("MM/DD/YYYYT00:00:00")) {
                        logger.debug("requestId :: " + requestId + ":: updatesemester ::Start Date Validation Error ")
                        res.send(mapError.errorCodeToDesc(requestId, '402', "metadata"))
                    } else if (endDate < moment().format("MM/DD/YYYYT00:00:00")) {
                        logger.debug("requestId :: " + requestId+ ":: updatesemester ::End Date Validation Error ")
                        res.send(mapError.errorCodeToDesc(requestId, '403', "metadata"))
                    }
                    else {
                        if (logLevel === "DEBUG")
                            logger.debug("requestId :: " + requestId + ":: updatesemester:: Dates passed is valid ");
                    }

                    let _semester={}; 
                    _semester.semester = req.body.semester.trim().toUpperCase();
                    _semester.startdate = moment(new Date(req.body.startdate));
                    _semester.enddate = moment(new Date(req.body.enddate));
                    _semester.isactive = req.body.isactive

                    Semester.update(queryPayload,_semester,(err,updated) => {
                        if (err) {
                            logger.debug("requestId :: " + requestId + ":: error updating Semester -" + err);
                            res.send(mapError.errorCodeToDesc(requestId, '501', "metadata"));
                        } else {
                            logger.debug("requestId :: " + requestId + ":: updatesemester semester updated -",updated);
                            res.send(mapError.errorCodeToDesc(requestId, '200', "metadata"))
                        }
                    })
                }
            })
        }

    } catch (err) {
        logger.error("requestId :: " + requestId + " :: updatesemester Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};