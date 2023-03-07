let path = require('path');
let uploadappRoot = path.join(require('app-root-dir').get(), '/server/');
let location_env = path.join(require('app-root-dir').get(), 'config/local.env.js');
let mapError = require(path.join(uploadappRoot, '/utils/codeToErrorMapping.js'));
let addRequestId = require('express-request-id')();
const Period = require(path.join(uploadappRoot, 'api/models/Period'));
const User = require(path.join(uploadappRoot, 'api/models/User'));

const PeriodIndex = require(path.join(uploadappRoot, 'api/models/PeriodIndex'));

global.getLogger = require(path.join(uploadappRoot, 'upload_log4js'));
var logger = getLogger('uploader');
const async = require('async');
var bodyParser = require('body-parser');


//var location_env = require('./config/local.env.js');

// Set default node environment to development
process.env.NODE_ENV = location_env.NODE_ENV || 'development';


// Set Client id to default
process.env.CLIENT_ID = location_env.CLIENT_ID || 'default';
//logger.debug("CLIENT_ID" + process.env.CLIENT_ID );



// Set port to 9001 as default
process.env.UPLOADPORT = location_env.UPLOADPORT || '9000';



let express = require('express');
let uploadapp = express();
uploadapp.use(bodyParser.urlencoded({ extended: false }));
uploadapp.use(bodyParser.json());

let uploaddir = path.join(require('app-root-dir').get(), '/upload/');
let apiDetails = require(path.join(uploadappRoot, 'api/config/settings.js'));

//logger.debug("uploadappRoot"+uploadappRoot);
//logger.debug("apiDetails"+JSON.stringify(apiDetails));

let formidable = require('formidable');
let fs = require('fs');
let moment = require('moment')
//let config = require(path.join(uploadappRoot, '/api/config/environment')); 

const authentication = require(path.join(uploadappRoot, 'api/authenticate/authenticate'));

//var location_env = require('./config/local.env.js');
const chalk = require('chalk');
var cluster = require('cluster');


// Setup server
let cors = require('cors');
uploadapp.use(cors());
uploadapp.options('*', cors());
uploadapp.use(addRequestId);

//Set the logger

var log4js = require('log4js');
var logroot = path.join(require('app-root-dir').get());


var uploadDirectory = logroot + '/upload'
var logDirectory = logroot + '/log'


//Ensure upload directoty exists
if (fs.existsSync(uploadDirectory) === true) {
    console.log("Upload Folder exists in -" + uploadDirectory);
} else {
    fs.mkdirSync(uploadDirectory);
}

// ensure log directory exists
if (fs.existsSync(logDirectory) === true) {
    console.log("Log Folder exists in -" + logDirectory);
} else {
    fs.mkdirSync(logDirectory);
}


