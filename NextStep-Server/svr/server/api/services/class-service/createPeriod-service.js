var co = require('co');
var path = require('path');
var appRoot = path.join(require('app-root-dir').get(), '/server/');
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));
let moment = require('moment');
var schema = require("schemajs");
var _ = require("lodash");
const { resolve } = require('path');
var logger = getLogger('createPeriod-Service');
const Period = require(path.join(appRoot, 'api/models/Period'));
const PeriodIndex = require(path.join(appRoot, 'api/models/PeriodIndex'));




function createPeriod(param) {
    this.params = {};
    this.requestPayload = param.requestPayload; //input payload
    this.requestId = param.requestId;
    this.periodindex = param.periodindex;
    this.sortedIndex = typeof param.sortedIndex!=='undefined' && param.sortedIndex.length>0?param.sortedIndex:[];
}

createPeriod.prototype.validateInputPayload = function () {
    var self = this;
    var error = {};

    if (logLevel === "DEBUG")
        logger.debug("requestId :: " + self.requestId + ":: validateInputPayloadwithPromise :: Called");
    var model = schema.create({
        class: {
            type: "string",
            filters: "trim",
            required: true
        },
        subject: {
            type: "string",
            filters: "trim",
            required: true
        },
        section: {
            type: "string",
            filters: "trim",
            required: true
        },
        semester: {
            type: "string",
            filters: "trim",
            required: true
        },
        days: {
            type: Array,
            filters: "trim",
            required: true
        },
        starttime: {
            type: "string",
            filters: "trim",
            required: true
        },
        endtime: {
            type: "string",
            filters: "trim",
            required: true
        },
        startDate: {
            type: "string",
            filters: "trim",
            required: true
        },
        endDate: {
            type: "string",
            filters: "trim",
            required: true
        },
        mainteacher: {
            type: "string",
            filters: "trim",
            required: true
        },
        substituteteacher: {
            type: "string",
            filters: "trim",
            required: false
        },
        mainteacherindex: {
            type: "string",
            filters: "trim",
            required: true
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
        record: {
            type: "string",
            filters: "trim",
            required: false
        }
    });
    return new Promise(function (resolve, reject) {

       // var startDate = moment(self.requestPayload.startDate + "T00:00:00", "DD/MM/YYYYT00:00:00").format("DD/MM/YYYYT00:00:00");
      //  var endDate = moment(self.requestPayload.endDate + "T00:00:00", "DD/MM/YYYYT00:00:00").format("DD/MM/YYYYT00:00:00");

        var startDate = moment(self.requestPayload.startDate + "T00:00:00", "MM/DD/YYYYT00:00:00").format("MM/DD/YYYYT00:00:00");
        var endDate = moment(self.requestPayload.endDate + "T00:00:00", "MM/DD/YYYYT00:00:00").format("MM/DD/YYYYT00:00:00");
        

        var form = model.validate({
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
            clouddrive: self.requestPayload.clouddrive,
            mainteacherindex: self.requestPayload.mainteacherid
        });

        if (logLevel === "INFO") {
            logger.info("requestId :: " + self.requestId + ":: FORM -" + JSON.stringify(form));
            logger.info("requestId :: " + self.requestId + ":: validateInputPayloadwithPromise :: Returning -" + form.valid);
        }
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + self.requestId + ":: validateInputPayloadwithPromise:: Form -" + form.valid)
        if (form.valid) {

            logger.debug("requestId :: " + self.requestId + ":: validateInputPayloadwithPromise:: Start Date Converted is -" + startDate);
            logger.debug("requestId :: " + self.requestId + ":: validateInputPayloadwithPromise:: End Date Converted is -" + endDate);

            logger.debug("requestId :: " + self.requestId + ":: validateInputPayloadwithPromise:: System Date time is -" + moment().format("DD/MM/YYYYT00:00:00"));

            let startDate1 = moment(new Date(self.requestPayload.startDate), 'ddd MMM D YYYY HH:mm:ss ZZ') 
            let endDate1 = moment(new Date(self.requestPayload.endDate), 'ddd MMM D YYYY HH:mm:ss ZZ')

            logger.debug("requestId :: " + self.requestId + ":: validateInputPayloadwithPromise :: Start Date  is -" + startDate1.toDate());
            logger.debug("requestId :: " + self.requestId + ":: validateInputPayloadwithPromise :: End Date  is -" + endDate1.toDate());

            var difference = endDate1.diff(startDate1, 'days');


            /*if (startDate < moment().format("MM/DD/YYYYT00:00:00")) {
                logger.debug("requestId :: " + self.requestId + ":: validateInputPayloadwithPromise:: Start Date Validtion Error ")
                reject(mapError.errorCodeToDesc(self.requestId, '401', "createperiod"))
            } else */if(difference<0){//(endDate < moment().format("MM/DD/YYYYT00:00:00")) {
                logger.debug("requestId :: " + self.requestId + ":: validateInputPayloadwithPromise:: End Date Validation Error ")
                reject(mapError.errorCodeToDesc(self.requestId, '402', "createperiod"))
            }
            else {
                if (logLevel === "DEBUG")
                    logger.debug("requestId :: " + self.requestId + ":: validateInputPayloadwithPromise:: Dates passed is valid ");
                resolve(true);
            }

        } else {

            logger.error("requestId :: " + self.requestId + ":: validateInputPayloadwithPromise:: Schema Validation Failed -" + JSON.stringify(error))
            reject(mapError.errorCodeToDesc(self.requestId, '403', "createperiod"))
        }
        /* } catch (err) {
             logger.error("error in validation:" + err + " and JSON error format is :" + JSON.stringify(err));
             reject(mapError.errorCodeToDesc(self.requestId, '403', "createperiod"))
         }*/
    });

}




