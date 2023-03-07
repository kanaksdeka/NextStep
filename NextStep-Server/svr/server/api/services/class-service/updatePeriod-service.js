var co = require('co');
var path = require('path');
var appRoot = path.join(require('app-root-dir').get(), '/server/');
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));
let moment = require('moment');
var schema = require("schemajs");
var _ = require("lodash");
const { resolve } = require('path');
var logger = getLogger('updatePeriod-Service');
const Period = require(path.join(appRoot, 'api/models/Period'));
const PeriodIndex = require(path.join(appRoot, 'api/models/PeriodIndex'));
var createperiodDef = require(path.join(appRoot, '/api/services/class-service/createPeriod-service.js'));

const async = require('async');




function updatePeriod(param) {
    this.params = {};
    this.requestPayload = param.requestPayload; //input payload
    this.requestId = param.requestId;
    this.periodindex = "";
    this.sortedIndex = [];
}

updatePeriod.prototype.validateInputPayload = function () {
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
        class: {
            type: "string",
            filters: "trim",
            required: false
        },
        subject: {
            type: "string",
            filters: "trim",
            required: false
        },
        section: {
            type: "string",
            filters: "trim",
            required: false
        },
        semester: {
            type: "string",
            filters: "trim",
            required: false
        },
        days: {
            type: Array,
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
        mainteacher: {
            type: "string",
            filters: "trim",
            required: false
        },
        substituteteacher: {
            type: "string",
            filters: "trim",
            required: false
        },
        mainteacherindex: {
            type: "string",
            filters: "trim",
            required: false
        },
        substituteteacherindex: {
            type: "string",
            filters: "trim",
            required: false
        },
        clouddrive: {
            type: "string",
            filters: "trim",
            required: false
        },
        active: {
            type: "string",
            filters: "trim",
            required: false
        }
    });
    return new Promise(function (resolve, reject) {



        var form = model.validate({
            id: self.requestPayload.id,
            class: self.requestPayload.class,
            subject: self.requestPayload.subject,
            section: self.requestPayload.section,
            semester: self.requestPayload.semester,
            days: self.requestPayload.days,
            starttime: self.requestPayload.starttime,
            endtime: self.requestPayload.endtime,
            startDate: self.requestPayload.startDate,
            endDate: self.requestPayload.endDate,
            mainteacher: self.requestPayload.mainteacher,
            mainteacherindex: self.requestPayload.mainteacherid,
            clouddrive: self.requestPayload.clouddrive,
            active:self.requestPayload.delete//.toLowerCase()=="true"?true:false
        });

        if (logLevel === "INFO") {
            logger.info("requestId :: " + self.requestId + ":: FORM -" + JSON.stringify(form));
            logger.info("requestId :: " + self.requestId + ":: validateInputPayload :: Returning -" + form.valid);
        }
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + self.requestId + ":: validateInputPayload:: Form -" + form.valid)
        if (form.valid) {

            if (typeof self.requestPayload.startDate != 'undefined' && self.requestPayload.startDate.length > 0) {
                var startDate = moment(self.requestPayload.startDate + "T00:00:00", "MM/DD/YYYYT00:00:00").format("MM/DD/YYYYT00:00:00");
               // var startDate = moment(self.requestPayload.startDate + "T00:00:00", "DD/MM/YYYYT00:00:00").format("DD/MM/YYYYT00:00:00");
                logger.debug("requestId :: " + self.requestId + ":: validateInputPayload:: Start Date Converted is -" + startDate);

                let startDate1 = moment(new Date(self.requestPayload.startDate), 'ddd MMM D YYYY HH:mm:ss ZZ') 
                let difference = startDate1.diff(moment(), 'days');

                if(difference<0){
                //if (startDate < moment().format("MM/DD/YYYYT00:00:00")) {
                    logger.debug("requestId :: " + self.requestId + ":: validateInputPayload:: Start Date Validtion Error ")
                    reject(mapError.errorCodeToDesc(self.requestId, '401', "updateperiod"))
                } else {
                    logger.debug("requestId :: " + self.requestId + ":: validateInputPayload:: Start Dates passed is valid ");
                }
            }
            if (typeof self.requestPayload.endDate != 'undefined' && self.requestPayload.endDate.length > 0) {
              //  var endDate = moment(self.requestPayload.endDate + "T00:00:00", "DD/MM/YYYYT00:00:00").format("DD/MM/YYYYT00:00:00");
                var endDate = moment(self.requestPayload.endDate + "T00:00:00", "MM/DD/YYYYT00:00:00").format("MM/DD/YYYYT00:00:00");

                logger.debug("requestId :: " + self.requestId + ":: validateInputPayload:: End Date Converted is -" + endDate);
                logger.debug("requestId :: " + self.requestId + ":: validateInputPayload:: System Date time is -" + moment().format("DD/MM/YYYYT00:00:00"));
                let endDate1 = moment(new Date(self.requestPayload.endDate), 'ddd MMM D YYYY HH:mm:ss ZZ')
                let difference = endDate1.diff(moment(), 'days');

                if(difference<0){//moment().format("MM/DD/YYYYT00:00:00")) {
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




updatePeriod.prototype.update = function () {
    var self = this;
    var requestId=self.requestId
    let _period = new Period();
    let _subject = false;
    let _class = false;
    let _section = false;
    let _semester = false;
    let _days = false;
    let _starttime = false;
    let _endtime = false;
    let _startdate = false;
    let _enddate = false;
    let _mainteacher = false;
    let _mainteacherid = false;
    let _onlyIndex = false;
    let _periodandIndex = false;
    let _delete=false;
    let _drive=false;

    logger.debug("requestId :: " + requestId + ":: Update Request Payload -",self.requestPayload);



    return new Promise(function (resolve, reject) {

        var queryPayload = { "_id": self.requestPayload.id };
        PeriodIndex.findOne(queryPayload, (err, _periodindex) => {
            if (!_periodindex) {
                logger.error("requestId :: " + requestId + ":: No class found with provided id ");
                reject(mapError.errorCodeToDesc(requestId, '404', "updateperiod"))
            } else {
                logger.debug("requestId :: " + requestId + ":: Class found with id -" + self.requestPayload.id);
           // }


            if (typeof self.requestPayload.class !== 'undefined' && self.requestPayload.class.length > 0) {
                _periodindex.class = self.requestPayload.class;
                _class = true;
                _onlyIndex = true;
            }
            if (typeof self.requestPayload.subject !== 'undefined' && self.requestPayload.subject.length > 0) {
                _periodindex.subject = self.requestPayload.subject;
                _subject = true;
                _onlyIndex = true;
            }
            if (typeof self.requestPayload.section !== 'undefined' && self.requestPayload.section.length > 0) {
                _periodindex.section = self.requestPayload.section;
                _section = true;
                _onlyIndex = true;
            }
            if (typeof self.requestPayload.semester !== 'undefined' && self.requestPayload.semester.length > 0) {
                _periodindex.semester = self.requestPayload.semester;
                _semester = true;
                _onlyIndex = true;
            }
            if (typeof self.requestPayload.days !== 'undefined' && self.requestPayload.days.length > 0) {
                _periodindex.days = self.requestPayload.days;
                _days = true;
                _periodandIndex = true;
            }
            if (typeof self.requestPayload.starttime !== 'undefined' && self.requestPayload.starttime.length > 0) {
                _periodindex.starttime = self.requestPayload.starttime;
                _starttime = true;
                //_onlyIndex = true;
                _periodandIndex = true;
            }
            if (typeof self.requestPayload.endtime !== 'undefined' && self.requestPayload.endtime.length > 0) {
                _periodindex.endtime = self.requestPayload.endtime;
                _endtime = true;
                //_onlyIndex = true;
                _periodandIndex = true;
            }
            if (typeof self.requestPayload.startDate !== 'undefined' && self.requestPayload.startDate.length > 0) {
                //let startDate = moment(new Date(self.requestPayload.startDate), 'ddd MMM D YYYY HH:mm:ss ZZ') // format will return a string
                let startDate=moment(new Date(self.requestPayload.startDate+'T'+self.requestPayload.starttime+':00'), 'ddd MMM D YYYY HH:mm:ss ZZ')
                _periodindex.startdate = startDate.toDate();//self.requestPayload.startDate;
                _startdate = true;
                _periodandIndex = true;
            }
            if (typeof self.requestPayload.endDate !== 'undefined' && self.requestPayload.endDate.length > 0) {
                //let endDate = moment(new Date(self.requestPayload.endDate), 'ddd MMM D YYYY HH:mm:ss ZZ')
                let endDate = moment(new Date(self.requestPayload.endDate+'T'+self.requestPayload.endtime+':00'), 'ddd MMM D YYYY HH:mm:ss ZZ')
                _periodindex.enddate = endDate.toDate();//self.requestPayload.endDate;
                _enddate = true;
                _periodandIndex = true;
            }
            if (typeof self.requestPayload.mainteacher !== 'undefined' && self.requestPayload.mainteacher.length > 0) {
                _periodindex.mainteacher = self.requestPayload.mainteacher;
                _mainteacher = true;
                _onlyIndex = true;
            }
            if (typeof self.requestPayload.mainteacherid !== 'undefined' && self.requestPayload.mainteacherid.length > 0) {
                _periodindex.mainteacherid = self.requestPayload.mainteacherid;
                _mainteacherid = true;
                _onlyIndex = true;
            }
            if (typeof self.requestPayload.clouddrive !== 'undefined' && self.requestPayload.clouddrive.length > 0) {
                _periodindex.clouddrive = self.requestPayload.clouddrive;
                _drive = true;
                _onlyIndex = true;
            }
            if (typeof self.requestPayload.delete !== 'undefined' && self.requestPayload.delete.length > 0) {
                _periodindex.active = self.requestPayload.delete.toLowerCase()=="true"?false:true; //if asked to delete set the isactive flag to false
                _delete = true;
                _onlyIndex = true;
            }

            if (_onlyIndex === true && _periodandIndex==false) {
                logger.debug("requestId :: " + self.requestId + ":: Updatign only Index");

                _periodindex.save(function (err, period) {
                    if (err) {
                        logger.debug("requestId :: " + self.requestId + ":: error updating the period Index -" + err);
                        reject(mapError.errorCodeToDesc(requestId, '501', "updateperiod"));
                    }else{
                        //const {_id,createdAt, ...updatedAt} = period; //es6 spread operator
                        //const filteredObject = _.omit(_id, 'period');
                        logger.debug("requestId :: " + self.requestId + ":: Updated Index period -" + JSON.stringify(period));
                        resolve(period);
                    }
                })
            }

            if ((_onlyIndex === true && _periodandIndex==true)|| (_onlyIndex === false && _periodandIndex==true)) {
                //First Update the Index Class
                logger.debug("requestId :: " + self.requestId + ":: Updatign both  Index and Period");

                if( _startdate===false || _enddate===false){
                    logger.debug("requestId :: " + self.requestId + "::" + " Date from and End should be provided for this operation");
                    reject(mapError.errorCodeToDesc(requestId, '503', "updateperiod"));
                }

                async.waterfall([
                    function updatePeriodIndex(done) {
                        logger.debug("requestId :: " + self.requestId + ":: Updating to period Index -" + _periodandIndex);
                        _periodindex.save(function (err, upindexPeriod) {
                            if (err) {
                                logger.debug("requestId :: " + self.requestId + ":: error updating the period Index -" + err);
                                reject(mapError.errorCodeToDesc(requestId, '501', "updateperiod"));
                            }else{
                                logger.debug("requestId :: " + self.requestId + ":: Updated Index period -" + JSON.stringify(upindexPeriod));
                                done(null,upindexPeriod)
                            }
                        })
                    },
                    function deleteperiods(upindexPeriod,done) {
                       // { "periodindex": "5f13127d78253b2b7a345025", $and: [ { "startdate": { $gt: ISODate("2020-07-26T18:30:00.000+0000") } } ] }
                        var queryPayload={
                            "periodindex":upindexPeriod._id,
                            $and: [ 
                                { "startdate": { $gt: new Date() } } //  this code might cause a problem , as we storing the date passed from UI which is converted based on tie zone. But Date() will return the current system time in UTC
                            ] 
                        }
                        logger.debug("requestId :: " + self.requestId + ":: deleteperiods queryPayload is -" + queryPayload);
                        Period.remove(queryPayload,function (err, rsult) {
                            if (err) {
                                logger.debug("requestId :: " + self.requestId + ":: error deleting the periods greater than  -" + new Date());
                                reject(mapError.errorCodeToDesc(requestId, '502', "updateperiod"));
                            }else{
                                logger.debug("requestId :: " + self.requestId + ":: Delete period returned -" + JSON.stringify(rsult));
                                done(null,upindexPeriod)
                            }
                        })
                    },
                    function recreateperiods(upindexPeriod,done) {
                            //return new Promise(function (resolve, reject) {
                        var logger = getLogger('recreateperiods');
                        var param = {};
                        var requestId = self.requestId

                        if(self.requestPayload.days==undefined){
                            reject(mapError.errorCodeToDesc(requestId, '505', "updateperiod"));
                        }else{


                        //Indexign the days array
                        var days = self.requestPayload.days
                        var indexarr = []
                        for (var i = 0; i < days.length; i++) {
                            switch (days[i].toLowerCase()) {
                                case 'monday': indexarr.push(1);
                                    break;
                                case 'tuesday': indexarr.push(2);
                                    break;
                                case 'wednesday': indexarr.push(3);
                                    break;
                                case 'thursday': indexarr.push(4);
                                    break;
                                case 'friday': indexarr.push(5);
                                    break;
                                case 'saturday': indexarr.push(6);
                                    break;
                                case 'sunday': indexarr.push(0);
                                    break;
                            }
                        }
                        param.sortedIndex = indexarr.sort(function (a, b) { return a - b });

                        logger.debug("requestId :: " + self.requestId + ":: recreateperiods :: Periods Days original -" + days)
                        logger.debug("requestId :: " + self.requestId + ":: recreateperiods :: Periods Days Index Array -" + param.sortedIndex);

                        //End of Indexing

                        co(function* () {
                                logger.debug("recreateperiods controller Start");
                                var inStartDate = moment(self.requestPayload.startDate + "T00:00:00", "MM/DD/YYYYT00:00:00").format("MM/DD/YYYY");
                                var inEndDate = moment(self.requestPayload.endDate + "T00:00:00", "MM/DD/YYYYT00:00:00").format("MM/DD/YYYY");
                                

                            param.requestPayload={
                                days: upindexPeriod.days,
                                starttime: upindexPeriod.starttime,
                                endtime: upindexPeriod.endtime,
                                startDate: self.requestPayload.startDate,//inStartDate,
                                endDate: self.requestPayload.endDate//inEndDate,
                            }
                            param.periodindex=upindexPeriod._id
                            param.requestId = self.requestId
                            if (logLevel === "DEBUG")
                                logger.debug("requestId :: " + requestId + ":: createperiod:: Parameters Received -" + JSON.stringify(param));

                            var createperiodObj = new createperiodDef(param);
                           /* var payloadValidation = yield createperiodObj.validateInputPayload();
                            if (logLevel === "DEBUG")
                                logger.debug("requestId :: " + param.requestId + "::" + " validation status is:" + payloadValidation);*/
                            var createperiodStatus = yield createperiodObj.create();
                            if (logLevel === "DEBUG")
                                logger.debug("requestId :: " + requestId + ":: createperiod Controller :: createperiodStatus -" + JSON.stringify(createperiodStatus));
                           resolve(createperiodStatus);
                        }).catch(function (err) {
                            logger.error("requestId :: " + requestId + " :: createperiod Exception -" + err);
                            reject(mapError.errorCodeToDesc(requestId , '501', "createperiod"))
                        });
                    }}
                    ], (err) => {
                        if (err) {
                            logger.error("requestId :: " + requestId  + " :: updateperiod Controller Async Waterfall Error is -" + err);
                            reject(mapError.errorCodeToDesc(requestId , '502', "updateperiod"))
                        }
                    }); // End of Async waterfall

            }
        }//End of Else

        }).catch((error) => {
            logger.error("requestId :: " + requestId + " :: updateprofile find and update Exception -" + error);
            reject(mapError.errorCodeToDesc(requestId, '500', "updateperiod"))
        });

    })
}

module.exports = updatePeriod;