uploadapp.get('/file-service/class/document/public', authentication, function (request, response) {
    //uploadapp.get('/file-service/class/document/public', function (request, response) {

    // We will only accept 'GET' method. Otherwise will return 405 'Method Not Allowed'.
    let documentid = request.query.documentid;
    let periodid = request.query.periodid;
    var initiatedby = request.body.initiatedby != 'undefined' && request.body.initiatedby > 0 ? request.body.initiatedby : 0;

    let filenamedb = "";
    let path = "";
    let contentType = "";
    let found = false;
    logger.debug("requestId :: " + request.id + ":: Requested for period -" + request.query.periodid);

    if (request.method != 'GET') {
        sendResponse(response, 405, { 'Allow': 'GET' }, null);
        return null;
    }

    Period.findOne(
        { _id: periodid },
        function (error, docObj) {
            if (error) {
                logger.debug("requestId :: " + request.id + ":: Unable to find a Period for the given ID -" + error);
                response.status(500).send(mapError.errorCodeToDesc(request.id, '502', "upload"))

            } else if (docObj == null) {
                logger.debug("requestId :: " + request.id + ":: docObj is set to -" + JSON.stringify(docObj));
                response.status(204).send(mapError.errorCodeToDesc(request.id, '204', "upload"))
            } else {
                logger.debug("requestId :: " + request.id + ":: docObj fetched is  -" + JSON.stringify(docObj));

                var i = 0;
                for (i = 0; i < docObj.record.documents.length; i++) {
                    if (documentid === docObj.record.documents[i].uploadref) {
                        logger.debug("requestId :: " + request.id + ":: Matching Reference Found");
                        if (docObj.record.documents[i].sharable === false && initiatedby === 2) {
                            logger.debug("requestId :: " + request.id + ":: This document is in private and cannot be viewed ");
                            return response.status(500).send(mapError.errorCodeToDesc(request.id, '503', "upload"))
                        }
                        logger.debug("requestId :: " + request.id + ":: Privacy check pass for Document");

                        filenamedb = docObj.record.documents[i].file;
                        path = docObj.record.documents[i].path;
                        contentType = docObj.record.documents[i].mimetype
                        found = true;
                        break;

                    }
                }
                if (found == false) {
                    for (i = 0; i < docObj.record.assignment.length; i++) {
                        if (documentid === docObj.record.assignment[i].uploadref) {
                            logger.debug("requestId :: " + request.id + ":: Matching Reference Found");
                            if (docObj.record.assignment[i].sharable === false && initiatedby === 2) {
                                logger.debug("requestId :: " + request.id + ":: This document is in private and cannot be viewed ");
                                return response.status(500).send(mapError.errorCodeToDesc(request.id, '503', "upload"))
                            }
                            logger.debug("requestId :: " + request.id + ":: Privacy check pass for Assignment");

                            filenamedb = docObj.record.assignment[i].file;
                            path = docObj.record.assignment[i].path;
                            contentType = docObj.record.assignment[i].mimetype
                            found = true;
                            break;

                        }
                    }
                }

                logger.debug("requestId :: " + request.id + ":: value of i -" + i);
                logger.debug("requestId :: " + request.id + ":: length of document  -" + docObj.record.documents.length);


                //if (i == docObj.record.documents.length) {
                if (found == false) {
                    logger.debug("requestId :: " + request.id + ":: No matching File found -" + filenamedb);
                    response.status(500).send(mapError.errorCodeToDesc(request.id, '504', "upload"))
                } else {
                    logger.debug("requestId :: " + request.id + ":: File Name Fetched -" + filenamedb);
                    logger.debug("requestId :: " + request.id + ":: Path fetched -" + path);
                    logger.debug("requestId :: " + request.id + ":: Content type for the file -" + contentType);


                    var trlpdownload = path + "/" + filenamedb
                    logger.debug("requestId :: " + request.id + ":: Preparing download for -" + trlpdownload);

                    var filename = trlpdownload;
                    // initFolder + url.parse(request.url, true, true).pathname.split('/file-service/').join(path.sep);

                    // Check if file exists. If not, will return the 404 'Not Found'. 
                    if (!fs.existsSync(filename)) {
                        sendResponse(response, 404, null, null);
                        return null;
                    }

                    var responseHeaders = {};
                    var stat = fs.statSync(filename);
                    var rangeRequest = readRangeHeader(request.headers['range'], stat.size);
                    logger.debug("requestId :: " + request.id + ":: Range Request is -" + JSON.stringify(rangeRequest));


                    // If 'Range' header exists, we will parse it with Regular Expression.
                    if (rangeRequest == null) {
                        responseHeaders['Content-Type'] = contentType;//getMimeNameFromExt(path.extname(filename));
                        responseHeaders['Content-Length'] = stat.size;  // File size.
                        responseHeaders['Accept-Ranges'] = 'bytes';

                        //  If not, will return file directly.
                        logger.debug("requestId :: " + request.id + ":: Range Request not set , sending the file directly -" + filename);

                        sendResponse(response, 200, responseHeaders, fs.createReadStream(filename));
                        return null;
                    }

                    var start = rangeRequest.Start;
                    var end = rangeRequest.End;

                    // If the range can't be fulfilled. 
                    if (start >= stat.size || end >= stat.size) {
                        // Indicate the acceptable range.
                        responseHeaders['Content-Range'] = 'bytes */' + stat.size; // File size.

                        // Return the 416 'Requested Range Not Satisfiable'.
                        sendResponse(response, 416, responseHeaders, null);
                        return null;
                    }

                    // Indicate the current range. 
                    responseHeaders['Content-Range'] = 'bytes ' + start + '-' + end + '/' + stat.size;
                    responseHeaders['Content-Length'] = start == end ? 0 : (end - start + 1);
                    responseHeaders['Content-Type'] = contentType;//getMimeNameFromExt(path.extname(filename));
                    responseHeaders['Accept-Ranges'] = 'bytes';
                    responseHeaders['Cache-Control'] = 'no-cache';

                    // Return the 206 'Partial Content'.
                    sendResponse(response, 206, responseHeaders, fs.createReadStream(filename, { start: start, end: end }));
                }
            }

        });
})