createPeriod.prototype.createindexclass = function () {
    var self = this;

    return new Promise(function (resolve, reject) {

        estId = self.requestId;
        logger.debug("requestId :: " + self.requestId + ":: createindexclass :: Payload is  -" + JSON.stringify(self.requestPayload));

        let startDate = moment(new Date(self.requestPayload.startDate+'T'+self.requestPayload.starttime+':00'), 'ddd MMM D YYYY HH:mm:ss ZZ') // format will return a string
        let endDate = moment(new Date(self.requestPayload.endDate+'T'+self.requestPayload.endtime+':00'), 'ddd MMM D YYYY HH:mm:ss ZZ')

        logger.debug("requestId :: " + self.requestId + ":: createindexclass :: Start Date  is - " + startDate);
        logger.debug("requestId :: " + self.requestId + ":: createindexclass :: End Date  is - " + endDate);

        var numPeriod = endDate.diff(startDate, 'days');
        logger.debug("requestId :: " + self.requestId + ":: createindexclass :: Periods creating for days -" + ++numPeriod);
        let _periodIndex = {};

        //Indexign the days array
        let days=[];
        if(numPeriod==0){
            logger.debug("requestId :: " + self.requestId + ":: createindexclass :: Passed Single day is -",self.requestPayload.days);
              var weekday = new Array(7);
                weekday[0] = "Sunday";
                weekday[1] = "Monday";
                weekday[2] = "Tuesday";
                weekday[3] = "Wednesday";
                weekday[4] = "Thursday";
                weekday[5] = "Friday";
                weekday[6] = "Saturday";
            days.push(weekday[startDate.toDate().getDay()]);
            self.requestPayload.days=weekday[startDate.toDate().getDay()];
            logger.debug("requestId :: " + self.requestId + ":: createindexclass :: Extracting the exact day based on date - ",days);

        }
        else{
            logger.debug("requestId :: " + self.requestId + ":: createindexclass :: Days passed for creation - ",self.requestPayload.days);
            days = self.requestPayload.days
        }
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
        self.sortedIndex = indexarr.sort(function (a, b) { return a - b });

        logger.debug("requestId :: " + self.requestId + ":: createindexclass :: Periods Days original -" + days)
        logger.debug("requestId :: " + self.requestId + ":: createindexclass :: Periods Days Index Array -" + self.sortedIndex);

        //End of Indexing


        _periodIndex = new PeriodIndex({
            "class": self.requestPayload.class,
            "subject": self.requestPayload.subject,
            "section": self.requestPayload.section,
            "semester": self.requestPayload.semester,
            "days": self.requestPayload.days,
            "starttime": self.requestPayload.starttime,
            "endtime": self.requestPayload.endtime,
            "startdate": startDate.toDate(),
            "enddate": endDate.toDate(),
            "mainteacher": self.requestPayload.mainteacher,
            "substituteteacher": typeof self.requestPayload.substituteteacher != "undefined" && self.requestPayload.substituteteacher.length > 0 ? self.requestPayload.substituteteacher : "",
            "perioduniqueindex": self.requestPayload.class + self.requestPayload.section + self.requestPayload.subject,
            "mainteacherindex": self.requestPayload.mainteacherid,
            "substituteteacherindex": typeof self.requestPayload.substituteteacherindex != "undefined" && self.requestPayload.substituteteacherindex.length > 0 ? self.requestPayload.substituteteacherindex : "",
            "active":true,
            "clouddrive":self.requestPayload.clouddrive

        });

        try {
            _periodIndex.save(function (err, period) {
                if (err) {
                    logger.debug("requestId :: " + self.requestId + ":: createindexclass :: Rejecting  Creation of Period  -" + err);
                    reject(mapError.errorCodeToDesc(self.requestId, '501', "createperiod"));
                } else {
                    self.periodindex = period._id;
                    logger.debug("requestId :: " + self.requestId + ":: createindexclass :: Resolving Creation of Period  -" + period);
                    resolve(period);
                }
            })
        } catch (err) {
            logger.error("requestId :: " + self.requestId + ":: create :: ERROR - " + err);
            reject(mapError.errorCodeToDesc(self.requestId, '501', "createperiod"));
        }
    })
}

