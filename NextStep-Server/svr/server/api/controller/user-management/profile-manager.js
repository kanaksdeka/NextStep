let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));
let async = require('async')
// our persistent user model
const User = require(path.join(appRoot, 'api/models/User'));
var _ = require("lodash");

exports.fetchStudents = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('fetchStudents');
    let data = [];

    var initiatedby = typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
    logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)
    if (initiatedby != 1 && initiatedby != 3)
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))
    else {
        try {

            User.find({ "category.categoryType": "S" }, { _id: 1, "profile.fullname": 1, "profile.rollNumber": 1, "profile.class": 1, "profile.email": 1, "status.profilestat": 1 }, (err, user) => {
                if (user.length > 0) {
                    logger.debug("requestId :: " + requestId + ":: Students Fetched total - " + user.length);
                    logger.debug("requestId :: " + requestId + ":: Students array - " + JSON.stringify(user));
                    user.forEach(element => {

                        logger.debug("requestId :: " + requestId + ":: Element is  - " + JSON.stringify(element));
                        element.profile.class[0].class_name = {};
                        element.profile.class[0].section_name = {};
                        element.profile.class[0].semester_name = {};
                        element.profile.class[0].class_name = mapper.grademap.get(element.profile.class[0].classid != 'undefined' && element.profile.class[0].classid.length > 0 ? element.profile.class[0].classid : null);
                        element.profile.class[0].section_name = mapper.sectionmap.get(element.profile.class[0].section != 'undefined' && element.profile.class[0].section.length > 0 ? element.profile.class[0].section : null);
                        element.profile.class[0].semester_name = mapper.semestermap.get(element.profile.class[0].semester != 'undefined' && element.profile.class[0].semester.length > 0 ? element.profile.class[0].semester : null);
                        data.push(element)
                    });
                    logger.debug("requestId :: " + requestId + ":: Students Fetched Sending the result - ", JSON.stringify(data));

                    res.send(data)
                } else if (err) {
                    logger.error("requestId :: " + requestId + ":: Student search encountered error  - " + JSON.stringify(err));
                    res.send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
                } else {
                    logger.error("requestId :: " + requestId + ":: Student search No data found");
                    res.send(mapError.errorCodeToDesc(requestId, '504', "metadata"))
                }
            })
        } catch (err) {
            logger.error("requestId :: " + requestId + " :: fetchStudents Exception -" + err);
            res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
        }
    }
};


exports.getteachers = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('getteachers');
    var initiatedby = typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
    logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

    /*if (initiatedby != 1) //1->Admin  2->Student 3->Teacher
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))
    */
    try {

        User.find({ "category.categoryType": "T" }, { _id: 1, "profile.fullname": 1, "profile.class": 1, "email": 1 }, (err, user) => {
            if (user.length > 0) {
                logger.error("requestId :: " + requestId + ":: Teachers found with provided input - " + JSON.stringify(user));
                res.send(user)
            } else if (err) {
                logger.error("requestId :: " + requestId + ":: Teacher search encountered error  - " + JSON.stringify(err));
                res.send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
            } else {
                logger.error("requestId :: " + requestId + ":: Teacher search No data found");
                res.send(mapError.errorCodeToDesc(requestId, '504', "metadata"))
            }
        })
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: getteachers Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};



