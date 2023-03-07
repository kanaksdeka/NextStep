var co = require('co');
var path = require('path');
var appRoot = path.join(require('app-root-dir').get(), '/server/');
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));
let moment = require('moment');
var schema = require("schemajs");
var _ = require("lodash");
const { resolve } = require('path');
var logger = getLogger('updateSpecificPeriod-Service');
const Period = require(path.join(appRoot, 'api/models/Period'));

function updatSpecificePeriod(param) {
    this.params = {};
    this.requestPayload = param.requestPayload; //input payload
    this.requestId = param.requestId;
}

updatSpecificePeriod.prototype.validateInputPayload = function () {
    var self = this;
    var error = {};

    if (logLevel === "DEBUG")
        logger.debug("requestId :: " + self.requestId + ":: validateInputPayload :: Called");
    var model = schema.create({
        id: {
            type: "string",
            filters: "trim",
            required: true
        },
        documentid: {
            type: "string",
            filters: "trim",
            required: false
        },
        starttime: {
            type: "string",
            filters: "trim",
            required: false
        },
        endtime: {
            type: "string",
            filters: "trim",
            required: false
        },
        startDate: {
            type: "string",
            filters: "trim",
            required: false
        },
        endDate: {
            type: "string",
            filters: "trim",
            required: false
        },
        sharable: {
            type: "boolean",
            required: false
        },
    });
    return new Promise(function (resolve, reject) {
        var form = model.validate({
            id: self.requestPayload.id,
            starttime: self.requestPayload.starttime,
            endtime: self.requestPayload.endtime,
            startDate: self.requestPayload.newdate,
            documentid: self.requestPayload.documentid,
            sharable: self.requestPayload.sharable

        });

        if (logLevel === "INFO") {
            logger.info("requestId :: " + self.requestId + ":: FORM -" + JSON.stringify(form));
            logger.info("requestId :: " + self.requestId + ":: validateInputPayload :: Returning -" + form.valid);
        }
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + self.requestId + ":: validateInputPayload:: Form -" + form.valid)
        if (form.valid) {

            if (typeof self.requestPayload.newdate != 'undefined' && self.requestPayload.newdate.length > 0) {
                self.requestPayload.endDate = self.requestPayload.newdate; // If a date change is done
                //var startDate = moment(self.requestPayload.newdate + "T00:00:00", "MM/DD/YYYYT00:00:00").format("MM/DD/YYYYT00:00:00");
                // var startDate = moment(self.requestPayload.newdate + "T00:00:00", "DD/MM/YYYYT00:00:00").format("DD/MM/YYYYT00:00:00");

                var startDate = moment(new Date(self.requestPayload.startDate+'T'+self.requestPayload.starttime+':00'), 'ddd MMM D YYYY HH:mm:ss ZZ') // format will return a string

                logger.debug("requestId :: " + self.requestId + ":: validateInputPayload:: Start Date Converted is -" + startDate);
                if (startDate < moment().format("MM/DD/YYYYT00:00:00")) {
                    logger.debug("requestId :: " + self.requestId + ":: validateInputPayload:: Start Date Validtion Error ")
                    reject(mapError.errorCodeToDesc(self.requestId, '401', "updateperiod"))
                } else {
                    logger.debug("requestId :: " + self.requestId + ":: validateInputPayload:: Start Dates passed is valid ");
                }
            }
            if (typeof self.requestPayload.endDate != 'undefined' && self.requestPayload.endDate.length > 0) {
                //  var endDate = moment(self.requestPayload.endDate + "T00:00:00", "DD/MM/YYYYT00:00:00").format("DD/MM/YYYYT00:00:00");
                //var endDate = moment(self.requestPayload.endDate + "T00:00:00", "MM/DD/YYYYT00:00:00").format("MM/DD/YYYYT00:00:00");
                var endDate = moment(new Date(self.requestPayload.endDate+'T'+self.requestPayload.endtime+':00'), 'ddd MMM D YYYY HH:mm:ss ZZ')

                logger.debug("requestId :: " + self.requestId + ":: validateInputPayload:: End Date Converted is -" + endDate);
                logger.debug("requestId :: " + self.requestId + ":: validateInputPayload:: System Date time is -" + moment().format("DD/MM/YYYYT00:00:00"));
                if (endDate < moment().format("MM/DD/YYYYT00:00:00")) {
                    logger.debug("requestId :: " + self.requestId + ":: validateInputPayload:: End Date Validtion Error ")
                    reject(mapError.errorCodeToDesc(self.requestId, '402', "updateperiod"))
                } else {
                    logger.debug("requestId :: " + self.requestId + ":: validateInputPayload:: End Dates passed is valid ");
                }
            }
            resolve(true)
        } else {

            logger.error("requestId :: " + self.requestId + ":: validateInputPayload:: Schema Validation Failed -" + JSON.stringify(error))
            reject(mapError.errorCodeToDesc(self.requestId, '403', "updateperiod"))
        }
    });

}