createPeriod.prototype.create = function () {
    var self = this;
    return new Promise(function (resolve, reject) {

        var requestId = self.requestId;
        logger.debug("requestId :: " + self.requestId + ":: create :: Payload is  -" + JSON.stringify(self.requestPayload));


        let startDate = moment(new Date(self.requestPayload.startDate), 'ddd MMM D YYYY HH:mm:ss ZZ') // format will return a string
        let endDate = moment(new Date(self.requestPayload.endDate), 'ddd MMM D YYYY HH:mm:ss ZZ')

        var numPeriod = endDate.diff(startDate, 'days');

        startDate = moment(new Date(self.requestPayload.startDate+'T'+self.requestPayload.starttime+':00'), 'ddd MMM D YYYY HH:mm:ss ZZ') // format will return a string
        endDate = moment(new Date(self.requestPayload.endDate+'T'+self.requestPayload.endtime+':00'), 'ddd MMM D YYYY HH:mm:ss ZZ')
        let classEndDate = moment(new Date(self.requestPayload.startDate+'T'+self.requestPayload.endtime+':00'), 'ddd MMM D YYYY HH:mm:ss ZZ')


        logger.debug("requestId :: " + self.requestId + ":: create :: Start Date  is -" + startDate.format("DD/MM/YYYYT00:00:00"));
        logger.debug("requestId :: " + self.requestId + ":: create :: End Date  is -" + endDate.format("DD/MM/YYYYT00:00:00"));

        logger.debug("requestId :: " + self.requestId + ":: create :: Periods creating for period index -" + self.periodindex);

        var periodstocreate = [];
        let dailyStartEndDate = startDate;
        let createdPeriodIndex = 0;
        let _period = {};

        //Creating a single class , quick workaround

        if(numPeriod==0){
            logger.debug("requestId :: " + self.requestId + ":: create :: Periods creating for days -",numPeriod++);

            createdPeriodIndex++;
            _period = new Period({
                "class": self.requestPayload.class,
                "subject": self.requestPayload.subject,
                "section": self.requestPayload.section,
                "semester":self.requestPayload.semester,
                // "days": self.requestPayload.days,
                "starttime": self.requestPayload.starttime,
                "endtime": self.requestPayload.endtime,
                "startdate": startDate.toDate(),
                "enddate": classEndDate.toDate(),
                "mainteacher":self.requestPayload.mainteacherid,
                "substituteteacher": self.requestPayload.mainteacher, //Using this key as the main teacher name key was not defined in the Model
                "periodindex": self.periodindex
            });
            periodstocreate.push(_period.save(function (err, period) {
                if (err) {
                    return err;
                }
                return period;
            }))

        }

        //Creatign a range of classes
        numPeriod=numPeriod+1;
        logger.debug("requestId :: " + self.requestId + ":: create :: Periods creating for days -",numPeriod);

        for (var i = 0; i < numPeriod; i++) {
            if(i==0){ //to ensure the first day qualifies
                startDate = startDate.add(0, 'days');
                classEndDate=classEndDate.add(0, 'days');
                logger.debug("requestId :: " + self.requestId + ":: Index - ["+ i +"] :: Start Date is  -" + startDate + "and day is - "+startDate.day());
                logger.debug("requestId :: " + self.requestId + ":: Index - ["+ i +"] :: End Date is  -" + classEndDate + "and day is - "+classEndDate.day());
            }else{
                startDate = startDate.add(1, 'days');
                classEndDate=classEndDate.add(1, 'days');
                logger.debug("requestId :: " + self.requestId + ":: Index - ["+ i +"] :: Start Date is  -" + startDate + "and day is - "+startDate.day());
                logger.debug("requestId :: " + self.requestId + ":: Index - ["+ i +"] :: End Date is  -" + classEndDate + "and day is - "+classEndDate.day());
            }
            if (self.sortedIndex.indexOf(startDate.day()) === -1) {
                logger.debug("requestId :: " + self.requestId + ":: create :: " + startDate.day() + " Day of week dont qualify for period creation , valid days -" + self.requestPayload.days);
                continue;
            }
            createdPeriodIndex++;
            _period = new Period({
                "class": self.requestPayload.class,
                "subject": self.requestPayload.subject,
                "section": self.requestPayload.section,
                "semester":self.requestPayload.semester,
                // "days": self.requestPayload.days,
                "starttime": self.requestPayload.starttime,
                "endtime": self.requestPayload.endtime,
                "startdate": startDate.toDate(),
                "enddate": classEndDate.toDate(),
                //   "mainteacher": self.requestPayload.mainteacher,
                //   "substituteteacher": self.requestPayload.substituteteacher,
                "periodindex": self.periodindex
            });

            periodstocreate.push(_period.save(function (err, period) {
                if (err) {
                    return err;
                }
                return period;
            }))
        }
        //logger.debug("requestId :: " + self.requestId + ":: create :: Periods  -" + JSON.stringify(_period));

        try {
            var createPeriod_ = periodstocreate
            logger.debug("requestId :: " + self.requestId + ":: create :: Resolving Creation of Period  -" + createPeriod_);
            var response = {
                "code": "200-CRP-001",
                "desc": createdPeriodIndex + " Periods Created",
                "totalCreated": createdPeriodIndex
            }
            resolve(response);
        } catch (err) {
            logger.error("requestId :: " + self.requestId + ":: create :: ERROR - " + err);
            reject(mapError.errorCodeToDesc(self.requestId, '501', "createperiod"));
        }
    })
}



createPeriod.prototype.deleteIndexClass = function () {
    var self = this;
    var logger = getLogger('deleteIndexClass');
    //console.log("Delete called")
    var requestId = self.requestId;
    return new Promise(function (resolve, reject) {

        let deletequeryPayload = { "_id": self.periodindex };

        logger.debug("requestId :: " + requestId + " :: Delete payload for deleteIndexClass is -",deletequeryPayload);
        PeriodIndex.deleteOne(deletequeryPayload, (err, deletedrecord) => {
                if (err){
                    reject(err);
                }else {
                    logger.debug("requestId :: " + requestId + " :: Deleted  Index period -",deletedrecord);
                    resolve(deletedrecord)
                }
            }
        );

    }).catch((error) => {
        logger.error("requestId :: " + requestId + " :: deleteIndexClass find and update Exception -" + error);
        reject(mapError.errorCodeToDesc(requestId, '500', "sendnotification"))
    });

}


module.exports = createPeriod;
