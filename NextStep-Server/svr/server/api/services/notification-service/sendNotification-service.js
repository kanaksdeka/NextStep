var co = require('co');
var path = require('path');
var appRoot = path.join(require('app-root-dir').get(), '/server/');
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));
let moment = require('moment');
var schema = require("schemajs");
var _ = require("lodash");
const { resolve } = require('path');
var logger = getLogger('sendNotification-Service');
const User = require(path.join(appRoot, 'api/models/User'));

function sendNotification(param) {
    this.params = {};
    this.requestId = param.requestId;
    this.token = param.token;
    this.notifyPayload = param.notifyPayload
    this.class = param.class;
    this.section = param.section;
    this.subject = param.subject;
    this.initiatedby = param.initiatedby;
    this.toteacherid = param.toteacherid;
    this.tostudentid = param.tostudentid;
    this.initiatortype = param.initiatortype;
    this.semester = param.semester;
}



sendNotification.prototype.sendall = function () {
    var self = this;
    var requestId = self.requestId
    var logger = getLogger('sendall');

    logger.debug("requestId :: " + requestId + " :: self id ", self);

    return new Promise(function (resolve, reject) {

        let userqueryPayload = {};
        userqueryPayload["$and"] = [];
        userqueryPayload["$and"].push({ "profile.class.0.classid": self.class });
        userqueryPayload["$and"].push({ "profile.class.0.section": self.section });
        userqueryPayload["$and"].push({ "profile.class.0.semester": self.semester });

        let updatePayload = {};
        updatePayload.notificationid = moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MMDDYYYYhhmmss'),
        updatePayload.message = self.notifyPayload;
        updatePayload.sentby = {};
        updatePayload.sentby.senderid = self.initiatedby;
        updatePayload.sentby.name = mapper.teachermap.get(self.initiatedby)
        updatePayload.date = new Date();
        updatePayload.viewed = false;

        logger.debug("requestId :: " + requestId + " :: Update payload is -" + JSON.stringify(updatePayload));


        User.updateMany(userqueryPayload,
            { "$push": { "notifications": updatePayload } },
            { "new": true, "upsert": true },
            function (err, user) {
                if (err)
                    throw err;
                else {
                    logger.debug("requestId :: " + requestId + " :: Notified User -" + user.length);
                    resolve(mapError.errorCodeToDesc(requestId, '200', "sendnotification"))
                }
            }
        );

    }).catch((error) => {
        logger.error("requestId :: " + requestId + " :: sendNotification find and update Exception -" + error);
        reject(mapError.errorCodeToDesc(requestId, '500', "sendnotification"))
    });

}


sendNotification.prototype.toteacher = function () {
    var self = this;
    var requestId = self.requestId
    var logger = getLogger('toteacher');

    return new Promise(function (resolve, reject) {

        let userqueryPayload = { "_id": self.toteacherid };

        let updatePayload = {};
        updatePayload.notificationid = moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MMDDYYYYhhmmss'),
            updatePayload.message = self.notifyPayload;
        updatePayload.sentby = {};
        updatePayload.sentby.senderid = self.initiatedby
        updatePayload.sentby.name =mapper.studentmap.get(self.initiatedby)
        updatePayload.sentby.classid = self.class
        updatePayload.sentby.sectionid = self.section
        updatePayload.sentby.semesterid = self.semester

        updatePayload.sentby.class_name = mapper.grademap.get(self.class)
        updatePayload.sentby.section_name = mapper.sectionmap.get(self.section)
        updatePayload.sentby.semester_name = mapper.semestermap.get(self.semester)


        updatePayload.date = new Date();
        updatePayload.viewed = false;


        logger.debug("requestId :: " + requestId + " :: Update payload for toteacher is -" + JSON.stringify(updatePayload));


        User.update(userqueryPayload,
            { "$push": { "notifications": updatePayload } },
            { "new": true, "upsert": true },
            function (err, user) {
                if (err)
                    throw err;
                else {
                    logger.debug("requestId :: " + requestId + " :: Notified User -" + user);
                    //resolve(user)
                    resolve(mapError.errorCodeToDesc(requestId, '200', "sendnotification"))

                }
            }
        );

    }).catch((error) => {
        logger.error("requestId :: " + requestId + " :: sendNotification find and update Exception -" + error);
        reject(mapError.errorCodeToDesc(requestId, '500', "sendnotification"))
    });

}



