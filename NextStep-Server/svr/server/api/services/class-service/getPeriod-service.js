var co = require('co');
var path = require('path');
var appRoot = path.join(require('app-root-dir').get(), '/server/');
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));
const { resolve } = require('path');
var logger = getLogger('getPeriod-Service');
const Period = require(path.join(appRoot, 'api/models/Period'));
const PeriodIndex = require(path.join(appRoot, 'api/models/PeriodIndex'));
const async = require('async');
const User = require(path.join(appRoot, 'api/models/User'));
const Subject = require(path.join(appRoot, 'api/models/Subject'));
const Section = require(path.join(appRoot, 'api/models/Section'));
const Semester = require(path.join(appRoot, 'api/models/semester'));
const Grade = require(path.join(appRoot, 'api/models/Grade'));


let moment = require('moment');

let subjectmap = new Map();
let sectionmap = new Map();
let semestermap = new Map();
let grademap = new Map();

function getPeriod(param) {
    this.params = {};
    this.requestPayload = param.requestPayload; //input payload
    this.ismobile = param.ismobile;
    this.requestId = param.requestId;
    this.token = param.token;

    logger.debug("requestId :: " + this.requestId + ":: getPeriod  Object -" + JSON.stringify(this));

}

getPeriod.prototype.getindexclass = function () {
    var self = this;
    let requestId = self.requestId;
    let count=1;
    return new Promise(function (resolve, reject) {
        //var queryPayload = { "mainteacherindex": self.requestPayload };

        var queryPayload = {};
        queryPayload["$and"] = [];
        queryPayload["$and"].push({ "mainteacherindex": self.requestPayload });
        queryPayload["$and"].push({ 'active': true });

        PeriodIndex.find(queryPayload, (err, periodIndex) => {
            let indexperiodmodified = []
            if (!periodIndex) {
                logger.debug("requestId :: " + self.requestId + ":: No teacher found with provided index  -" + self.requestPayload);
                reject(mapError.errorCodeToDesc(self.requestId, '204', "getperiods"))
            } else {
                if (periodIndex.length < 1) {
                    reject(mapError.errorCodeToDesc(self.requestId, '204', "getperiods"))
                } else {
                    let subjectfetched = false;
                    let sectionfetched = false;
                    let semesterfetched = false;
                    let gradefetched = false;
                    periodIndex.forEach(function (periodIndexObj) {
                        async.waterfall([
                            function fetchSubjectName(done) {
                                logger.debug("requestId :: " + self.requestId + ":: Fetching the class names for periodIndexObj -",JSON.stringify(periodIndexObj));
        
                                    periodIndexObj.subject_name = {}
                                    periodIndexObj.subject_name = mapper.subjectmap.get(periodIndexObj.subject)
                                    logger.debug("requestId :: " + requestId + ":: Subject name found after fetching class name from prefilled map - " + periodIndexObj.subject_name);
                                    logger.debug("requestId :: " + requestId + ":: Subject name inserted in the Object else part - ", periodIndexObj);
                                    done(null, true)
                            },
                            function fetchSectionName(status_1, done) {
                                const logger = getLogger('getSection');
                                logger.debug("requestId :: " + requestId + ":: In Stage 2 , fetch section is - ", status_1);
                                    periodIndexObj.section_name = {}
                                    periodIndexObj.section_name = mapper.sectionmap.get(periodIndexObj.section)
                                    logger.debug("requestId :: " + requestId + ":: Section name found after fetching class name from prefilled map - " + periodIndexObj.section_name);
                                    logger.debug("requestId :: " + requestId + ":: Section name inserted in the Object else part - ", periodIndexObj);
                                    done(null, true)
                            },
                            function fetchSemesterName(status_2, done) {
                                const logger = getLogger('getsemester');
                                logger.debug("requestId :: " + requestId + ":: In Stage 3 , fetch semester is - ", status_2);
                                    periodIndexObj.semester_name = {}
                                    periodIndexObj.semester_name = mapper.semestermap.get(periodIndexObj.semester)
                                    logger.debug("requestId :: " + requestId + ":: Semester name found after fetching class name from prefilled map - " + periodIndexObj.semester_name);
                                    logger.debug("requestId :: " + requestId + ":: Semester name inserted in the Object else part - ", periodIndexObj);
                                    done(null, true)
                            },
                            function fetchClassName(status_3, done) {
                                logger.debug("requestId :: " + self.requestId + ":: In Stage 4, fetch class is - ", status_3);
                                    periodIndexObj.class_name = {}
                                    periodIndexObj.class_name = mapper.grademap.get(periodIndexObj.class)
                                    logger.debug("requestId :: " + requestId + ":: Grade name found after fetching class name from prefilled map - " + periodIndexObj.class_name);
                                    logger.debug("requestId :: " + requestId + ":: grade name inserted in the Object if part - ", periodIndexObj);
                                    done(null, true)
                            },
                            function formnewperiodarray(status_4, done) {
                                logger.debug("requestId :: " + requestId + ":: In Stage 5, formnewperiodarray is - ", status_4);
                                logger.debug("requestId :: " + requestId + ":: Modified periodIndexObj is    -", periodIndexObj);
                                //Filling the teacher name from the Map
                                periodIndexObj.mainteacher=mapper.teachermap.get(periodIndexObj.mainteacherindex);
                                indexperiodmodified.push(periodIndexObj);
                                if(count==periodIndex.length){
                                    self.periodIndex_ = indexperiodmodified;
                                    logger.debug("requestId :: " + requestId + ":: Going to assign to self.periodIndex_ - ", indexperiodmodified);
                                    logger.debug("requestId :: " + self.requestId + ":: All the periods for the teacher   -" + self.periodIndex_.length);
                                    resolve(indexperiodmodified)
                                }else{count++}
                            },
                        ], (err) => {
                            if (err) {
                                logger.error("requestId :: " + self.requestId + " :: getperiods Controller Async Waterfall Error is -" + err);
                                reject(mapError.errorCodeToDesc(self.requestId, '502', "getperiods"))
                            }
                        }); // End of Async waterfall
                    }) // End of For Each
                    // self.periodIndex_ = periodIndex old way of doing
                }
            }
        }).catch((error) => {
            logger.error("requestId :: " + self.requestId + " :: getperiods find Exception -" + error);
            reject(mapError.errorCodeToDesc(self.requestId, '500', "getperiods"))
        });
    })
}


