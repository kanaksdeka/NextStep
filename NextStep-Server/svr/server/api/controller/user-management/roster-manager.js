let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
const async = require('async');
var _ = require("lodash");
var co = require('co');
const { resolve } = require('path');
const User = require(path.join(appRoot, 'api/models/User'));
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));
let moment = require('moment');

exports.getstudents = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('getstudents');
    var initiatedby = typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
    logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

    if (initiatedby != 1 && initiatedby != 3)
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))
    try {

        if (typeof req.body.class == 'undefined' || req.body.class.length < 0) {
            logger.error("requestId :: " + requestId + ":: Validation failed for class ");
            res.send(mapError.errorCodeToDesc(requestId, '401', "metadata"))
        } else if (typeof req.body.semester == 'undefined' || req.body.semester.length < 0) {
            logger.error("requestId :: " + requestId + ":: Validation failed for semester ");
            res.send(mapError.errorCodeToDesc(requestId, '401', "metadata"))
        } else if (typeof req.body.section == 'undefined' || req.body.section.length < 0) {
            logger.error("requestId :: " + requestId + ":: Validation failed for startdate ");
            res.send(mapError.errorCodeToDesc(requestId, '401', "metadata"))
        }else {
            logger.error("requestId :: " + requestId + ":: Input payload validation success");


            var studentqueryPayload = {};
            studentqueryPayload["$and"] = [];
            studentqueryPayload["$and"].push({ 'profile.class.0.classid':req.body.class});
            studentqueryPayload["$and"].push({ 'profile.class.0.section':req.body.section});
            studentqueryPayload["$and"].push({ 'profile.class.0.semester':req.body.semester });
            studentqueryPayload["$and"].push({ 'category.categoryType':'S' });

            logger.error("requestId :: " + requestId + ":: Input payload -",studentqueryPayload);
            let rosterarray=[];

            User.find(studentqueryPayload,(err, roster) => {
            if (roster.length > 0) {
                logger.error("requestId :: " + requestId + ":: User found with provided input - " + JSON.stringify(roster));
                roster.forEach(element => {
                        var data={
                            "studentid": element._id,
                            "name": element.profile.fullname,
                            "enrolmentnumber": element.profile.rollNumber
                        }
                        let gradearr=[];
                        element.grade.forEach(grades=>{
                            if(grades.semester==req.body.semester && grades.subject==req.body.subject){
                                gradearr.push(grades)
                            }
                        })
                        data.grades=gradearr
                        rosterarray.push(data)
                    });
                res.send(rosterarray)
            } else if (err) {
                logger.error("requestId :: " + requestId + ":: User search encountered error  - " + JSON.stringify(err));
                res.send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
            } else {
                logger.error("requestId :: " + requestId + ":: User search No data found");
                res.send(mapError.errorCodeToDesc(requestId, '504', "metadata"))
            }
        })
    }
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: createsemester Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};

