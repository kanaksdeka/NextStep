let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let sendnotificationDef = require(path.join(appRoot, '/api/services/notification-service/sendNotification-service.js'));
let updatespecificnotificationDef = require(path.join(appRoot, '/api/services/notification-service/updateNotification-service.js'));


let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));

let co = require('co');

exports.sendnotification = function (req, res) {
    let logger = getLogger('sendnotification');
    let param = {};
    let requestId = req.id;

    co(function* () {
        if (logLevel === "DEBUG") {
            logger.debug("sendnotification controller Start");
        }


        let initiatedby_temp = typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
        logger.debug("requestId :: " + requestId + ":: Initiated by  -" + req.body.initiatedby)

        if (initiatedby_temp == 0) {
            return res.status(400).send(mapError.errorCodeToDesc(requestId, '401', "sendnotification"))
        } else {
            param.token = req.headers.authorization;
            param.notifyPayload = req.body.notification;
            param.class = typeof req.body.class.grade != 'undefined' ? req.body.class.grade : "";
            param.section = typeof req.body.class.section != 'undefined' ? req.body.class.section : "";
            param.semester = typeof req.body.class.semester != 'undefined' ? req.body.class.semester : "";
            param.subject = typeof req.body.class.subject != 'undefined' ? req.body.class.subject : "";

            param.toteacherid = typeof req.body.toteacherid != 'undefined' ? req.body.toteacherid : "";
            param.tostudentid = typeof req.body.tostudentid != 'undefined' ? req.body.tostudentid : "";
            param.initiatedby = typeof req.body.notificationby != 'undefined' ? req.body.notificationby : "";

            param.notificationtype = typeof req.body.notificationtype != 'undefined' ? req.body.notificationtype : ""; // this is to be sent when a Admin/Teacher sends a Notification

            if (initiatedby_temp == 1)
                param.initiatortype = 'A'
            else if (initiatedby_temp == 2)
                param.initiatortype = 'S'
            else
                param.initiatortype = 'T'

            // param.initiatortype=req.body.initiatortype != 'undefined' ?req.body.initiatortype:"T";
            param.requestId = req.id;
            if (logLevel === "DEBUG")
                logger.debug("requestId :: " + param.requestId + ":: sendnotification:: Parameters Received -" + JSON.stringify(param));

            let sendnotificationObj = new sendnotificationDef(param);
            if (param.initiatortype == "T") { // Notification by Teacher
                let sendnotificationrestostudents = {}
                logger.debug("requestId :: " + param.requestId + ":: sendnotification Controller :: sendnotificationrestostudents by Teacher");

                switch (param.notificationtype.toLowerCase()) {
                    case "to_class":
                        logger.debug("requestId :: " + param.requestId + ":: sendnotification Controller :: Notification by Teacher to complete class ");
                        sendnotificationrestostudents = yield sendnotificationObj.sendall(); // Send Notification to specific class
                        break;
                    case "to_individual_student":
                        logger.debug("requestId :: " + param.requestId + ":: sendnotification Controller :: Notification by Teacher to specific student");
                        sendnotificationrestostudents = yield sendnotificationObj.send_Specific_student(); // Send Notificaiton to specific student
                        break;
                    default:
                        logger.debug("requestId :: " + param.requestId + ":: Default for teacher Notification");
                }
                if (logLevel === "DEBUG")
                    logger.debug("requestId :: " + param.requestId + ":: sendnotification Controller :: sendnotificationrestostudents -" + JSON.stringify(sendnotificationrestostudents));
                res.send(sendnotificationrestostudents);
            } else if (param.initiatortype == "A") { //Notificaiton by Admin
                let sendnotificationresforadmin = {}
                logger.debug("requestId :: " + param.requestId + ":: sendnotification Controller :: Notification by Admin");
                switch (param.notificationtype.toLowerCase()) {
                    case "to_class":
                        logger.debug("requestId :: " + param.requestId + ":: sendnotification Controller :: Notification by Admin to complete class ");
                        sendnotificationresforadmin = yield sendnotificationObj.sendall(); // Send Notification to specific class
                        break;
                    case "to_all":
                        logger.debug("requestId :: " + param.requestId + ":: sendnotification Controller :: Notification by Admin to All");
                        sendnotificationresforadmin = yield sendnotificationObj.send_Organization(); // Send Notificaiton to all
                        break;
                    case "to_individual_teacher":
                        logger.debug("requestId :: " + param.requestId + ":: sendnotification Controller :: Notification by Admin to Specific Teacher/Student");
                        sendnotificationresforadmin = yield sendnotificationObj.send_Specific_teacher(); // Send Notificaiton to specific teacher / student
                        break;
                    case "to_all_teachers":
                            logger.debug("requestId :: " + param.requestId + ":: sendnotification Controller :: Notification by Admin to Specific Teacher/Student");
                            sendnotificationresforadmin = yield sendnotificationObj.send_all_teachers(); // Send Notificaiton to all teachers
                            break;
                    default:
                        logger.debug("requestId :: " + param.requestId + ":: Default for Admin Notification");
                }
                if (logLevel === "DEBUG")
                    logger.debug("requestId :: " + param.requestId + ":: sendnotification Controller :: sendnotificationresforadmin -" + JSON.stringify(sendnotificationresforadmin));
                res.send(sendnotificationresforadmin);
            } else { // Notificaiton by Student
                if (param.toteacherid.length > 0) {
                    let sendnotificationrestoteacher = yield sendnotificationObj.toteacher();
                    if (logLevel === "DEBUG")
                        logger.debug("requestId :: " + param.requestId + ":: sendnotification Controller :: sendnotificationrestoteacher -" + JSON.stringify(sendnotificationrestoteacher));
                    res.send(sendnotificationrestoteacher);
                } else {
                    logger.debug("requestId :: " + param.requestId + ":: sendnotification Controller :: Teachers ID must be specified to whom the notification is ment");
                    res.status(500).send(mapError.errorCodeToDesc(requestId, '403', "sendnotification"))
                }
            }
        }
    }).catch(function (err) {
        logger.error("requestId :: " + requestId + " :: sendnotification Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "sendnotification"))
    });

};


exports.notificationstatus = function (req, res) {
    let logger = getLogger('notificationstatus');
    let param = {};
    let requestId = req.id;

    co(function* () {
        if (logLevel === "DEBUG") {
            logger.debug("notificationstatus controller Start");
        }

        var initiatedby = typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
        logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

        if (param.initiatedby == 0)
            return res.status(400).send(mapError.errorCodeToDesc(requestId, '401', "sendnotification"))

        param.token = req.headers.authorization;
        param.notificationid = req.body.notificationid;
        param.status = typeof req.body.status != 'undefined' && req.body.status.length > 0 ? req.body.status : "UN"
        param.requestId = req.id;
        param.initiatedby = req.body.userid;

        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: notificationstatus:: Parameters Received -" + JSON.stringify(param));

        let updatenotificaiton = new updatespecificnotificationDef(param);
        if (param.status.toLowerCase() == 'r') {
            let updatenotificationres = yield updatenotificaiton.changestatus();
            if (logLevel === "DEBUG")
                logger.debug("requestId :: " + param.requestId + ":: notificationstatus Controller :: updatenotificationres - success" + JSON.stringify(updatenotificationres));
            res.send(updatenotificationres);
        } else if (param.status.toLowerCase() == 'd') {
            let deletenotificationres = yield updatenotificaiton.deletenotification();
            if (logLevel === "DEBUG")
                logger.debug("requestId :: " + param.requestId + ":: notificationstatus Controller :: deletenotificationres - success" + JSON.stringify(deletenotificationres));
            res.send(deletenotificationres);
        } else {
            if (logLevel === "DEBUG")
                logger.debug("requestId :: " + param.requestId + ":: notificationstatus:: neither an update or delete -" + param.status);
            return res.status(500).send(mapError.errorCodeToDesc(requestId, '503', "updatenotification"))

        }
    }).catch(function (err) {
        logger.debug("requestId :: " + requestId + " :: notificationstatus Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "updatenotification"))
    });

};


exports.fetchallnotification = function (req, res) {
    var logger = getLogger('fetchallnotification');
    var param = {};
    var requestId = req.id;

    co(function* () {
        if (logLevel === "DEBUG") {
            logger.debug("fetchallnotification controller Start for user -" + req.body.userid);
        }

        param.token = req.headers.authorization;
        param.initiatedby = req.body.userid;
        param.requestId = req.id;

        logger.debug("requestId :: " + param.requestId + ":: fetchallnotification:: Parameters Received -" + JSON.stringify(param));

        var getnotification = new sendnotificationDef(param);
        var notificationHistory = yield getnotification.getNotifications();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: fetchallnotification Controller :: notificationHistory -" + JSON.stringify(notificationHistory));
        res.send(notificationHistory);
    }).catch(function (err) {
        logger.error("requestId :: " + requestId + " :: fetchallnotification Exception -" + err);
        res.send(err)
    });

};