getPeriod.prototype.getindexclassforadmin = function () {
    var self = this;
    let requestId=self.requestId;
    let indexperiodmodified = []
    let count=1;

    return new Promise(function (resolve, reject) {
        var queryPayload = {};
        PeriodIndex.find(queryPayload, { _id: 1, record: 1, days: 1, class: 1, subject: 1, section: 1, semester: 1, starttime: 1, endtime: 1, startdate: 1, enddate: 1, mainteacher: 1, mainteacherindex: 1, active: 1,clouddrive: 1 }, (err, periodIndex) => {
            if (!periodIndex) {
                logger.debug("requestId :: " + self.requestId + ":: No index period ");
                reject(mapError.errorCodeToDesc(self.requestId, '204', "getperiods"));
            } else {
                if (periodIndex.length < 1) {
                    reject(mapError.errorCodeToDesc(self.requestId, '204', "getperiods"))
                } else {
                        periodIndex.forEach(function (periodIndexObj) {
                            async.waterfall([
                                function fetchSubjectName(done) {
                                    logger.debug("requestId :: " + self.requestId + ":: Fetching the class names");
                                        periodIndexObj.subject_name = {}
                                        periodIndexObj.subject_name = mapper.subjectmap.get(periodIndexObj.subject)
                                        logger.debug("requestId :: " + requestId + ":: Subject name found after fetching class name from prefilled map - " + periodIndexObj.subject_name);
                                        logger.debug("requestId :: " + requestId + ":: Subject name inserted in the Object else part - ", periodIndexObj);    
                                        done(null, true)
                                },
                                function fetchSectionName(status_1, done) {
                                    const logger = getLogger('getSection');
                                    logger.debug("requestId :: " + requestId + ":: In Stage 2 , fetch section is - ", status_1);
                                        periodIndexObj.section_name = {}
                                        periodIndexObj.section_name = mapper.sectionmap.get(periodIndexObj.section)
                                        logger.debug("requestId :: " + requestId + ":: Section name found after fetching class name from prefilled map - " + periodIndexObj.section_name);
                                        logger.debug("requestId :: " + requestId + ":: Section name inserted in the Object else part - ", periodIndexObj);
                                        done(null, true)
                                    },
                                function fetchSemesterName(status_2, done) {
                                    const logger = getLogger('getsemester');
                                    logger.debug("requestId :: " + requestId + ":: In Stage 3 , fetch semester is - ", status_2);
                                        periodIndexObj.semester_name = {}
                                        periodIndexObj.semester_name = mapper.semestermap.get(periodIndexObj.semester)
                                        logger.debug("requestId :: " + requestId + ":: Semester name found after fetching class name from prefilled map - " + periodIndexObj.semester_name);
                                        logger.debug("requestId :: " + requestId + ":: Semester name inserted in the Object else part - ", periodIndexObj);
    
                                        done(null, true)
                                },
                                function fetchClassName(status_3, done) {
                                    logger.debug("requestId :: " + self.requestId + ":: In Stage 4, fetch class is - ", status_3);
                                        periodIndexObj.class_name = {}
                                        periodIndexObj.class_name = mapper.grademap.get(periodIndexObj.class)
                                        logger.debug("requestId :: " + requestId + ":: Grade name found after fetching class name from prefilled map - " + periodIndexObj.class_name);
                                        logger.debug("requestId :: " + requestId + ":: grade name inserted in the Object if part - ", periodIndexObj);  
                                        done(null, true)
                                },
                                function formnewperiodarray(status_4, done) {
                                    logger.debug("requestId :: " + requestId + ":: In Stage 5, formnewperiodarray is - ", status_4);
                                    logger.debug("requestId :: " + requestId + ":: Modified periodIndexObj is    -", periodIndexObj);
                                    //Filling the teacher name from the Map
                                    periodIndexObj.mainteacher=mapper.teachermap.get(periodIndexObj.mainteacherindex);
                                    indexperiodmodified.push(periodIndexObj);
                                    if(count==periodIndex.length){
                                        self.periodIndex_ = indexperiodmodified;
                                        logger.debug("requestId :: " + requestId + ":: Going to assign to self.periodIndex_ - ", indexperiodmodified);
                                        logger.debug("requestId :: " + self.requestId + ":: All the periods for the teacher   -" + self.periodIndex_.length);
                                        resolve(indexperiodmodified)
                                    }else{count++}
    
                                },
                            ], (err) => {
                                if (err) {
                                    logger.error("requestId :: " + self.requestId + " :: getperiods Controller Async Waterfall Error is -" + err);
                                    reject(mapError.errorCodeToDesc(self.requestId, '502', "getperiods"))
                                }
                            }); // End of Async waterfall
                        }) // End of For Each
                        // self.periodIndex_ = periodIndex old way of doing
                    }//End of Else
                }
        }).catch((error) => {
            logger.error("requestId :: " + self.requestId + " :: getperiods find Exception -" + error);
            reject(mapError.errorCodeToDesc(self.requestId, '500', "getperiods"))
        });
    })
}

