let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
const async = require('async');
var mongoose = require('mongoose');

var _ = require("lodash");
var co = require('co');
const { resolve } = require('path');
const User = require(path.join(appRoot, 'api/models/User'));
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));
let moment = require('moment')


exports.getscores = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('getscores');

    if (logLevel === "DEBUG") {
        logger.debug("getscores controller Start");
    }

    var initiatedby = typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
    logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

    if (initiatedby == 2) {
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))
    } else {
        try {
            let query = { "_id": req.body.studentid }

            User.find({ _id: req.body.studentid },
                (err, scores) => {
                    if (typeof scores != 'undefined' && scores.length > 0) {
                        let scoresarr = [];
                        logger.error("requestId :: " + requestId + ":: User found with provided input - " + JSON.stringify(scores));
                        scores[0].grade.forEach(element => {
                            logger.error("requestId :: " + requestId + ":: Element is  - ", element);
                            if (element.semester == req.body.semester) {
                                scoresarr.push({
                                    "scoreid": element.scoreref,
                                    "subject": element.subject,
                                    "assignmentid_t": element.teachersassignmentid,
                                    "assignmentname_t": element.teacherassignmentname,
                                    "assignmentPath_t": element.teacherassignmentPath,
                                    "assignmentid_s": element.studentsuploadassignmentid,
                                    "assignmentname_s": element.studentassignmentname,
                                    "assignmentPath_s": element.studentassignmentpath,
                                    "score": element.marks
                                })
                            }
                        });
                        if (scoresarr.length > 0)
                            res.send(scoresarr)
                        else
                            res.send(mapError.errorCodeToDesc(requestId, '502', "getscores"))
                    } else if (err) {
                        logger.error("requestId :: " + requestId + ":: User search encountered error  - " + JSON.stringify(err));
                        res.send(mapError.errorCodeToDesc(requestId, '502', "getscores"))
                    } else {
                        logger.error("requestId :: " + requestId + ":: User search No data found");
                        res.send(mapError.errorCodeToDesc(requestId, '504', "getscores"))
                    }
                })
        } catch (err) {
            logger.error("requestId :: " + requestId + " :: getscores Exception -" + err);
            res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "getscores"))
        }
    }
};



exports.fetchavggrade = function (req, res) {
    let requestId = req.id;
    let studentid = req.body.studentid;
    const logger = getLogger('fetchavggrade');

    if (logLevel === "DEBUG") {
        logger.debug("fetchavggrade controller Start");
    }

    var initiatedby = typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
    logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

    if (initiatedby < 0) { //this API is open to all
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))
    } else {
        async.waterfall([
            function fetchstudentdetails(done) {
                User.find({ _id: req.body.studentid },
                    (err, user) => {
                        if (err) {
                            logger.error("requestId :: " + requestId + ":: fetchavggrade::fetchstudentdetails encountered error  - ", err);
                            res.send(mapError.errorCodeToDesc(requestId, '502', "getscores"))
                        } else {
                            logger.debug("requestId :: " + requestId + ":: fetchavggrade::fetchstudentdetails semester -", user[0].profile.class[0].semester);
                            done(null, user[0].profile.class[0].semester)
                        }
                    })
            },
            function aggregatemarks(semester, done) {
                try {
                    logger.debug("requestId :: " + requestId + ":: fetchavggrade StudentId - ", studentid);
                    User.aggregate([
                        {
                            "$match": { "_id": mongoose.Types.ObjectId(studentid) }
                        },
                        //{ "$project": { "_id": 1.0, "gradingmarks": 1.0 } },
                        {
                            "$project": { //matches the semester in the  array elements and filters them out
                                "_id": 1.0,
                                "gradingmarks": {
                                    "$filter": {
                                        "input": "$gradingmarks",
                                        "as": "grade",
                                        "cond": {
                                            "$eq": [
                                                "$$grade.semester",
                                                semester
                                            ]
                                        }
                                    }
                                }
                            }
                        },

                        {
                            "$unwind": {
                                "path": "$gradingmarks"
                            }
                        },
                        {
                            "$group": {
                                "_id": "$gradingmarks.subject",
                                "marks": { "$avg": { "$toInt": "$gradingmarks.bestoutof" } }
                            }
                        }
                    ], function (err, result) {
                        if (err) {
                            logger.error("requestId :: " + requestId + " :: fetchavggrade Exception -" + err);
                            res.send(mapError.errorCodeToDesc(requestId, '504', "getscores"))
                        } else {
                            logger.debug("requestId :: " + requestId + ":: fetchavggrade Result -", result.length)
                            let avgarr = [];
                            result.forEach(element => {
                                logger.debug("requestId :: " + requestId + ":: fetchavggrade Subject is  -", mapper.subjectmap.get(element._id))
                                avgarr.push({
                                    subject: mapper.subjectmap.get(element._id),//element._id,
                                    marks: element.marks.toFixed(2) //Math.round(element.marks)//.toFixed(2)
                                })
                            })

                            res.send(avgarr);
                        }
                    });
                } catch (err) {
                    logger.error("requestId :: " + requestId + " :: fetchavggrade Exception -" + err);
                    res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "getscores"))
                }
            },
        ], (err) => {
            if (err) {
                logger.error("requestId :: " + requestId + ":: submitfinalgrade encountered error  - ", err);
                res.send(mapError.errorCodeToDesc(requestId, '501', "getscores"))
            }
        });
    }
};

