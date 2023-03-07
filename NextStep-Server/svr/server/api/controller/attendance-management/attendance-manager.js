let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
const Attendance = require(path.join(appRoot, 'api/models/attendance'));
let mapError = require(path.join(appRoot, '/utils/codeToErrorMapping.js'));


exports.setAttendance = function (req, res) {
    let requestId = req.id;
    const logger = getLogger('insertAttendance');

    let error = false;
    logger.debug("requestId :: " + requestId + ":: InsertAttendance payload - " + JSON.stringify(req.body));

    if (typeof req.body.class == 'undefined' || req.body.class.length < 0) {
        logger.debug("requestId :: " + requestId + ":: Input validation error for class")
        error = true;
    }
    else if (typeof req.body.subject == 'undefined' || req.body.subject.length < 0) {
        logger.debug("requestId :: " + requestId + ":: Input validation error for subject")
        error = true;
    }
    else if (typeof req.body.section == 'undefined' || req.body.section.length < 0) {
        logger.debug("requestId :: " + requestId + ":: Input validation error for section")
        error = true;
    }
    else if (typeof req.body.semester == 'undefined' || req.body.semester.length < 0) {
        logger.debug("requestId :: " + requestId + ":: Input validation error for semester")
        error = true;
    }
    else if (typeof req.body.period == 'undefined' || req.body.period.length < 0) {
        logger.debug("requestId :: " + requestId + ":: Input validation error for period")
        error = true;
    }
    else if (typeof req.body.user == 'undefined' || req.body.user.length < 0) {
        logger.debug("requestId :: " + requestId + ":: Input validation error for user")
        error = true;
    }
    else if (req.body.isPresent.trim().toLowerCase() !== 'n' && req.body.isPresent.trim().toLowerCase() !== 'y') {
        error = true;
    }else{
        logger.debug("requestId :: " + requestId + ":: All validation fine");
    }
    try {
        if (error == true) {
            logger.debug("requestId :: " + requestId + ":: Input validation error insertAttendance() - " + JSON.stringify(req.body));
            res.status(412).send(mapError.errorCodeToDesc(requestId, '412', "attendance"));
        } else {
            logger.debug("requestId :: " + requestId + ":: Processing request Insert Attendance");
            let _attendance = new Attendance();
            _attendance.className = req.body.class.trim();
            _attendance.subject = req.body.subject.trim();
            _attendance.section = req.body.section.trim();
            _attendance.semester = req.body.semester.trim();
            _attendance.period = req.body.period.trim();
            _attendance.user = req.body.user.trim();
            let d = new Date();
            _attendance.day = d.getDate() + "-" + d.getMonth() + "-" + d.getFullYear();
            _attendance.isPresent = req.body.isPresent.trim().toLowerCase() == 'y' ? true : false;
           // _attendance.timestamp = new Date();

            logger.debug("requestId :: " + requestId + ":: Payload for creation  - ",_attendance);


            _attendance.save((err,data) => {
                if (err) {
                    logger.error("requestId :: " + requestId + " :: insertAttendance Controller Error in saving attendance information-" + err);
                    res.send(mapError.errorCodeToDesc(requestId, '501', "attendance"));
                } else {
                    logger.debug("requestId :: " + requestId + " :: insertAttendance Controller attendance saved-",data);
                    res.send(mapError.errorCodeToDesc(requestId, '200', "attendance"))
                }
            });
        }
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: Exception in insertAttendance(): ", err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "attendance"))
    }
}

exports.getAttendance = function (req, res) {
    let requestId = req.id;
    let error = false;

    const logger = getLogger('getAttendance');

    if (req.body.initiatedby == 2)
        return res.status(403).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))

        logger.debug("requestId :: " + requestId + ":: getAttendance payload - " + JSON.stringify(req.body));

        if (typeof req.body.class == 'undefined' || req.body.class.length < 0) {
            logger.debug("requestId :: " + requestId + ":: Input validation error for class")
            error = true;
        }
        else if (typeof req.body.subject == 'undefined' || req.body.subject.length < 0) {
            logger.debug("requestId :: " + requestId + ":: Input validation error for subject")
            error = true;
        }
        else if (typeof req.body.section == 'undefined' || req.body.section.length < 0) {
            logger.debug("requestId :: " + requestId + ":: Input validation error for section")
            error = true;
        }
        else if (typeof req.body.semester == 'undefined' || req.body.semester.length < 0) {
            logger.debug("requestId :: " + requestId + ":: Input validation error for semester")
            error = true;
        }
        else if (typeof req.body.period == 'undefined' || req.body.period.length < 0) {
            logger.debug("requestId :: " + requestId + ":: Input validation error for period")
            error = true;
        }else{
            logger.debug("requestId :: " + requestId + ":: All validation fine");
        }

    if (error == true) {
        logger.error("requestId :: " + requestId + ":: Input validation error insertAttendance() - " + JSON.stringify(req.body));
        res.status(412).send(mapError.errorCodeToDesc(requestId, '412', "attendance"));
        return;
    }

    let queryPayload = {
        "className": req.body.class.trim(),
        "subject": req.body.subject.trim(),
        "semester": req.body.semester.trim(),
        "section": req.body.section.trim(),
        "period": req.body.period.trim()
    }

    try {
        Attendance.find(queryPayload, { '_id': 0,'user':1, 'className': 1, 'subject': 1, 'section': 1, 'semester': 1, 'period': 1, 'isPresent': 1, 'day': 1 }, (err, data) => {
            if (data.length > 0) {
                logger.debug("requestId :: " + requestId + ":: Attendance found with provided input");
                res.send(data);
            } else if (err) {
                logger.error("requestId :: " + requestId + ":: Attendance search encountered error: ", err);
                res.send(mapError.errorCodeToDesc(requestId, '501', "attendance"))
            } else {
                res.status(200).send([])
            }
        });

    } catch (err) {
        logger.error("requestId :: " + requestId + " :: Exception in getAttendance(): ", err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "attendance"))
    }
}