getPeriod.prototype.getindexclassforstudent = function () {
    var self = this;
    let requestId=self.requestId;
    let indexperiodmodified = []
    let count=1;


    logger.debug("requestId :: " + self.requestId + ":: getindexclassforstudent  self is -" + JSON.stringify(self));

    return new Promise(function (resolve, reject) {
        var queryPayload = {};
        queryPayload["$and"] = [];
        queryPayload["$and"].push({ "token.token": self.token });
        queryPayload["$and"].push({ "category.categoryType": 'S' });
        // queryPayload["$or"].push({ "category.categoryType": 'T' });


        logger.debug("requestId :: " + self.requestId + ":: getindexclassforstudent  queryPayload is -" + JSON.stringify(queryPayload));

        User.findOne(queryPayload, (err, user) => {
            if (err) {
                logger.debug("requestId :: " + self.requestId + ":: getindexclassforstudent  error while finding matching profile -" + err);
                reject(mapError.errorCodeToDesc(self.requestId, '500', "studentclass"))
            }
            if (!user) {
                logger.debug("requestId :: " + self.requestId + ":: getindexclassforstudent  no user found ");
                reject(mapError.errorCodeToDesc(self.requestId, '204', "studentclass"))
            } else {
                logger.debug("requestId :: " + self.requestId + ":: getindexclassforstudent  user object returned is -" + JSON.stringify(user._id));

                var periodqueryPayload = {};
                periodqueryPayload["$and"] = [];
                periodqueryPayload["$and"].push({ "class": user.profile.class[0].classid });
                periodqueryPayload["$and"].push({ "section": user.profile.class[0].section });
                periodqueryPayload["$and"].push({ "semester": user.profile.class[0].semester });
                periodqueryPayload["$and"].push({ "active": true });



                logger.debug("requestId :: " + self.requestId + ":: getindexclassforstudent  periodqueryPayload is -" + JSON.stringify(periodqueryPayload));

                PeriodIndex.find(periodqueryPayload, { _id: 1, record: 1, days: 1, class: 1, subject: 1, section: 1, semester: 1, starttime: 1, endtime: 1, startdate: 1, enddate: 1, mainteacher: 1, mainteacherindex: 1 , clouddrive:1}, (err, periodIndex) => {
                    if (!periodIndex) {
                        logger.debug("requestId :: " + self.requestId + ":: No index period ");
                        reject(mapError.errorCodeToDesc(self.requestId, '204', "getperiods"))
                    } else {
                        if (periodIndex.length < 1) {
                            reject(mapError.errorCodeToDesc(self.requestId, '204', "getperiods"))
                        } else {
                            if (periodIndex.length < 1) {
                                reject(mapError.errorCodeToDesc(self.requestId, '204', "getperiods"))
                            } else {
                                let subjectfetched = false;
                                let sectionfetched = false;
                                let semesterfetched = false;
                                let gradefetched = false;
                                periodIndex.forEach(function (periodIndexObj) {
                                    async.waterfall([
                                        function fetchSubjectName(done) {
                                            logger.debug("requestId :: " + self.requestId + ":: Fetching the class names");
                                                periodIndexObj.subject_name = {}
                                                periodIndexObj.subject_name = mapper.subjectmap.get(periodIndexObj.subject)
                                                logger.debug("requestId :: " + requestId + ":: Subject name found after fetching class name from prefilled map - " + periodIndexObj.subject_name);
                                                logger.debug("requestId :: " + requestId + ":: Subject name inserted in the Object else part - ", periodIndexObj);            
                                                done(null, true)
                                        },
                                        function fetchSectionName(status_1, done) {
                                            const logger = getLogger('getSection');
                                            logger.debug("requestId :: " + requestId + ":: In Stage 2 , fetch section is - ", status_1);

                                                periodIndexObj.section_name = {}
                                                periodIndexObj.section_name = mapper.sectionmap.get(periodIndexObj.section)
                                                logger.debug("requestId :: " + requestId + ":: Section name found after fetching class name from prefilled map - " + periodIndexObj.section_name);
                                                logger.debug("requestId :: " + requestId + ":: Section name inserted in the Object else part - ", periodIndexObj);
                                                done(null, true)
                                        },
                                        function fetchSemesterName(status_2, done) {
                                            const logger = getLogger('getsemester');
                                            logger.debug("requestId :: " + requestId + ":: In Stage 3 , fetch semester is - ", status_2);
                                                periodIndexObj.semester_name = {}
                                                periodIndexObj.semester_name = mapper.semestermap.get(periodIndexObj.semester)
                                                logger.debug("requestId :: " + requestId + ":: Semester name found after fetching class name from prefilled map - " + periodIndexObj.semester_name);
                                                logger.debug("requestId :: " + requestId + ":: Semester name inserted in the Object else part - ", periodIndexObj);           
                                                done(null, true)
                                        },
                                        function fetchClassName(status_3, done) {
                                            logger.debug("requestId :: " + self.requestId + ":: In Stage 4, fetch class is - ", status_3);
                                                periodIndexObj.class_name = {}
                                                periodIndexObj.class_name = mapper.grademap.get(periodIndexObj.class)
                                                logger.debug("requestId :: " + requestId + ":: Grade name found after fetching class name from prefilled map - " + periodIndexObj.class_name);
                                                logger.debug("requestId :: " + requestId + ":: grade name inserted in the Object if part - ", periodIndexObj);            
                                                done(null, true)
                                        },
                                        function formnewperiodarray(status_4, done) {
                                            logger.debug("requestId :: " + requestId + ":: In Stage 5, formnewperiodarray is - ", status_4);
                                            logger.debug("requestId :: " + requestId + ":: Modified periodIndexObj is    -", periodIndexObj);
                                            //Filling the teacher name from the Map
                                            periodIndexObj.mainteacher=mapper.teachermap.get(periodIndexObj.mainteacherindex);
                                            indexperiodmodified.push(periodIndexObj);
                                            if(count==periodIndex.length){
                                                self.periodIndex_ = indexperiodmodified;
                                                logger.debug("requestId :: " + requestId + ":: Going to assign to self.periodIndex_ - ", indexperiodmodified);
                                                logger.debug("requestId :: " + self.requestId + ":: All the periods for the teacher   -" + self.periodIndex_.length);
                                                resolve(indexperiodmodified)
                                            }else{count++}
            
                                        },
                                    ], (err) => {
                                        if (err) {
                                            logger.error("requestId :: " + self.requestId + " :: getperiods Controller Async Waterfall Error is -" + err);
                                            reject(mapError.errorCodeToDesc(self.requestId, '502', "getperiods"))
                                        }
                                    }); // End of Async waterfall
                                }) // End of For Each
                                // self.periodIndex_ = periodIndex old way of doing
                            }
                        }
                    }
                }).catch((error) => {
                    logger.error("requestId :: " + self.requestId + " :: getindexclassforstudent find Exception -" + error);
                    reject(mapError.errorCodeToDesc(self.requestId, '500', "getperiods"))
                });
            }

        });
    })
}