exports.getmyAssignments = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('getmyAssignments');

    if (logLevel === "DEBUG") {
        logger.debug("getmyAssignments controller Start");
    }

    try {
        let query = { "token.token": req.headers.authorization }

        User.find(query,
            (err, assignments) => {
                if (typeof assignments != 'undefined' && assignments.length > 0) {
                    let assignmentsarr = [];
                    let semester = typeof req.query.semester != 'undefined' && req.query.semester.length > 0 ? req.query.semester : assignments[0].profile.class[0].semester
                    //  logger.error("requestId :: " + requestId + ":: User found with provided input - " + JSON.stringify(assignments));
                    assignments[0].record.assignment.forEach(element => {
                        logger.debug("requestId :: " + requestId + ":: Element is  - ", element);
                        logger.debug("requestId :: " + requestId + ":: Semester in profile for assignment is  - ", semester);

                        if (element.semester == semester) {
                            assignmentsarr.push({
                                "upload_date": element.uploaddate,
                                "upload_id": element.uploadref,
                                "upload_file": element.file,
                                "upload_path": element.path,
                                //"documenttype" : "AS", 
                                // "mimetype" : "application/pdf", 
                                "upload_title": element.title,
                                "upload_note": element.note,
                                // "sharable" : true, 
                                //  "submittedby" : [], 
                                // "validupto" : ISODate("2020-10-25T18:30:00.000+0000"), 
                                "assignment_Submiting_Against": element.assignmentSubmitingAgainst,
                                "assignment_For_Period": element.assignmentforPeriod,
                                "semester": element.semester
                            })
                        }
                    });
                    if (assignmentsarr.length > 0)
                        res.send(assignmentsarr)
                    else
                        res.send(mapError.errorCodeToDesc(requestId, '502', "getmyAssignments"))
                } else if (err) {
                    logger.error("requestId :: " + requestId + ":: User search encountered error  - " + JSON.stringify(err));
                    res.send(mapError.errorCodeToDesc(requestId, '502', "getmyAssignments"))
                } else {
                    logger.error("requestId :: " + requestId + ":: User search No data found");
                    res.send(mapError.errorCodeToDesc(requestId, '504', "getmyAssignments"))
                }
            })
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: getmyAssignments Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "getmyAssignments"))
    }
};


exports.getmyscores = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('getmyscores');

    if (logLevel === "DEBUG") {
        logger.debug("getmyscores controller Start");
    }

    try {
        let query = { "token.token": req.headers.authorization }

        User.find(query,
            (err, scores) => {
                if (typeof scores != 'undefined' && scores.length > 0) {
                    let scoresarr = [];
                    let semester = typeof req.query.semester != 'undefined' && req.query.semester.length > 0 ? req.query.semester : scores[0].profile.class[0].semester

                    //  logger.error("requestId :: " + requestId + ":: User found with provided input - " + JSON.stringify(scores));
                    scores[0].grade.forEach(element => {
                        logger.debug("requestId :: " + requestId + ":: Element is  - ", element);
                        logger.debug("requestId :: " + requestId + ":: Semester in profile is  - ", semester);

                        if (element.semester == semester) {
                            scoresarr.push({
                                "scoreid": element.scoreref,
                                "subject": element.subject,
                                "assignmentid_t": element.teachersassignmentid,
                                "assignmentname_t": element.teacherassignmentname,
                                "assignmentPath_t": element.teacherassignmentPath,
                                "assignmentid_s": element.studentsuploadassignmentid,
                                "assignmentname_s": element.studentassignmentname,
                                "assignmentPath_s": element.studentassignmentpath,
                                "score": element.marks,
                                "checkedbyteacher": element.checkstatus,
                                "checkedon": element.createdon
                            })
                        }
                    });
                    if (scoresarr.length > 0)
                        res.send(scoresarr)
                    else
                        res.send(mapError.errorCodeToDesc(requestId, '502', "getscores"))
                } else if (err) {
                    logger.error("requestId :: " + requestId + ":: User search encountered error  - " + JSON.stringify(err));
                    res.send(mapError.errorCodeToDesc(requestId, '502', "getscores"))
                } else {
                    logger.error("requestId :: " + requestId + ":: User search No data found");
                    res.send(mapError.errorCodeToDesc(requestId, '504', "getscores"))
                }
            })
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: getscores Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "getscores"))
    }
};