exports.submitfinalgrade = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('submitfinalgrade');

    if (logLevel === "DEBUG") {
        logger.debug("submitfinalgrade controller Start");
    }

    var initiatedby = typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
    logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

    if (initiatedby == 2) {
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))
    } else {
        try {
            let query = { "_id": req.body.studentid };
            let scoresarr = [];
            let scoreidarr = [];
            req.body.finalgrade.forEach(element => {
                logger.error("requestId :: " + requestId + ":: Element is  - ", element);
                scoresarr.push({
                    "scoreref": element.scoreref,
                    "subject": element.subject,
                    "semester": element.semester,
                    /*"assignmentid_t": element.teachersassignmentid,
                    "assignmentname_t": element.teacherassignmentname,
                    "assignmentPath_t": element.teacherassignmentPath,
                    "assignmentid_s": element.studentsuploadassignmentid,
                    "assignmentname_s": element.studentassignmentname,
                    "assignmentPath_s": element.studentassignmentpath,                            
                    "finalizeddate":new Date(),*/
                    "gradetype": typeof element.gradetype != 'undefined' ? element.gradetype : "",
                    "gradeweight": typeof element.gradeweight != 'undefined' ? element.gradeweight : "",
                    "gradename": typeof element.gradename != 'undefined' ? element.gradename : "",
                    "compulsary": typeof element.compulsary != 'undefined' ? element.compulsary : true,
                    "compulsarypassmark": typeof element.compulsarypassmark != 'undefined' ? element.compulsarypassmark : "70",
                    "assessmentdate": typeof element.assessmentdate != 'undefined' ? moment(new Date(element.assessmentdate), 'ddd MMM D YYYY HH:mm:ss ZZ').toDate() : new Date(),
                    "outof": typeof element.outof != 'undefined' ? element.outof : "100",
                    "bestoutof": typeof element.bestoutof != 'undefined' ? element.bestoutof : "100",
                    "partofmidtermgrade": typeof element.partofmidtermgrade != 'undefined' ? element.partofmidtermgrade : true
                });
                scoreidarr.push(element.scoreref); // this array will be used for pulling out bulk elements
            });

            logger.debug("requestId :: " + requestId + ":: Marks finalized for final grading  -", scoresarr)
            logger.debug("requestId :: " + requestId + ":: Score id Array  -", scoreidarr)

            async.waterfall([
                function delexisting(done) {
                    User.update(query, { $pull: { gradingmarks: { scoreref: { $in: scoreidarr } } } }, (err, update) => {
                        if (err) {
                            logger.error("requestId :: " + requestId + ":: submitfinalgrade::delexisting encountered error  - ", err);
                            res.send(mapError.errorCodeToDesc(requestId, '501', "submitfinalgrade"))
                        } else {
                            logger.error("requestId :: " + requestId + ":: submitfinalgrade::delexisting success -", update);
                            //res.send(mapError.errorCodeToDesc(requestId, '200', "submitfinalgrade"))
                            done(null, true)
                        }
                    })
                },
                function insertupdated(statusflag, done) {
                    logger.error("requestId :: " + requestId + ":: submitfinalgrade::insertupdated statusflag -", statusflag);
                    User.updateOne(
                        query,
                        { $push: { gradingmarks: scoresarr } },
                        function (err, result) {
                            if (err) {
                                logger.error("requestId :: " + requestId + ":: submitfinalgrade::delexisting encountered error  - ", err);
                                res.send(mapError.errorCodeToDesc(requestId, '501', "submitfinalgrade"))
                            } else {
                                logger.error("requestId :: " + requestId + ":: submitfinalgrade::delexisting success -", result);
                                res.send(mapError.errorCodeToDesc(requestId, '200', "submitfinalgrade"))
                            }
                        }
                    );
                },
            ], (err) => {
                if (err) {
                    logger.error("requestId :: " + requestId + ":: submitfinalgrade encountered error  - ", err);
                    res.send(mapError.errorCodeToDesc(requestId, '501', "submitfinalgrade"))
                }
            });



            /* var bulk = User.collection.initializeOrderedBulkOp();
             bulk.find(query).update({$pull: {gradingmarks:{scoreref:{$in: scoreidarr}}}}); //first try to pull out existing 
             bulk.find(query);
             //bulk.find(query).upsert(true).updateOne( { $set: { gradingmarks: scoresarr} } ); //Update the grade arry now
            // bulk.find(query).updateOne( { $set: { gradingmarks: scoresarr} } ); //Update the grade arry now
 
             bulk.execute((err, update) => {
                 if (err) {
                     logger.error("requestId :: " + requestId + ":: submitfinalgrade encountered error  - " ,err);
                     res.send(mapError.errorCodeToDesc(requestId, '501', "submitfinalgrade"))
                 } else {
                     logger.error("requestId :: " + requestId + ":: submitfinalgrade success -",update);
                     res.send(mapError.errorCodeToDesc(requestId, '200', "submitfinalgrade"))
                 }
             })*/
        } catch (err) {
            logger.error("requestId :: " + requestId + " :: submitfinalgrade Exception -" + err);
            res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "submitfinalgrade"))
        }

    }
};