getPeriod.prototype.getall = function (initiatedby) {
    var self = this;
    let requestId=self.requestId;
    let indexperiodmodified = []
    let count=1;

    return new Promise(function (resolve, reject) {
        var periodmap = [];

        var counter = 0;
        logger.debug("requestId :: " + self.requestId + ":: Get All Periods self.periodIndex_ -",self.periodIndex_);


        self.periodIndex_.forEach(function (periodIndexObj) {
            async.waterfall([
                function fetchPeriodIndex(done) {
                    logger.debug("requestId :: " + self.requestId + ":: Iterating the period Index -" + periodIndexObj);

                    var periodarr = [];
                    var periodindex = {};
                    periodindex.uniqueperiodid = periodIndexObj._id,
                        periodindex.teacher = mapper.teachermap.get(periodIndexObj.mainteacherindex),
                        periodindex.uniqueteacherid = periodIndexObj.mainteacherindex,
                        periodindex.startdate = periodIndexObj.startdate,
                        periodindex.enddate = periodIndexObj.enddate,
                        periodindex.starttime = periodIndexObj.starttime,
                        periodindex.endtime = periodIndexObj.endtime,
                        periodindex.days = periodIndexObj.days,
                        periodindex.class = periodIndexObj.class,
                        periodindex.section = periodIndexObj.section,
                        periodindex.semester = periodIndexObj.semester,
                        periodindex.subject = periodIndexObj.subject,

                        periodindex.class_name = periodIndexObj.class_name,
                        periodindex.section_name = periodIndexObj.section_name,
                        periodindex.semester_name = periodIndexObj.semester_name,
                        periodindex.subject_name = periodIndexObj.subject_name,
                        periodindex.clouddrive = periodIndexObj.clouddrive,
                      

                        periodarr.push(periodindex);
                    done(null, periodIndexObj, periodarr)

                },
                function fetchPeriods(periodIndexObj, periodarr, done) {
                    queryPayload = { "periodindex": periodIndexObj._id };
                    Period.find(queryPayload, (err, allperiod) => {
                        counter++;
                        if (!allperiod) {
                            logger.debug("requestId :: " + self.requestId + ":: No Periods Created resolving -" + JSON.stringify(periodarr));
                            resolve(periodarr)
                        } else {
                            logger.debug("requestId :: " + self.requestId + ":: All period length is   -" + allperiod.length);
                            allperiod.forEach(function (periodObj) {
                                var period_ = {};
                                var docarr = []
                                var assignmentarr = []
                                logger.debug("requestId :: " + self.requestId + ":: Initiated by -" + initiatedby);

                                for (var i = 0; i < periodObj.record.documents.length; i++) {
                                    if (initiatedby == 2 && periodObj.record.documents[i].sharable == false)
                                        continue;
                                    docarr.push({
                                        "id": periodObj.record.documents[i].uploadref,
                                        "filename": periodObj.record.documents[i].file,
                                        "type": periodObj.record.documents[i].mimetype,
                                        "path": periodObj.record.documents[i].path,
                                        "title": periodObj.record.documents[i].title,
                                        "note": periodObj.record.documents[i].note
                                    })
                                }
                                for (var i = 0; i < periodObj.record.assignment.length; i++) {
                                    /* if(initiatedby==2 && periodObj.record.assignment[i].sharable==false)
                                          continue;
                                      assignmentarr.push({
                                          "id": periodObj.record.assignment[i].uploadref,
                                          "filename": periodObj.record.assignment[i].file,
                                          "type": typeof periodObj.record.assignment[i].mimetype != null ? periodObj.record.assignment[i].mimetype : "text",
                                          "path": periodObj.record.assignment[i].path,
                                          "title": periodObj.record.assignment[i].title,
                                          "note": periodObj.record.assignment[i].note,
                                          "submittedby":periodObj.record.assignment[i].submittedby
                                      })*/

                                    if (initiatedby == 2 && periodObj.record.assignment[i].sharable == false)
                                        continue;
                                    let asignmentobj = {
                                        "id": periodObj.record.assignment[i].uploadref,
                                        "filename": periodObj.record.assignment[i].file,
                                        "type": typeof periodObj.record.assignment[i].mimetype != null ? periodObj.record.assignment[i].mimetype : "text",
                                        "path": periodObj.record.assignment[i].path,
                                        "title": periodObj.record.assignment[i].title,
                                        "note": periodObj.record.assignment[i].note,
                                        "validupto": periodObj.record.assignment[i].validupto,
                                    }
                                    if (initiatedby != 2)
                                        asignmentobj.submittedby = periodObj.record.assignment[i].submittedby
                                    assignmentarr.push(asignmentobj)
                                }
                                period_.uniqueperiodid = periodObj._id,
                                    period_.teacher = mapper.teachermap.get(periodObj.mainteacher)
                                    period_.uniqueteacherid = periodObj.mainteacherindex,
                                    period_.startdate = periodObj.startdate,
                                    period_.enddate = periodObj.enddate,
                                    period_.starttime = periodObj.starttime,
                                    period_.endtime = periodObj.endtime,
                                    period_.documents = docarr
                                period_.weblink = periodObj.record.weblink
                                period_.assignments = assignmentarr

                                //period_.days=periodObj.days,
                                // period_.record = periodObj.record
                                // logger.debug("requestId :: " + self.requestId + ":: Pushing period_  -" + JSON.stringify(period_));
                                if (self.ismobile === false) {
                                    logger.debug("requestId :: " + self.requestId + ":: Pushing class  as called from web-" + JSON.stringify(period_));
                                    periodarr.push(period_);
                                } else {

                                    // logger.debug("requestId :: " + self.requestId + ":: Filtering before pushing class, as called from mobile-" + JSON.stringify(period_));
                                    //   logger.debug("requestId :: " + self.requestId + ":: Comparing with Start Date -" + moment().format("YYYY-MM-DDT00:00:00"));
                                    //    logger.debug("requestId :: " + self.requestId + ":: Comparing with End Date -" + moment().add(7, 'days').format("YYYY-MM-DDT00:00:00"));
                                    var classdate = moment(period_.startdate).format("YYYY-MM-DDT00:00:00");

                                    if (classdate <= moment().format("YYYY-MM-DDT00:00:00") && classdate >= moment().subtract(3, 'days').format("YYYY-MM-DDT00:00:00")) {
                                        logger.debug("requestId :: " + self.requestId + ":: Date falls in 7 days range -" + classdate);
                                        periodarr.push(period_);
                                    } else {
                                        logger.debug("requestId :: " + self.requestId + ":: Date doesn't falls in 7 days range -" + classdate);
                                    }
                                }
                            })
                            //logger.debug("requestId :: " + self.requestId + ":: Periods found -" + periodarr.length);
                            periodmap.push(periodarr)
                        }//endof else
                        if (counter == self.periodIndex_.length) {
                            done(null, periodmap)
                        } else {
                            logger.debug("Counter =" + counter);
                            logger.debug("Total Index period =" + self.periodIndex_.length);

                        }
                    })//end of period find
                },
                function sendperiods(periodmap, done) {
                    logger.debug("requestId :: " + self.requestId + ":: Sending fetched periods-" + periodmap.length);
                    resolve(periodmap)
                }
            ], (err) => {
                if (err) {
                    logger.error("requestId :: " + self.requestId + " :: getperiods Controller Async Waterfall Error is -" + err);
                    reject(mapError.errorCodeToDesc(self.requestId, '502', "getperiods"))
                }
            }); // End of Async waterfall
        })
    })
}