function sendResponse(response, responseStatus, responseHeaders, readable) {
    response.writeHead(responseStatus, responseHeaders);

    if (readable == null)
        response.end();
    else
        readable.on('open', function () {
            // readable.pipe(response);
            readable.pipe(response, { end: true });
            readable.on('end', function () {
                console.log("Stream done");
            })
            readable.on("error", function (err) {
                return err;
            })

        });
    return null;
}

function getMimeNameFromExt(ext) {
    var result = mimeNames[ext.toLowerCase()];

    // It's better to give a default value.
    if (result == null)
        result = 'application/octet-stream';

    return result;
}

function readRangeHeader(range, totalLength) {
    /*
     * Example of the method 'split' with regular expression.
     * 
     * Input: bytes=100-200
     * Output: [null, 100, 200, null]
     * 
     * Input: bytes=-200
     * Output: [null, null, 200, null]
     */

    if (range == null || range.length == 0)
        return null;

    var array = range.split(/bytes=([0-9]*)-([0-9]*)/);
    var start = parseInt(array[1]);
    var end = parseInt(array[2]);
    var result = {
        Start: isNaN(start) ? 0 : start,
        End: isNaN(end) ? (totalLength - 1) : end
    };

    if (!isNaN(start) && isNaN(end)) {
        result.Start = start;
        result.End = totalLength - 1;
    }

    if (isNaN(start) && !isNaN(end)) {
        result.Start = totalLength - end;
        result.End = totalLength - 1;
    }

    return result;
}

// This fetch is not used by the client 
uploadapp.get('/file-service/fetch/document/public', function (req, res) {
    //uploadapp.get('/file-service/fetch/document/public', authentication, function (req, res) {
    //uploadapp.get('/file-service/fetch/document/public', function (req, res) {

    let documentid = req.query.documentid;
    let periodid = req.query.periodid;
    let filename = "";
    let path = "";
    let contentType = "";
    logger.debug("requestId :: " + req.id + ":: Request  -" + req.query.periodid);


    Period.findOne(
        { _id: periodid },
        function (error, docObj) {
            if (error) {
                logger.debug("requestId :: " + req.id + ":: Unable to find a Period for the given ID -" + error);
            } else {
                for (var i = 0; i < docObj.record.documents.length; i++) {
                    if (documentid === docObj.record.documents[i].uploadref) {
                        logger.debug("requestId :: " + req.id + ":: Matching Reference Found");

                        filename = docObj.record.documents[i].file;
                        path = docObj.record.documents[i].path;
                        contentType = docObj.record.documents[i].mimetype
                        break;
                    }
                }
                logger.debug("requestId :: " + req.id + ":: File Name Fetched -" + filename);
                logger.debug("requestId :: " + req.id + ":: Path fetched -" + path);
                logger.debug("requestId :: " + req.id + ":: Content type for the file -" + contentType);


                var trlpdownload = path + "/" + filename
                logger.debug("requestId :: " + req.id + ":: Preparing download for -" + trlpdownload);


                fs.stat(trlpdownload, function (err, stats) {
                    var range = req.headers.range;
                    if (!range) {
                        logger.debug("requestId :: " + req.id + ":: Range not defined  -" + range);
                        return res.sendStatus(416);
                    }

                    //Chunk logic here
                    var positions = range.replace(/bytes=/, "").split("-");
                    var start = parseInt(positions[0], 10);
                    var total = stats.size;
                    var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
                    var chunksize = (end - start) + 1;

                    res.writeHead(206, {
                        'Transfer-Encoding': 'chunked',
                        "Content-Range": "bytes " + start + "-" + end + "/" + total,
                        "Accept-Ranges": "bytes",
                        "Content-Length": chunksize,
                        "Content-Type": contentType//mime.lookup(req.params.filename)

                    });

                    var stream = fs.createReadStream(trlpdownload, { start: start, end: end, autoClose: true })
                        .on('end', function () {
                            console.log('Stream Done');
                        })
                        .on("error", function (err) {
                            res.end(err);
                        })
                        .pipe(res, { end: true });
                });
            }
        });
});