exports.updateprofile = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('updateprofile');
    let email_change = false;
    let rollnumber_change = false;
    let class_sem_section_change = false;
    let initiatedby = req.body.initiatedby
    let queryPayload = {};

    try {
        let updateData = {};
        updateData = req.body.update;
        const authtoken = _.hasIn(req.headers, "authorization") && req.headers.authorization != 'undefined' && req.headers.authorization.length > 0 ? req.headers.authorization : 0;


        if (!updateData) {
            logger.error("requestId :: " + requestId + ":: please provide what you want to update ");
            res.status(422).send(mapError.errorCodeToDesc(requestId, '422', "updateprofile"))
        } else {
            logger.debug("requestId :: " + requestId + ":: Update payload for profile update -" + JSON.stringify(updateData));

        }

        if (initiatedby == 2) {
            logger.debug("requestId :: " + requestId + ":: Update initiated by Student");
            queryPayload = { "token.token": authtoken };
        }
        else {
            if (updateData.hasOwnProperty("updatingUserId") && typeof updateData.updatingUserId != 'undefined' && updateData.updatingUserId.length > 0) {
                logger.debug("requestId :: " + requestId + ":: Update initiated by Admin/Teacher for student");
                queryPayload = { "_id": updateData.updatingUserId };
            } else {
                logger.debug("requestId :: " + requestId + ":: Update done by Admin for own profile");
                queryPayload = { "token.token": authtoken };
            }
        }

        User.findOne(queryPayload, (err, user) => {
            if (!user) {
                logger.error("requestId :: " + requestId + ":: No user found with logged token ");
                res.status(401).send(mapError.errorCodeToDesc(requestId, '401', "updateprofile"))
            } else {
                logger.debug("requestId :: " + requestId + ":: User found with email -" + user.email);
            }

            //NOTE  only update fields that were actually passed...
            if (updateData.hasOwnProperty("email") && typeof updateData.email != 'undefined' && updateData.email.length > 0) {
                user.email = updateData.email;
                email_change = true;
            }
            if (updateData.hasOwnProperty("name") && typeof updateData.name != 'undefined' && updateData.name.length > 0) {
                user.profile.fullname = updateData.name;
            }
            if (updateData.hasOwnProperty("phonenumber") && typeof updateData.phonenumber != 'undefined' && updateData.phonenumber.length > 0) {
                user.profile.phoneNumber = updateData.phonenumber.trim();
            }
            if (updateData.hasOwnProperty("birthDay") && typeof updateData.birthDay != 'undefined' && updateData.birthDay.length > 0) {
                user.profile.birthDay = updateData.birthDay.trim();
            }
            if (updateData.hasOwnProperty("birthMonth") && typeof updateData.birthMonth != 'undefined' && updateData.birthMonth.length > 0) {
                user.profile.birthMonth = updateData.birthMonth.trim();
            }
            if (updateData.hasOwnProperty("parent") && typeof updateData.parent != 'undefined' && updateData.parent.length > 0) {
                user.profile.gurdianName = updateData.parent.trim();
            }
            if (updateData.hasOwnProperty("rollnumber") && typeof updateData.rollnumber != 'undefined' && updateData.rollnumber.length > 0) {
                user.profile.rollNumber = updateData.rollnumber.trim();
                rollnumber_change = true
            }

            if (updateData.hasOwnProperty("address") && updateData.address.hasOwnProperty("apartmentnumber") && typeof updateData.address.apartmentnumber != 'undefined' && updateData.address.apartmentnumber.length > 0) {
                user.profile.address.apartmentNumber = updateData.address.apartmentnumber;
            }

            if (updateData.hasOwnProperty("address") && updateData.address.hasOwnProperty("addressline") && typeof updateData.address.addressline != 'undefined' && updateData.address.addressline.length > 0) {
                user.profile.address.address = updateData.address.addressline;
            }
            if (updateData.hasOwnProperty("address") && updateData.address.hasOwnProperty("zipcode") && typeof updateData.address.zipcode != 'undefined' && updateData.address.zipcode.length > 0) {
                user.profile.address.zipcode = updateData.address.zipcode;
            }

            if (updateData.hasOwnProperty("address") && updateData.address.hasOwnProperty("state") && typeof updateData.address.state != 'undefined' && updateData.address.state.length > 0) {
                user.profile.address.state = updateData.address.state;
            }

            if (updateData.hasOwnProperty("class") && typeof updateData.class != 'undefined' && updateData.class.length > 0) {
                user.profile.class[0].class = updateData.class.trim();
                class_sem_section_change = true
            }

            if (updateData.hasOwnProperty("section") && typeof updateData.section != 'undefined' && updateData.section.length > 0) {
                user.profile.class[0].section = updateData.section.trim();
                class_sem_section_change = true
            }

            if (updateData.hasOwnProperty("semester") && typeof updateData.semester != 'undefined' && updateData.semester.length > 0) {
                user.profile.class[0].semester = updateData.semester.trim();
                class_sem_section_change = true
            }

            if (updateData.hasOwnProperty("is_active") && typeof updateData.is_active != 'undefined' && updateData.is_active.length > 0) {
                user.status.profilestat = updateData.is_active.trim().toLowerCase() === 'true' ? true : false;
                class_sem_section_change = true
            }

            if ((email_change == true || class_sem_section_change == true) && initiatedby == 2)
                return res.status(403).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))

            async.waterfall([
                function update_profile(done) {
                    if (logLevel === "DEBUG")
                        logger.debug("requestId :: " + requestId + " :: updateprofile Controller inside update_profile");
                    user.save((err) => {
                        if (err) {
                            logger.error("requestId :: " + requestId + " :: updateprofile Controller Error in updating profile information-" + err);
                            return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "updateprofile"))
                        }
                        if (logLevel === "DEBUG")
                            logger.debug("requestId :: " + requestId + " :: updateprofile Controller Profile updation success");
                        return res.status(200).send(mapError.errorCodeToDesc(requestId, '200', "updateprofile"));
                    });
                }
            ])

        }).catch((error) => {
            logger.error("requestId :: " + requestId + " :: updateprofile find and update Exception -" + error);
            res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "updateprofile"))
        });

    } catch (err) {
        logger.error("requestId :: " + requestId + " :: updateprofile Exception -" + err);
        return res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "updateprofile"))
    }
};