updatSpecificePeriod.prototype.update = function () {
    var self = this;
    var requestId = self.requestId
    return new Promise(function (resolve, reject) {

        var queryPayload = { "_id": self.requestPayload.id };
        Period.findOne(queryPayload, (err, _period) => {
            if (err) {
                logger.error("requestId :: " + requestId + ":: No class found with provided id -" + err);
                reject(mapError.errorCodeToDesc(requestId, '404', "updateperiod"))
            } else {
                logger.debug("requestId :: " + requestId + ":: Class found with id -" + self.requestPayload.id);
                logger.debug("requestId :: " + requestId + ":: Class details -" + JSON.stringify(_period));

                //logger.debug("requestId :: " + self.requestId + ":: Web link object length is   -" + Object.keys(_period.record.weblink).length);

                if (typeof _period.record.weblink == 'undefined') {
                    logger.debug("requestId :: " + self.requestId + ":: Web link object is empty  -" + _period.record.weblink);
                    _period.record.weblink = {};

                    _period.record.weblink.zoom = { date: new Date(), publish: false, code: new String(), password: new String(), url: new String() }
                    _period.record.weblink.skype = { date: new Date(), publish: false, code: new String(), password: new String(), url: new String() }
                    _period.record.weblink.jitsi = { date: new Date(), publish: false, code: new String(), password: new String(), url: new String() }
                    _period.record.weblink.video = { date: new Date(), publish: false, code: new String(), password: new String(), url: new String() }

                    _period.record.weblink.classnote = { date: new Date(), publish: false, notes: new String() }
                    _period.record.weblink.dashboard = { date: new Date(), publish: false, url: new String() }
                    logger.debug("requestId :: " + self.requestId + ":: Web link after initializing   -" + JSON.stringify(_period.record.weblink));

                }


                if (typeof self.requestPayload.starttime !== 'undefined' && self.requestPayload.starttime.length > 0) {
                    _period.starttime = self.requestPayload.starttime;
                }
                if (typeof self.requestPayload.endtime !== 'undefined' && self.requestPayload.endtime.length > 0) {
                    _period.endtime = self.requestPayload.endtime;
                }
                if (typeof self.requestPayload.newdate !== 'undefined' && self.requestPayload.newdate.length > 0) {
                    logger.debug("requestId :: " + self.requestId + ":: Changing class date -" + self.requestPayload.newdate);
                    //let startDate = moment(new Date(self.requestPayload.newdate), 'ddd MMM D YYYY HH:mm:ss ZZ') // format will return a string
                    let startDate = moment(new Date(self.requestPayload.startDate+'T'+self.requestPayload.starttime+':00'), 'ddd MMM D YYYY HH:mm:ss ZZ') // format will return a string
                    let endDate = moment(new Date(self.requestPayload.endDate+'T'+self.requestPayload.endtime+':00'), 'ddd MMM D YYYY HH:mm:ss ZZ')

                    //let endDate = moment(new Date(self.requestPayload.newdate), 'ddd MMM D YYYY HH:mm:ss ZZ')
                    logger.debug("requestId :: " + self.requestId + ":: Start Date -" + startDate.toDate());
                    logger.debug("requestId :: " + self.requestId + ":: End Date -" + endDate.toDate());

                    _period.startdate = startDate.toDate();
                    _period.enddate = endDate.toDate();
                }

                if (typeof self.requestPayload.classnote !== 'undefined' && Object.keys(self.requestPayload.classnote).length > 0) {
                    logger.debug("requestId :: " + self.requestId + ":: Updating classnote - Exisitng value " + JSON.stringify(_period.record.weblink.classnote));
                    _period.record.weblink.classnote={}
                    _period.record.weblink.classnote.date={};
                    _period.record.weblink.classnote.notes={};
                    _period.record.weblink.classnote.publish={}
                   
                    _period.record.weblink.classnote.date = new Date();
                    _period.record.weblink.classnote.notes = typeof self.requestPayload.classnote.notes != 'undefined' && self.requestPayload.classnote.notes.length > 0 ? self.requestPayload.classnote.notes : ""
                    _period.record.weblink.classnote.publish = typeof self.requestPayload.classnote.publish != 'undefined' && self.requestPayload.classnote.publish > 0 ? self.requestPayload.classnote.publish : false
                }

                if (typeof self.requestPayload.zoom !== 'undefined' && Object.keys(self.requestPayload.zoom).length > 0) {
                    logger.debug("requestId :: " + self.requestId + ":: Updating zoom - Exisitng value " + JSON.stringify(_period.record.weblink.zoom));
                    //  _period.record.weblink.zoom={};
                    _period.record.weblink.zoom={}
                    _period.record.weblink.zoom.date={};
                    _period.record.weblink.zoom.code={};
                    _period.record.weblink.zoom.password={};
                    _period.record.weblink.zoom.url={}
                    _period.record.weblink.zoom.publish={}
                    
                    _period.record.weblink.zoom.date = new Date(),
                    _period.record.weblink.zoom.code = typeof self.requestPayload.zoom.code != 'undefined' && self.requestPayload.zoom.code.length > 0 ? self.requestPayload.zoom.code : ""
                    _period.record.weblink.zoom.password = typeof self.requestPayload.zoom.password != 'undefined' && self.requestPayload.zoom.password.length > 0 ? self.requestPayload.zoom.password : ""
                    _period.record.weblink.zoom.url = typeof self.requestPayload.zoom.url != 'undefined' && self.requestPayload.zoom.url.length > 0 ? self.requestPayload.zoom.url : ""
                    _period.record.weblink.zoom.publish = typeof self.requestPayload.zoom.publish != 'undefined' && self.requestPayload.zoom.publish > 0 ? self.requestPayload.zoom.publish : false

                }
                if (typeof self.requestPayload.skype !== 'undefined' && Object.keys(self.requestPayload.skype).length > 0) {
                    logger.debug("requestId :: " + self.requestId + ":: Updating Skype - Exisitng value " + JSON.stringify(_period.record.weblink.skype));
                    
                    _period.record.weblink.skype={}
                    _period.record.weblink.skype.date={};
                    _period.record.weblink.skype.code={};
                    _period.record.weblink.skype.password={};
                    _period.record.weblink.skype.url={}
                    _period.record.weblink.skype.publish={}

                    _period.record.weblink.skype.date = new Date();
                    _period.record.weblink.skype.code = typeof self.requestPayload.skype.code != 'undefined' && self.requestPayload.skype.code.length > 0 ? self.requestPayload.skype.code : ""
                    _period.record.weblink.skype.password = typeof self.requestPayload.skype.password != 'undefined' && self.requestPayload.skype.password.length > 0 ? self.requestPayload.skype.password : ""
                    _period.record.weblink.skype.url = typeof self.requestPayload.skype.url != 'undefined' && self.requestPayload.skype.url.length > 0 ? self.requestPayload.skype.url : ""
                    _period.record.weblink.skype.publish = typeof self.requestPayload.skype.publish != 'undefined' && self.requestPayload.skype.publish > 0 ? self.requestPayload.skype.publish : false

                }

                if (typeof self.requestPayload.jitsi !== 'undefined' && Object.keys(self.requestPayload.jitsi).length > 0) {
                    logger.debug("requestId :: " + self.requestId + ":: Updating jitsi - Exisitng value " + JSON.stringify(_period.record.weblink.jitsi));
                    _period.record.weblink.jitsi={}
                    _period.record.weblink.jitsi.date={};
                    _period.record.weblink.jitsi.code={};
                    _period.record.weblink.jitsi.password={};
                    _period.record.weblink.jitsi.url={}
                    _period.record.weblink.jitsi.publish={}


                    _period.record.weblink.jitsi.date = new Date();
                    _period.record.weblink.jitsi.code = typeof self.requestPayload.jitsi.code != 'undefined' && self.requestPayload.jitsi.code.length > 0 ? self.requestPayload.jitsi.code : ""
                    _period.record.weblink.jitsi.password = typeof self.requestPayload.jitsi.password != 'undefined' && self.requestPayload.jitsi.password.length > 0 ? self.requestPayload.jitsi.password : ""
                    _period.record.weblink.jitsi.url = typeof self.requestPayload.jitsi.url != 'undefined' && self.requestPayload.jitsi.url.length > 0 ? self.requestPayload.jitsi.url : ""
                    _period.record.weblink.jitsi.publish = typeof self.requestPayload.jitsi.publish != 'undefined' && self.requestPayload.jitsi.publish > 0 ? self.requestPayload.jitsi.publish : false

                }

                if (typeof self.requestPayload.video !== 'undefined' && Object.keys(self.requestPayload.video).length > 0) {
                    logger.debug("requestId :: " + self.requestId + ":: Updating video - Exisitng value " + JSON.stringify(_period.record.weblink.video));
                    _period.record.weblink.video={}
                    _period.record.weblink.video.date={};
                    _period.record.weblink.video.code={};
                    _period.record.weblink.video.password={};
                    _period.record.weblink.video.url={}
                    _period.record.weblink.video.publish={}

                    _period.record.weblink.video.date = new Date();
                    _period.record.weblink.video.code = typeof self.requestPayload.video.code != 'undefined' && self.requestPayload.video.code.length > 0 ? self.requestPayload.video.code : ""
                    _period.record.weblink.video.password = typeof self.requestPayload.video.password != 'undefined' && self.requestPayload.video.password.length > 0 ? self.requestPayload.video.password : ""
                    _period.record.weblink.video.url = typeof self.requestPayload.video.url != 'undefined' && self.requestPayload.video.url.length > 0 ? self.requestPayload.video.url : ""
                    _period.record.weblink.video.publish = typeof self.requestPayload.video.publish != 'undefined' && self.requestPayload.video.publish > 0 ? self.requestPayload.video.publish : false

                }


                if (typeof self.requestPayload.dashboard !== 'undefined' && Object.keys(self.requestPayload.dashboard).length > 0) {
                    logger.debug("requestId :: " + self.requestId + ":: Updating Dahboard - Exisitng value " + JSON.stringify(_period.record.weblink.Dahboard));

                    _period.record.weblink.dashboard={}
                    _period.record.weblink.dashboard.date={};
                    _period.record.weblink.dashboard.url={}
                    _period.record.weblink.dashboard.publish={}
                    
                    _period.record.weblink.dashboard.date = new Date();
                    _period.record.weblink.dashboard.url = typeof self.requestPayload.dashboard.url != 'undefined' && self.requestPayload.dashboard.url.length > 0 ? self.requestPayload.dashboard.url : ""
                    _period.record.weblink.dashboard.publish = typeof self.requestPayload.dashboard.publish != 'undefined' && self.requestPayload.dashboard.publish > 0 ? self.requestPayload.dashboard.publish : false
                }


                logger.debug("requestId :: " + self.requestId + ":: Final save object -" + JSON.stringify(_period));



                Period.update(queryPayload, _period, (err) => {
                    if (err) {
                        logger.debug("requestId :: " + self.requestId + ":: error updating the period  -" + err);
                        reject(mapError.errorCodeToDesc(requestId, '501', "updateperiod"));
                    } else {
                        logger.debug("requestId :: " + self.requestId + ":: Updated Specific period -" + JSON.stringify(_period));
                        //resolve(_period);
                        resolve(mapError.errorCodeToDesc(requestId, '200', "updateperiod"))
                    }
                });
            } //end of else

        }).catch((error) => {
            logger.error("requestId :: " + requestId + " :: updateprofile find and update Exception -" + error);
            reject(mapError.errorCodeToDesc(requestId, '500', "updateperiod"))
        });

    })
}