sendNotification.prototype.send_Specific_student = function () {
    var self = this;
    var requestId = self.requestId
    var logger = getLogger('send_Specific_student');

    return new Promise(function (resolve, reject) {

        let userqueryPayload = { "_id": self.tostudentid };

        let updatePayload = {};
        updatePayload.notificationid = moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MMDDYYYYhhmmss'),
            updatePayload.message = self.notifyPayload;
        updatePayload.sentby = {};
        updatePayload.sentby.name = mapper.teachermap.get(self.initiatedby);
        updatePayload.sentby.senderid = self.initiatedby;
        updatePayload.sentby.subjectid = self.subject
        updatePayload.sentby.subject_name = mapper.subjectmap.get(self.subject)
        updatePayload.date = new Date();
        updatePayload.viewed = false;


        logger.debug("requestId :: " + requestId + " :: Update payload for send_Specific_student is -" + JSON.stringify(updatePayload));


        User.update(userqueryPayload,
            { "$push": { "notifications": updatePayload } },
            { "new": true, "upsert": true },
            function (err, user) {
                if (err)
                    throw err;
                else {
                    logger.debug("requestId :: " + requestId + " :: Notified User -" + user);
                    //resolve(user)
                    resolve(mapError.errorCodeToDesc(requestId, '200', "sendnotification"))

                }
            }
        );

    }).catch((error) => {
        logger.error("requestId :: " + requestId + " :: send_Specific_student find and update Exception -" + error);
        reject(mapError.errorCodeToDesc(requestId, '500', "sendnotification"))
    });

}


sendNotification.prototype.send_Specific_teacher = function () {
    var self = this;
    var requestId = self.requestId
    var logger = getLogger('send_Specific_teacher');

    return new Promise(function (resolve, reject) {

        let userqueryPayload = { "_id": self.toteacherid };

        let updatePayload = {};
        updatePayload.notificationid = moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MMDDYYYYhhmmss'),
            updatePayload.message = self.notifyPayload;
        updatePayload.sentby = {};
        updatePayload.sentby.name = mapper.teachermap.get(self.initiatedby);
        updatePayload.sentby.senderid = self.initiatedby;
        updatePayload.date = new Date();
        updatePayload.viewed = false;


        logger.debug("requestId :: " + requestId + " :: Update payload for send_Specific_teacher is -" + JSON.stringify(updatePayload));


        User.update(userqueryPayload,
            { "$push": { "notifications": updatePayload } },
            { "new": true, "upsert": true },
            function (err, user) {
                if (err)
                    throw err;
                else {
                    logger.debug("requestId :: " + requestId + " :: Notified User -" + user);
                    //resolve(user)
                    resolve(mapError.errorCodeToDesc(requestId, '200', "sendnotification"))

                }
            }
        );

    }).catch((error) => {
        logger.error("requestId :: " + requestId + " :: send_Specific_teacher find and update Exception -" + error);
        reject(mapError.errorCodeToDesc(requestId, '500', "sendnotification"))
    });

}

sendNotification.prototype.send_all_teachers = function () {
    var self = this;
    var requestId = self.requestId
    var logger = getLogger('send_all_teachers');

    logger.debug("requestId :: " + requestId + " :: self id ", self);

    return new Promise(function (resolve, reject) {

        let userqueryPayload = { "category.categoryType": "T"};


        let updatePayload = {};
        updatePayload.notificationid = moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MMDDYYYYhhmmss'),
            updatePayload.message = self.notifyPayload;
        updatePayload.sentby = {};
        updatePayload.sentby.senderid = self.initiatedby;
        updatePayload.sentby.name = mapper.teachermap.get(self.initiatedby)
        updatePayload.date = new Date();
        updatePayload.viewed = false;

        logger.debug("requestId :: " + requestId + " :: Update payload is -" + JSON.stringify(updatePayload));


        User.updateMany(userqueryPayload,
            { "$push": { "notifications": updatePayload } },
            { "new": true, "upsert": true },
            function (err, user) {
                if (err)
                    throw err;
                else {
                    logger.debug("requestId :: " + requestId + " :: Notified Users -" + user.length);
                    resolve(mapError.errorCodeToDesc(requestId, '200', "sendnotification"))
                }
            }
        );

    }).catch((error) => {
        logger.error("requestId :: " + requestId + " :: send_all_teachers find and update Exception -" + error);
        reject(mapError.errorCodeToDesc(requestId, '500', "sendnotification"))
    });

}