exports.getStudentAttendance = function (req, res) {
    let requestId = req.id;
    let error = false;

    const logger = getLogger('getStudentAttendance');

    if (req.body.initiatedby == 2)
        return res.status(403).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))

        logger.debug("requestId :: " + requestId + ":: InsertAttendance payload - " + JSON.stringify(req.body));

        if (typeof req.body.class == 'undefined' || req.body.class.length < 0) {
            logger.debug("requestId :: " + requestId + ":: Input validation error for class")
            error = true;
        }
        else if (typeof req.body.subject == 'undefined' || req.body.subject.length < 0) {
            logger.debug("requestId :: " + requestId + ":: Input validation error for subject")
            error = true;
        }
        else if (typeof req.body.section == 'undefined' || req.body.section.length < 0) {
            logger.debug("requestId :: " + requestId + ":: Input validation error for section")
            error = true;
        }
        else if (typeof req.body.semester == 'undefined' || req.body.semester.length < 0) {
            logger.debug("requestId :: " + requestId + ":: Input validation error for semester")
            error = true;
        }
        else if (typeof req.body.period == 'undefined' || req.body.period.length < 0) {
            logger.debug("requestId :: " + requestId + ":: Input validation error for period")
            error = true;
        }else if (typeof req.body.user == 'undefined' || req.body.user.length < 0) {
            logger.debug("requestId :: " + requestId + ":: Input validation error for user")
            error = true;
        }else{
            logger.debug("requestId :: " + requestId + ":: All validation fine");
        }

    if (error == true) {
        logger.error("requestId :: " + requestId + ":: Input validation error insertAttendance() - " + JSON.stringify(req.body));
        res.status(412).send(mapError.errorCodeToDesc(requestId, '412', "attendance"));
    }

    let queryPayload = {
        "className": req.body.class.trim(),
        "subject": req.body.subject.trim(),
        "semester": req.body.semester.trim(),
        "section": req.body.section.trim(),
        "period": req.body.period.trim(),
        "user": req.body.user.trim()
    }

    try {
        Attendance.find(queryPayload, { '_id': 0, 'className': 1, 'subject': 1, 'section': 1, 'semester': 1, 'period': 1, 'isPresent': 1, 'day': 1 }, (err, data) => {
            if (data.length > 0) {
                logger.debug("requestId :: " + requestId + ":: Attendance found with provided input");
                res.send(data);
            } else if (err) {
                logger.error("requestId :: " + requestId + ":: Attendance search encountered error: ", err);
                res.send(mapError.errorCodeToDesc(requestId, '501', "attendance"))
            }
        });

    } catch (err) {
        logger.error("requestId :: " + requestId + " :: Exception in getAttendance(): ", err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "attendance"))
    }
}

exports.getDayAttendance = function (req, res) {
    let requestId = req.id;
    let error = false;

    const logger = getLogger('getDayAttendance');

    if (req.body.initiatedby == 2)
        return res.status(403).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))

        logger.debug("requestId :: " + requestId + ":: InsertAttendance payload - " + JSON.stringify(req.body));

        if (typeof req.body.class == 'undefined' || req.body.class.length < 0) {
            logger.debug("requestId :: " + requestId + ":: Input validation error for class")
            error = true;
        }
        else if (typeof req.body.subject == 'undefined' || req.body.subject.length < 0) {
            logger.debug("requestId :: " + requestId + ":: Input validation error for subject")
            error = true;
        }
        else if (typeof req.body.section == 'undefined' || req.body.section.length < 0) {
            logger.debug("requestId :: " + requestId + ":: Input validation error for section")
            error = true;
        }
        else if (typeof req.body.semester == 'undefined' || req.body.semester.length < 0) {
            logger.debug("requestId :: " + requestId + ":: Input validation error for semester")
            error = true;
        }
        else if (typeof req.body.period == 'undefined' || req.body.period.length < 0) {
            logger.debug("requestId :: " + requestId + ":: Input validation error for period")
            error = true;
        }else if (typeof req.body.day == 'undefined' || req.body.day.length < 0) {
            logger.debug("requestId :: " + requestId + ":: Input validation error for day")
            error = true;
        }else{
            logger.debug("requestId :: " + requestId + ":: All validation fine");
        }

    if (error == true) {
        logger.error("requestId :: " + requestId + ":: Input validation error insertAttendance() - " + JSON.stringify(req.body));
        res.status(412).send(mapError.errorCodeToDesc(requestId, '412', "attendance"));
    }

    let queryPayload = {
        "className": req.body.class.trim(),
        "subject": req.body.subject.trim(),
        "semester": req.body.semester.trim(),
        "section": req.body.section.trim(),
        "period": req.body.period.trim(),
        "day": req.body.day.trim()
    }

    try {
        Attendance.find(queryPayload, { '_id': 0, 'subject': 1, 'className': 1, 'section': 1, 'semester': 1, 'period': 1, 'user': 1, 'isPresent': 1, 'createdAt': 1 }, (err, data) => {
            if (data.length > 0) {
                logger.debug("requestId :: " + requestId + ":: Attendance found with provided input");
                res.send(data);
            } else if (err) {
                logger.error("requestId :: " + requestId + ":: Attendance search encountered error: ", err);
                res.send(mapError.errorCodeToDesc(requestId, '501', "attendance"))
            }
        });

    } catch (err) {
        logger.error("requestId :: " + requestId + " :: Exception in getAttendance(): ", err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "attendance"))
    }
}