/*API to upload any document, assignment by teacher or student and if student then modify the record uploaded by teacher by the submission details*/

uploadapp.post('/file-service/upload', authentication, function (req, res) {
//uploadapp.post('/file-service/upload', function (req, res) {

    let form = new formidable.IncomingForm();
    let date = moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ');
    let month = date.format('MMMM');
    let year = date.year();
    let _frmdFolder = month + year;

    let grade = "";
    let notes = "";
    let rootdir = "";
    let assignments = "";
    let uploadtype = ""
    let finaluploaddir = ""
    let temp_file = ""
    let documentid = "";
    let upload_file_name = "";
    let note_title = "";
    let note_details = "";
    let file_type = "";
    let _status = "";
    let _validupto = "";

    let _assignmentSubmittedBy="";
    let _assignmentSubmitterGrade="";
    let _assignmentSubmitterSection="";
    let assignmentSubmissionDate="";
    let _assignmentSubmitterUniqueId="";
    let _assignmentSubmitingAgainst="";
    let _assignmentforPeriod="";

    form.multiples = true;
    form.maxFileSize = 300 * 1024 * 1024;

    // form.parse(req)
    // .on('field', function (name, field) {
    form.parse(req, function (err, field, files) {
        logger.debug("requestId :: " + req.id + ":: Type of field  -" + typeof field);
        logger.debug("requestId :: " + req.id + ":: Field received -" + field.uploadparam);
        var uploadparam = field.uploadparam.split(':');

        logger.debug("requestId :: " + req.id + ":: Title received -" + field.title);
        logger.debug("requestId :: " + req.id + ":: Note received -" + field.note);



        //  grade = typeof field.grade != 'undefined' && field.grade.length > 0 ? field.grade : "";
        //  uploadtype = typeof field.uploadtype != 'undefined' && field.uploadtype.length > 0 ? field.uploadtype : "";


        grade = uploadparam[0];
        uploadtype = uploadparam[1];
        documentid = uploadparam[2];
        note_title = field.title;
        note_details = field.note;
        _status = field.status;
        _validupto = typeof field.validupto != 'undefined' && field.validupto.length > 0 ? field.validupto : moment().format("MM/DD/YYYYT00:00:00");
        logger.debug("requestId :: " + req.id + "::  _validupto is  -" + moment().format("MM/DD/YYYYT00:00:00"));

        if(uploadtype=="AS"){
            logger.debug("requestId :: " + req.id + ":: Assignment submission by Student -"+documentid);

            _assignmentSubmittedBy=field.submittedby;
            _assignmentSubmitterGrade=grade
            _assignmentSubmitterSection=field.section
            _assignmentSubmissionDate=new Date();
            _assignmentSubmitterUniqueId=documentid; // the document id is the unique mongo db user collection documentid, this will be used to update in the user collection as well as also who have submited the assignment in Period collection
            _assignmentSubmitingAgainst=field.documentnumber; //thi is th unique uploadref for the assignment in the Period collection
            _assignmentforPeriod=field.assignmentperiod; // this is the unique documentid of the period collection
        }


    })
        .on('file', function (name, file) {
            upload_file_name = file.name;
            logger.debug("requestId :: " + req.id + ":: Grade is - " + grade);
            logger.debug("requestId :: " + req.id + ":: uploadtype is - " + uploadtype);


            switch (grade) {

                case "GRADE I": {
                    rootdir = apiDetails.UPLOAD_DIR.GRADEI.root;
                    notes = apiDetails.UPLOAD_DIR.GRADEI.notes;
                    assignments = apiDetails.UPLOAD_DIR.GRADEI.assignments;
                    break;
                };
                case "GRADE II": {
                    rootdir = apiDetails.UPLOAD_DIR.GRADEII.root;
                    notes = apiDetails.UPLOAD_DIR.GRADEII.notes;
                    assignments = apiDetails.UPLOAD_DIR.GRADEII.assignments;
                    break;
                };
                case "GRADE III": {
                    rootdir = apiDetails.UPLOAD_DIR.GRADEIII.root;
                    notes = apiDetails.UPLOAD_DIR.GRADEIII.notes;
                    assignments = apiDetails.UPLOAD_DIR.GRADEIII.assignments;
                    break;
                };
                case "GRADE IV": {
                    rootdir = apiDetails.UPLOAD_DIR.GRADEIV.root;
                    notes = apiDetails.UPLOAD_DIR.GRADEIV.notes;
                    assignments = apiDetails.UPLOAD_DIR.GRADEIV.assignments;
                    break;
                };
                case "GRADE V": {
                    rootdir = apiDetails.UPLOAD_DIR.GRADEV.root;
                    notes = apiDetails.UPLOAD_DIR.GRADEV.notes;
                    assignments = apiDetails.UPLOAD_DIR.GRADEV.assignments;
                    break;
                };
                case "GRADE VI": {
                    rootdir = apiDetails.UPLOAD_DIR.GRADEVI.root;
                    notes = apiDetails.UPLOAD_DIR.GRADEVI.notes;
                    assignments = apiDetails.UPLOAD_DIR.GRADEVI.assignments;
                    break;
                };
                case "GRADE VII": {
                    rootdir = apiDetails.UPLOAD_DIR.GRADEVII.root;
                    notes = apiDetails.UPLOAD_DIR.GRADEVII.notes;
                    assignments = apiDetails.UPLOAD_DIR.GRADEVII.assignments;
                    break;
                };
                case "GRADE VIII": {
                    rootdir = apiDetails.UPLOAD_DIR.GRADEVIII.root;
                    notes = apiDetails.UPLOAD_DIR.GRADEVIII.notes;
                    assignments = apiDetails.UPLOAD_DIR.GRADEVIII.assignments;
                    break;
                };
                case "GRADE IX": {
                    rootdir = apiDetails.UPLOAD_DIR.GRADEIX.root;
                    notes = apiDetails.UPLOAD_DIR.GRADEIX.notes;
                    assignments = apiDetails.UPLOAD_DIR.GRADEIX.assignments;
                    break;
                };
                case "GRADE X": {
                    rootdir = apiDetails.UPLOAD_DIR.GRADEX.root;
                    notes = apiDetails.UPLOAD_DIR.GRADEX.notes;
                    assignments = apiDetails.UPLOAD_DIR.GRADEX.assignments;
                    break;
                }

            }
            logger.debug("requestId :: " + req.id + ":: Grade before replacing space  -" + grade);

            grade = grade.replace(/\s+/g, "-");
            logger.debug("requestId :: " + req.id + ":: Root Directory after replacing space  -" + grade);

            //Next Check if Grade Directory Exists
            let gradedir = path.join(uploaddir, rootdir);
            if (!fs.existsSync(gradedir)) {
                logger.debug("requestId :: " + req.id + ":: Creating Grade Directory  -" + gradedir);
                fs.mkdirSync(gradedir);
            } else {
                logger.debug("requestId :: " + req.id + ":: Grade Directory Exists -" + gradedir);
            }

            //Create the assignment/notes upload directory now
            let assignment_notes = "";
            if (uploadtype == "N") {
                assignment_notes = path.join(uploaddir, rootdir + "/" + notes + "/");
            } else {
                assignment_notes = path.join(uploaddir, rootdir + "/" + assignments + "/");
            }
            logger.debug("requestId :: " + req.id + ":: Assignment/Notes  Directory -" + assignment_notes);
            if (!fs.existsSync(assignment_notes)) {
                logger.debug("requestId :: " + req.id + ":: Creating Assignment/Notes Directory  -" + assignment_notes);
                fs.mkdirSync(assignment_notes);
            } else {
                logger.debug("requestId :: " + req.id + ":: Assignment/Notes Directory Exists -" + assignment_notes);
            }


            //Create the final directory with Month and year
            finaluploaddir = assignment_notes + _frmdFolder;
            logger.debug("requestId :: " + req.id + ":: finaluploaddir after adding month and year  -" + finaluploaddir);

            if (!fs.existsSync(finaluploaddir)) {
                logger.debug("requestId :: " + req.id + ":: Creating finaluploaddir Upload Directory -" + finaluploaddir);
                fs.mkdirSync(finaluploaddir);
            } else {
                logger.debug("requestId :: " + req.id + ":: finaluploaddir Directory Exists -" + finaluploaddir);
            }
            temp_file = file.path;
            file_type = file.type;
            fs.copyFile(file.path, path.join(finaluploaddir, file.name), fs.constants.COPYFILE_EXCL, function (err) {
                if (err) {
                    logger.debug("requestId :: " + req.id + ":: File copy failed due to  -" + err);
                } else {
                    logger.debug("requestId :: " + req.id + ":: File uploaded -" + file.name);
                    logger.debug("requestId :: " + req.id + ":: File type is -" + file.type);
                }
            });
        })
        .on('error', function (err) {
            logger.debug('An error has occured: \n' + err);
            res.send({ 'success': false, error: err });
        })
        .on('end', function () {
            try {
                logger.debug("requestId :: " + req.id + ":: Trying to delete temp file -" + temp_file);
                fs.unlink(temp_file, (err) => {
                    if (err) {  //throw err;
                        logger.debug("requestId :: " + req.id + ":: Delete of temp file failed -" + temp_file);
                        //    res.status(500).send(JSON.stringify(err))
                    } else {
                        logger.debug("requestId :: " + req.id + ":: Deleted temp file -" + temp_file);
                    }
                });
                //res.send({'success': true});
            } catch (err) {
                logger.debug("requestId :: " + req.id + ":: Exception while deleting temp file  -" + temp_file);
                res.status(500).send(JSON.stringify(err))
            }

            //Make the call to the trueleap-service to update the file details  
            var periodObj = {
                uploaddate: new Date(),
                uploadref: moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MMDDYYYYhhmmss'),
                file: typeof upload_file_name != 'undefined' && upload_file_name.length > 0 ? upload_file_name : "",
                path: typeof upload_file_name != 'undefined' && upload_file_name.length > 0 ? finaluploaddir : "",
                documenttype: uploadtype,
                mimetype: file_type,
                title: note_title,
                note: note_details,
                sharable: _status === 'PVT' ? false : true,
                submittedby:[]

            };
            let documntentis = {};
            if (uploadtype == "A" || uploadtype == "AS") {
                periodObj.validupto = moment(_validupto + "T00:00:00", "MM/DD/YYYYT00:00:00").toDate();
                documntentis = { $push: { "record.assignment": periodObj } }
            } else {
                documntentis = { $push: { "record.documents": periodObj } }
            }
            if(uploadtype=="AS"){ //Start of assignment submission
                logger.debug("requestId :: " + req.id + ":: Assignment submission by Student, updating the user colleciton and period collection ");
                async.waterfall([
                    function fetchuser(done) {
                        logger.debug("requestId :: " + req.id + ":: Fetching user profile details");
                        User.find(
                            { _id: _assignmentSubmitterUniqueId },
                            function (error, success) {
                                if (typeof success != 'undefined' && success.length > 0) {
                                    logger.debug("requestId :: " + req.id + ":: Fetching submitter profile  received -" + JSON.stringify(success));
                                    done(null, success)
                                }else{
                                    logger.debug("requestId :: " + req.id + ":: Fetching submitter profile Error -" + error);
                                    res.status(504).send(mapError.errorCodeToDesc(req.id , '504', "upload"));
                                }
                            });
                    },

                    function updateuser(success, done) {
                        logger.debug("requestId :: " + req.id + ":: Updating the User submisson assignment list");
                        //Enriching the Period Obj for student
                        periodObj.assignmentSubmitingAgainst=_assignmentSubmitingAgainst;
                        periodObj.assignmentforPeriod=_assignmentforPeriod;
                        periodObj.semester=success[0].profile.class[0].semester
                        User.findOneAndUpdate(
                            { _id: _assignmentSubmitterUniqueId },
                            { $push: { "record.assignment": periodObj } },
                            function (error, success) {
                                if (error) {
                                    logger.debug("requestId :: " + req.id + ":: Updating assignment submitter record Error -" + error);
                                } else {
                                    logger.debug("requestId :: " + req.id + ":: Updatign assignment submission Success -" + _assignmentSubmitterUniqueId);
                                    if (success === null) {
                                        logger.debug("requestId :: " + req.id + ":: Updating assignment submitter Error ");
                                    } else {
                                        logger.debug("requestId :: " + req.id + ":: Document Update response received -" + JSON.stringify(success));
                                    }
                                }
                                done(null, success)
                            });
                    },
                    function updateteacher(success, done) {
                        logger.debug("requestId :: " + req.id + ":: Updating the Period record for the assignment with the details of the submitter ");
                        //Enriching the Period Obj for Teacher
                        var queryPayload = { "_id": _assignmentforPeriod, "record.assignment.uploadref": _assignmentSubmitingAgainst };
                        var setto = {
                            name:_assignmentSubmittedBy,
                            grade:_assignmentSubmitterGrade,
                            section:_assignmentSubmitterSection,
                            uniqueuserid:_assignmentSubmitterUniqueId,
                            submittedon:_assignmentSubmissionDate,
                            assignmentref:periodObj.uploadref,
                            filename:periodObj.file,
                            uploadpath:periodObj.path
                        }
                        logger.debug("requestId :: " + req.id + ":: Updating the Period record for the assignment with the details of the submitter and query is  -"+JSON.stringify(queryPayload));
                        logger.debug("requestId :: " + req.id + ":: Updating the Period record for the assignment with the details of the submitter and the record is -"+JSON.stringify(setto));

                        var statusPayload = { $push: { "record.assignment.$.submittedby": setto } }
                        Period.update(queryPayload, statusPayload,{ "new": true, "upsert": true },(err, result) => {
                            if (err) {
                                logger.debug("requestId :: " + req.id + ":: error updatign the submitted array  -" + err);
                                res.status(500).send(mapError.errorCodeToDesc(req.id , '501', "updateperiod"));
                            } else {
                                logger.debug("requestId :: " + req.id  + ":: Updated Specific period Assignment status -" + JSON.stringify(statusPayload));
                                logger.debug("requestId :: " + req.id  + ":: Updated returned  Assignment status -" + JSON.stringify(result));
                                if(result.n===0){
                                    logger.debug("requestId :: " + req.id  + ":: Dint find the record in Assignment  -" + JSON.stringify(result));
                                    res.status(204).send(mapError.errorCodeToDesc(req.id , '204', "updateperiod"));
                                }else{
                                    logger.debug("requestId :: " + req.id  + ":: Updated for Assignment status -" + JSON.stringify(result));
                                    res.status(200).send(mapError.errorCodeToDesc(req.id , '200', "updateperiod"))
                                }
                            }
                        });
                    }
                ], (err) => {
                    if (err) {
                        logger.debug("requestId :: " + req.id  + ":: Updated for Assignment Async Err -" + err);
                        reject(mapError.errorCodeToDesc(req.id , '504', "updateperiod"))
                    }
                }); // End of Async waterfall
            }else{ ////End of assignment submission 
                logger.debug("requestId :: " + req.id + ":: This upload is for assignment or document upload by teacher");
                Period.findOneAndUpdate(
                    { _id: documentid },
                    documntentis,
                    function (error, success) {
                        if (error) {
                            logger.debug("requestId :: " + req.id + ":: Document Period Update Error -" + error);
                        } else {
                            logger.debug("requestId :: " + req.id + ":: Document Period Update Success -" + documentid);
                            if (success === null) {
                                logger.debug("requestId :: " + req.id + ":: Document Period Update Error ");
                                res.status(400).send(mapError.errorCodeToDesc(req.id, '400', "upload"))
                            } else {
                                logger.debug("requestId :: " + req.id + ":: Document Update response received -" + JSON.stringify(success));
                                res.status(200).send(mapError.errorCodeToDesc(req.id, '200', "upload"))
                            }
                        }
                    });
            }

            // res.send({'success': true});

        })
        .on('aborted', function () {
            logger.debug("requestId :: " + req.id + ":: Upload aborted by user");
            res.status(500).send(mapError.errorCodeToDesc(req.id, '502', "upload"))
        })

});
const mongoose = require('mongoose');