updatSpecificePeriod.prototype.changestatus = function () {
    var self = this;
    var requestId = self.requestId
    return new Promise(function (resolve, reject) {

        var queryPayload = { "_id": self.requestPayload.id, "record.documents.uploadref": self.requestPayload.documentid };
        var setto = (typeof self.requestPayload.sharable != 'undefined') && (self.requestPayload.sharable === true || self.requestPayload.sharable === false) ? self.requestPayload.sharable : false
        var statusPayload = { $set: { "record.documents.$.sharable": setto } }
        Period.update(queryPayload, statusPayload, (err, result) => {
            if (err) {
                logger.debug("requestId :: " + self.requestId + ":: error changing the status for the period  -" + err);
                reject(mapError.errorCodeToDesc(requestId, '501', "updateperiod"));
            } else {
                logger.debug("requestId :: " + self.requestId + ":: Updated Specific period Document status -" + JSON.stringify(statusPayload));
                logger.debug("requestId :: " + self.requestId + ":: Updated returned  Document status -" + JSON.stringify(result));
                if(result.n===0){
                    var queryPayloadAssign = { "_id": self.requestPayload.id, "record.assignment.uploadref": self.requestPayload.documentid };
                    Period.update(queryPayloadAssign, statusPayload, (err, result) => {
                        if (err) {
                            logger.debug("requestId :: " + self.requestId + ":: error changing the status for the period  -" + err);
                            reject(mapError.errorCodeToDesc(requestId, '501', "updateperiod"));
                        } else {
                            logger.debug("requestId :: " + self.requestId + ":: Updated Specific period Assignment status -" + JSON.stringify(statusPayload));
                            logger.debug("requestId :: " + self.requestId + ":: Updated returned  Assignment status -" + JSON.stringify(result));
                            if(result.n===0){
                                logger.debug("requestId :: " + self.requestId + ":: Dint find the record in Assignment too -" + JSON.stringify(result));
                                resolve(mapError.errorCodeToDesc(requestId, '504', "updateperiod"));
                            }else{
                                logger.debug("requestId :: " + self.requestId + ":: Updated for Assignment status -" + JSON.stringify(result));
                                resolve(mapError.errorCodeToDesc(requestId, '200', "updateperiod"))
                            }
                        }
                    });
                }else{
                    logger.debug("requestId :: " + self.requestId + ":: Updated for Dcoument status -" + JSON.stringify(result));
                    resolve(mapError.errorCodeToDesc(requestId, '200', "updateperiod"))
                }
            }
        });
    }).catch((error) => {
        logger.error("requestId :: " + requestId + " :: changestatus find and update Exception -" + error);
        reject(mapError.errorCodeToDesc(requestId, '500', "updateperiod"))
    });

}


module.exports = updatSpecificePeriod;
