let co = require('co');
let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));
let moment = require('moment');
let schema = require("schemajs");
let _ = require("lodash");
const { resolve } = require('path');
let logger = getLogger('updateSpecificNotificaiton');
const User = require(path.join(appRoot, 'api/models/User'));

function updateSpecificNotificaiton(param) {
    this.params = {};
    this.requestId = param.requestId;
    this.token = param.token;
    this.notificationid = param.notificationid;
    this.status = param.status;
    this.initiatedby = param.initiatedby
}


updateSpecificNotificaiton.prototype.changestatus = function () {
    let self = this;
    let requestId = self.requestId
    return new Promise(function (resolve, reject) {
        try {
            let queryPayload = { "_id": self.initiatedby, "notifications.notificationid": self.notificationid };
            let setto = self.status
            let statusPayload = { $set: { "notifications.$.viewed": true } }
            User.update(queryPayload, statusPayload, (err, result) => {
                if (err) {
                    logger.debug("requestId :: " + self.requestId + ":: error changing the status for the notification  -" + err);
                    reject(mapError.errorCodeToDesc(requestId, '501', "updatenotification"));
                } else {
                    logger.debug("requestId :: " + self.requestId + ":: Updated Specific notification status -" + JSON.stringify(statusPayload));
                    logger.debug("requestId :: " + self.requestId + ":: Updated notificiton returned status -" + JSON.stringify(result));
                    resolve(mapError.errorCodeToDesc(requestId, '200', "updatenotification"))
                }
            });
        } catch (error) {
            logger.error("requestId :: " + requestId + " :: changestatus find and update Exception -" + error);
            reject(mapError.errorCodeToDesc(requestId, '500', "updatenotification"))
        }
    });

}


updateSpecificNotificaiton.prototype.deletenotification = function () {
    let self = this;
    let requestId = self.requestId
    return new Promise(function (resolve, reject) {
        try {
            let queryPayload = { "_id": self.initiatedby, "notifications.notificationid": self.notificationid };
            let setto = self.status
            let statusPayload = { $pull: { "notifications" :{"notificationid": self.notificationid } }}
            User.update(queryPayload, statusPayload, (err, result) => {
                if (err) {
                    logger.debug("requestId :: " + self.requestId + ":: error deleting the notification  -" + err);
                    reject(mapError.errorCodeToDesc(requestId, '502', "updatenotification"));
                } else {
                    logger.debug("requestId :: " + self.requestId + ":: Delete Specific notification status -" + JSON.stringify(statusPayload));
                    logger.debug("requestId :: " + self.requestId + ":: Delete notificiton returned status -" + JSON.stringify(result));
                    resolve(mapError.errorCodeToDesc(requestId, '200', "updatenotification"))
                }
            });
        } catch (error) {
            logger.error("requestId :: " + requestId + " :: deletenotification find and update Exception -" + error);
            reject(mapError.errorCodeToDesc(requestId, '500', "updatenotification"))
        }
    });

}

module.exports = updateSpecificNotificaiton;
