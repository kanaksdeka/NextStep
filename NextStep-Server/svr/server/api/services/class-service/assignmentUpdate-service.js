let co = require('co');
const { toLower } = require('lodash');
let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));
let logger = getLogger('updateSpecificStdAssignment');
const Period = require(path.join(appRoot, 'api/models/Period'));
const User = require(path.join(appRoot, 'api/models/User'));
let moment = require('moment');

let async = require('async');


function updateSpecificStdAssignment(param) {
    this.params = {};
    this.requestId = param.requestId;
    this.periodid = param.periodid;
    this.submittedassignmentid = param.submittedassignmentid;
    this.submittedagainstassignmentid = param.submittedagainstassignmentid;
    this.assignmentsubmittedby = param.assignmentsubmittedby;
    this.status = param.status.toLowerCase() == "true" ? true : false;
    this.marks = parseInt(param.marks, 10);
    this.subjectname = param.subjectname;
    this.teachername = param.teachername;
    this.semester = param.semester;
    //this.submittedagainstassignmentid=param.submittedagainstassignmentid
    this.assignmentname = param.assignmentname;
    this.assignmentpath = param.assignmentpath;
    //this.submittedassignmentid=param.submittedassignmentid;
    this.submittedassignmentname = param.submittedassignmentname;
    this.submittedassignmentpath = param.submittedassignmentpath;
}
updateSpecificStdAssignment.prototype.captureteacherinput = function () {
    var self = this;
    logger.debug("requestId :: " + self.requestId + ":: Self is -", self);

    return new Promise(function (resolve, reject) {
        try {
            //let queryPayload = { "_id": self.periodid, "record.assignment.updateref": self.submittedassignmentid };
            let queryPayload = {
                "_id": self.periodid,
                "record.assignment": {
                    "$elemMatch": {
                        "uploadref": self.submittedagainstassignmentid,
                        "submittedby.assignmentref": self.submittedassignmentid
                    }
                }
            }
            //let setto = self.status
            /*let statusPayload = { $set: { "record.assignment.$.acceptancestatus": self.status,
                                          "record.assignment.$.marks": self.marks
                                        }}*/
            let updatepayload = {
                $set: {
                    "record.assignment.$[outer].submittedby.$[inner].marks": self.marks,
                    "record.assignment.$[outer].submittedby.$[inner].checkstatus": self.status
                },
            }

            let arrayfilter = {
                "arrayFilters": [
                    { "outer.uploadref": self.submittedagainstassignmentid },
                    { "inner.assignmentref": self.submittedassignmentid }
                ]
            }

            async.waterfall([
                function updateperioddocument(done) {
                    Period.update(queryPayload, updatepayload, arrayfilter, (err, result) => {
                        if (err) {
                            logger.debug("requestId :: " + self.requestId + ":: error updating the inputs from teacher-", err);
                            reject(mapError.errorCodeToDesc(requestId, '501', "updateSpecificStdAssignment"));
                        } else {
                            logger.debug("requestId :: " + self.requestId + ":: Updated Specific assignment Query -", queryPayload);
                            logger.debug("requestId :: " + self.requestId + ":: Updated Specific assignment status -", updatepayload);
                            logger.debug("requestId :: " + self.requestId + ":: Updated Specific assignment filter -", arrayfilter);
                            logger.debug("requestId :: " + self.requestId + ":: Updated assignment returned status -", result);
                            //resolve(mapError.errorCodeToDesc(self.requestId, '200', "updateSpecificStdAssignment"))
                            //resolve(result)
                            done(null, result);
                        }
                    });
                },
                function updateuserdocument(result, done) {
                    logger.debug("requestId :: " + self.requestId + ":: Updating the user with its grade-", self.assignmentsubmittedby);
                    let query = { "_id": self.assignmentsubmittedby }
                    let payload = {
                        "subject": self.subjectname,
                        "teachername": self.teachername,
                        "semester": self.semester,
                        "scoreref": moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MMDDYYYYhhmmss'),
                        "teachersassignmentid": self.submittedagainstassignmentid,
                        "teacherassignmentname": self.assignmentname,
                        "teacherassignmentPath": self.assignmentpath,
                        "studentsuploadassignmentid": self.submittedassignmentid,
                        "studentassignmentname": self.submittedassignmentname,
                        "studentassignmentpath": self.submittedassignmentpath,
                        "marks": self.marks,
                        "checkstatus": self.status,
                        "createdon": new Date()
                    }
                    /* User.findOneAndUpdate(query, //  this code was adding new record every time , but we need to update 
                         { $push: { "grade": payload } },
                         (err, result) => {
                         if (err) {
                             logger.debug("requestId :: " + self.requestId + ":: error updating the user document for the check -" , err);
                             reject(mapError.errorCodeToDesc(self.requestId, '503', "updateSpecificStdAssignment"));
                         } else {
                             logger.debug("requestId :: " + self.requestId + ":: Updated Specific user Query -" ,query);
                             logger.debug("requestId :: " + self.requestId + ":: Updated Specific user update payload -" ,payload);
                             logger.debug("requestId :: " + self.requestId + ":: Updated Specific  usre returned result -",result);
                             resolve(mapError.errorCodeToDesc(self.requestId, '200', "updateSpecificStdAssignment"))
                             //resolve(result)
                         }
                     });
                  }*/

                    logger.debug("requestId :: " + self.requestId + ":: captureteacherinput payload to update  -", payload)

                    async.waterfall([
                        function delexisting(done) {
                            //User.update(query, { $pull: { "grade.$.teachersassignmentid": self.submittedagainstassignmentid } }, (err, update) => {
                            User.update(query, { $pull: { grade: { teachersassignmentid: self.submittedagainstassignmentid } } }, (err, update) => {
                                if (err) {
                                    logger.debug("requestId :: " + self.requestId + ":: captureteacherinput error deleting the user document for the previous grade -", err);
                                    reject(mapError.errorCodeToDesc(self.requestId, '503', "updateSpecificStdAssignment"));
                                } else {
                                    logger.debug("requestId :: " + self.requestId + ":: captureteacherinput Delete Specific  grade returned result -", update);                                 //res.send(mapError.errorCodeToDesc(requestId, '200', "submitfinalgrade"))
                                    done(null, true)
                                }
                            })
                        },
                        function insertupdated(statusflag, done) {
                            User.findOneAndUpdate(query, 
                                { $push: { "grade": payload } },
                                (err, result) => {
                                    if (err) {
                                        logger.debug("requestId :: " + self.requestId + ":: Error updating the user document for the check -", err);
                                        reject(mapError.errorCodeToDesc(self.requestId, '503', "updateSpecificStdAssignment"));
                                    } else {
                                        logger.debug("requestId :: " + self.requestId + ":: Updated Specific user Query -", query);
                                        logger.debug("requestId :: " + self.requestId + ":: Updated Specific user update payload -", payload);
                                        logger.debug("requestId :: " + self.requestId + ":: Updated Specific  usre returned result -", result);
                                        resolve(mapError.errorCodeToDesc(self.requestId, '200', "updateSpecificStdAssignment"))
                                        //resolve(result)
                                    }
                                });
                        }
                    ], (err) => {
                        if (err) {
                            logger.error("requestId :: " + requestId + ":: submitfinalgrade encountered error while pullign and inserting grade  - ", err);
                            reject(mapError.errorCodeToDesc(self.requestId, '502', "updateSpecificStdAssignment"))
                        }
                    });
                }
            ], (err) => {
                if (err) {
                    logger.error("requestId :: " + self.requestId + " :: submitfinalgrade update of Period failed -", err);
                    reject(mapError.errorCodeToDesc(self.requestId, '504', "updateSpecificStdAssignment"))
                }
            });
        } catch (error) {
            logger.error("requestId :: " + self.requestId + " :: submitfinalgrade find and update Exception -", error);
            reject(mapError.errorCodeToDesc(self.requestId, '500', "updateSpecificStdAssignment"))
        }
    });

}


module.exports = updateSpecificStdAssignment;