sendNotification.prototype.send_Organization = function () {
    var self = this;
    var requestId = self.requestId
    var logger = getLogger('send_Organization');

    logger.debug("requestId :: " + requestId + " :: self id ", self);

    return new Promise(function (resolve, reject) {

        let userqueryPayload = { "category.categoryType": { $ne: "A" } };


        let updatePayload = {};
        updatePayload.notificationid = moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MMDDYYYYhhmmss'),
            updatePayload.message = self.notifyPayload;

        updatePayload.sentby = {};
        updatePayload.sentby.senderid = self.initiatedby;
        updatePayload.sentby.name = mapper.teachermap.get(self.initiatedby)
        updatePayload.date = new Date();
        updatePayload.viewed = false;

        logger.debug("requestId :: " + requestId + " :: Update payload is -" + JSON.stringify(updatePayload));


        User.updateMany(userqueryPayload,
            { "$push": { "notifications": updatePayload } },
            { "new": true, "upsert": true },
            function (err, user) {
                if (err)
                    throw err;
                else {
                    logger.debug("requestId :: " + requestId + " :: Notified Users -" + user.length);
                    resolve(mapError.errorCodeToDesc(requestId, '200', "sendnotification"))
                }
            }
        );

    }).catch((error) => {
        logger.error("requestId :: " + requestId + " :: send_Organization find and update Exception -" + error);
        reject(mapError.errorCodeToDesc(requestId, '500', "sendnotification"))
    });

}


sendNotification.prototype.getNotifications = function () {
    var self = this;
    var logger = getLogger('getNotifications');

    return new Promise(function (resolve, reject) {
        var notificationmap = [];
        logger.debug("requestId :: " + self.requestId + ":: Inside getNotifications for -" + self.initiatedby);

        var notificationarr = [];

        try {
            User.find({ '_id': self.initiatedby }, { notifications: 1 }, (err, notificationObj) => {
                if (!notificationObj || notificationObj.length == 0) {
                    logger.debug("requestId :: " + self.requestId + ":: No Documents for -" + JSON.stringify(notificationObj));
                    reject(mapError.errorCodeToDesc(self.requestId, '204', "getNotifications"))
                } else {
                    logger.debug("requestId :: " + self.requestId + ":: notificationObj  -" + JSON.stringify(notificationObj));
                    notificationObj[0].notifications.forEach(function (obj) {
                        var notificaitondate = moment(obj.date).format("YYYY-MM-DDT00:00:00");
                        logger.debug("requestId :: " + self.requestId + ":: Notificaiton Date is -" + notificaitondate);

                        if (notificaitondate <= moment().format("YYYY-MM-DDT00:00:00") && notificaitondate >= moment().subtract(30, 'days').format("YYYY-MM-DDT00:00:00")) {
                            logger.debug("requestId :: " + self.requestId + ":: Notificaiton Date falls in 30 days range -" + notificaitondate);
                            notificationarr.push(obj);
                        } else {
                            logger.debug("requestId :: " + self.requestId + ":: Date doesn't falls in 30 days range -" + notificaitondate);
                        }
                    })
                    resolve(notificationarr)
                }
            })
        } catch (err) {
            logger.error("requestId :: " + requestId + " :: getNotifications find and update Exception -" + err);
            reject(mapError.errorCodeToDesc(requestId, '500', "getNotifications"))
        }
    })
}


module.exports = sendNotification;