exports.getprofile = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('getprofile');

    try {
        const authtoken = _.hasIn(req.headers, "authorization") && req.headers.authorization != 'undefined' && req.headers.authorization.length > 0 ? req.headers.authorization : 0;

        var queryPayload = { "token.token": authtoken };
        logger.debug("requestId :: " + requestId + ":: Query payload for profile fetch -" + JSON.stringify(queryPayload));

        //User.findOne(queryPayload).then(function (err,user) {
        User.findOne(queryPayload, (err, user) => {
            if (!user) {
                logger.error("requestId :: " + requestId + ":: No user found with logged token  -" + authtoken);
                res.status(204).send(mapError.errorCodeToDesc(requestId, '204', "getprofile"))
            } else {
                res.status(200).send({
                    //'token': token,
                    'email': user.email,
                    'address': user.profile.address,
                    'phone': user.profile.phoneNumber,
                    'profilephoto': user.profile.profilephoto,

                    'class': user.profile.class[0].classid,
                    'section': user.profile.class[0].section,
                    'semester': user.profile.class[0].semester,

                    'class_name': mapper.grademap.get(user.profile.class[0].classid),
                    'section_name': mapper.sectionmap.get(user.profile.class[0].section),
                    'semester_name': mapper.semestermap.get(user.profile.class[0].semester),

                    'enrollmentnumber': user.profile.rollNumber,
                    'name': user.profile.fullname,
                    'birthday': user.profile.birthDay,
                    'birthmonth': user.profile.birthMonth,
                    'gurdianname': user.profile.gurdianName
                });
                logger.debug("requestId :: " + requestId + ":: User found with email -" + user.email);
            }

        }).catch((error) => {
            logger.error("requestId :: " + requestId + " :: getprofile find Exception -" + error);
            res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "getprofile"))
        });
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: getprofile Exception -" + err);
        return res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "getprofile"))
    }
};