try {

    /**
     * Connect to Database.
     */

    mongoose.Promise = global.Promise;

    console.log("Mongo URL -" + apiDetails.PTU_MONGODB_URL);
    mongoose.connect(apiDetails.PTU_MONGODB_URL,
        {
            //useMongoClient: true
            keepAlive: 1,
            useNewUrlParser: true,
            useUnifiedTopology: true,

        });
    mongoose.connection.on('error', () => {
        console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
        process.exit();
    });


    // Code to run if we're in the master process
    if (cluster.isMaster) {
        let cpuCount = require('os').cpus().length;
        if (cpuCount === 1) {
            // Server is master and is not running in cluster
            server = require('http').createServer(uploadapp);

            server.listen(process.env.UPLOADPORT, '0.0.0.0',  () => {
                logger.info('Trueleap Service listening on %d, in %s mode',  process.env.UPLOADPORT, uploadapp.get('env'));
                logger.debug('%s App in HTTP mode is running at http://localhost:%d in %s mode', chalk.green('✓'),  process.env.UPLOADPORT, uploadapp.get('env'));
                logger.debug('  Press CTRL-C to stop\n');
            });

            /*server = require('https').createServer({

                key: fs.readFileSync(path.join(uploadappRoot, 'certificate/trueleap.key')),
                cert: fs.readFileSync(path.join(uploadappRoot, 'certificate/trueleap_io.chained.crt')),

                //ca: fs.readFileSync('certificate/gd_bundle-g2-g1.crt'),
            }, uploadapp).listen(process.env.UPLOADPORT, '0.0.0.0', function () {
                logger.debug('Worker Sharing PORT - %d, in %s mode', process.env.UPLOADPORT, uploadapp.get('env'));
                logger.debug('Trueleap Upload Service listening on %d, in %s mode', process.env.UPLOADPORT, uploadapp.get('env'));
                console.log('%s Truleap Upload in HTTPS mode is running at http://localhost:%d in %s mode', chalk.green('✓'), process.env.UPLOADPORT, uploadapp.get('env'));
                console.log('  Press CTRL-C to stop\n');

            });*/



        } else {
            logger.debug("Creating Worker for each CPU ")
            logger.debug('CPU Count is -' + cpuCount);
            logger.debug(`Master ${process.pid} is running`);
            // Create a worker for each CPU
            for (let i = 0; i < cpuCount; i += 1) {
                let id = i
                logger.debug('Forking for cluster -' + (++id));
                cluster.fork();
            }
            // Listen for dying workers
            cluster.on('exit', (worker, code, signal) => {
                logger.error(`worker ${worker.process.pid} died`);
            });
        }
    } else {
        //Start http server
        server = require('http').createServer(uploadapp);

        server.listen(process.env.UPLOADPORT, '0.0.0.0',  () => {
            logger.info('Trueleap Service listening on %d, in %s mode', process.env.UPLOADPORT, uploadapp.get('env'));
            console.log('%s App in HTTP mode is running at http://localhost:%d in %s mode', chalk.green('✓'), process.env.UPLOADPORT, uploadapp.get('env'));
            console.log('  Press CTRL-C to stop\n');
        });

        // Start server https
        /*server = require('https').createServer({
            key: fs.readFileSync(path.join(uploadappRoot, 'certificate/trueleap.key')),
            cert: fs.readFileSync(path.join(uploadappRoot, 'certificate/trueleap_io.chained.crt')),
            //ca: fs.readFileSync('certificate/gd_bundle-g2-g1.crt')
        }, uploadapp).listen(process.env.UPLOADPORT, '0.0.0.0', function () {
            // logger.info('Worker Sharing PORT - %d, in %s mode', config.uploadport, uploadapp.get('env'));
        });*/

    }
} catch (exp) {
    logger.error("exiting the process due to start up issues" + exp.stack);
}

function stop() {
    releaseDBConnection();
    server.close();
}

var releaseDBConnection = function () {
    mongoose.connection.close();
    process.exit();

}


process.on('SIGINT', releaseDBConnection);

process.on('SIGTERM', releaseDBConnection);

process.on('SIGQUIT', releaseDBConnection);

exports = module.exports = uploadapp;