getPeriod.prototype.getallDocs = function (initiatedby) {
    var self = this;
    let requestId=self.requestId;
    let indexperiodmodified = []

    var logger = getLogger('getallDocs');

    return new Promise(function (resolve, reject) {
        var periodmap = [];
        logger.debug("requestId :: " + self.requestId + ":: Inside getallDocs for -" + self.requestPayload);

        var counter = 0;

        PeriodIndex.find({ '_id': self.requestPayload }, { _id: 1, record: 1, days: 1, class: 1, subject: 1, section: 1, semester: 1, startdate: 1, enddate: 1,clouddrive:1 }, (err, periodIndexObj) => {
            counter++;
            if (!periodIndexObj || periodIndexObj.length == 0) {
                logger.debug("requestId :: " + self.requestId + ":: No Documents for -" + JSON.stringify(periodIndexObj));
                //resolve([])
                reject(mapError.errorCodeToDesc(self.requestId, '204', "getperiods"))
            } else {
                async.waterfall([
                    function fetchPeriodIndex(done) {
                        logger.debug("requestId :: " + self.requestId + ":: Iterating the period Index -" + JSON.stringify(periodIndexObj));

                        var periodarr = [];
                        var periodindex = {};
                        periodindex.uniqueperiodid = periodIndexObj[0]._id,
                            periodindex.startdate = periodIndexObj[0].startdate,
                            periodindex.enddate = periodIndexObj[0].enddate,
                            periodindex.days = periodIndexObj[0].days,
                            periodindex.class = periodIndexObj[0].class,
                            periodindex.section = periodIndexObj[0].section,
                            periodindex.semester = periodIndexObj[0].semester,
                            periodindex.clouddrive = periodIndexObj[0].clouddrive,
                            
                            periodindex.documents = typeof periodIndexObj[0].record.documents != 'undefined' && periodIndexObj[0].record.documents.length > 0 ? periodIndexObj[0].record.documents : [];
                        periodindex.assignments = typeof periodIndexObj[0].record.assignment != 'undefined' && periodIndexObj[0].record.assignment.length > 0 ? periodIndexObj[0].record.assignment : [];
                        periodindex.classnote = typeof periodIndexObj[0].record.weblink != 'undefined' && periodIndexObj[0].record.weblink.classnote.length > 0 ? periodIndexObj[0].record.weblink.classnote : "None"
                        periodindex.subject = periodIndexObj[0].subject,


                            periodarr.push(periodindex);
                        done(null, periodIndexObj[0], periodarr)

                    },
                    function fetchPeriods(periodIndexObj, periodarr, done) {
                        logger.debug("requestId :: " + self.requestId + ":: fetchPeriods periodIndexObj -" + JSON.stringify(periodIndexObj));

                        queryPayload = { "periodindex": periodIndexObj._id };
                        Period.find(queryPayload, (err, allperiod) => {
                            counter++;
                            if (!allperiod) {
                                logger.debug("requestId :: " + self.requestId + ":: No Periods Created resolving -" + JSON.stringify(periodarr));
                                resolve(periodarr)
                            } else {
                                logger.debug("requestId :: " + self.requestId + ":: All period document length is   -" + allperiod.length);
                                allperiod.forEach(function (periodObj) {
                                    var period_ = {};
                                    var docarr = []
                                    var assignmentarr = []

                                    for (var i = 0; i < periodObj.record.documents.length; i++) {
                                        if (initiatedby == 2 && periodObj.record.documents[i].sharable == false)
                                            continue;

                                        docarr.push({
                                            "id": periodObj.record.documents[i].uploadref,
                                            "filename": periodObj.record.documents[i].file,
                                            "type": periodObj.record.documents[i].mimetype,
                                            "path": periodObj.record.documents[i].path,
                                            "title": periodObj.record.documents[i].title,
                                            "note": periodObj.record.documents[i].note
                                        })
                                    }
                                    for (var i = 0; i < periodObj.record.assignment.length; i++) {
                                        if (initiatedby == 2 && periodObj.record.assignment[i].sharable == false)
                                            continue;
                                        let asignmentobj = {
                                            "id": periodObj.record.assignment[i].uploadref,
                                            "filename": periodObj.record.assignment[i].file,
                                            "type": typeof periodObj.record.assignment[i].mimetype != null ? periodObj.record.assignment[i].mimetype : "text",
                                            "path": periodObj.record.assignment[i].path,
                                            "title": periodObj.record.assignment[i].title,
                                            "note": periodObj.record.assignment[i].note,
                                            "validupto": periodObj.record.assignment[i].validupto,
                                        }
                                        if (initiatedby != 2)
                                            asignmentobj.submittedby = periodObj.record.assignment[i].submittedby
                                        assignmentarr.push(asignmentobj)
                                    }
                                    period_.uniqueperiodid = periodObj._id,
                                        period_.startdate = periodObj.startdate,
                                        period_.enddate = periodObj.enddate,
                                        period_.documents = docarr
                                    // period_.weblink = periodObj.record.weblink
                                    period_.assignments = assignmentarr
                                    period_.classnote = typeof periodObj.record.weblink != 'undefined' && Object.keys(periodObj.record.weblink).length > 0 ? periodObj.record.weblink.classnote : null
                                    periodarr.push(period_);
                                })
                                logger.debug("requestId :: " + self.requestId + ":: Documents  found -" + periodarr.length);
                                //periodmap.push(periodarr)
                                done(null, periodarr)
                            }//endof else
                            /*if (counter == periodIndexObj.length) {
                                done(null, periodmap)
                            } else {
                                logger.debug("Counter =" + counter);
                                logger.debug("Total Index period =" + periodIndexObj.length);

                            }*/
                        })//end of period find
                    },
                    function sendperiods(periodmap, done) {
                        logger.debug("requestId :: " + self.requestId + ":: Sending fetched Documents-" + JSON.stringify(periodmap));
                        resolve(periodmap)
                    }
                ], (err) => {
                    if (err) {
                        logger.error("requestId :: " + self.requestId + " :: getallDocs Controller Async Waterfall Error is -" + err);
                        reject(mapError.errorCodeToDesc(self.requestId, '502', "getperiods"))
                    }
                }); // End of Async waterfall
            }
        })
    })
}

module.exports = getPeriod;
