let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');

var _ = require("lodash");
var co = require('co');
const { resolve } = require('path');
const Period = require(path.join(appRoot, 'api/models/Period'));
const PeriodIndex = require(path.join(appRoot, 'api/models/PeriodIndex'));
const async = require('async');

let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));
var createperiodDef = require(path.join(appRoot, '/api/services/class-service/createPeriod-service.js'));
var greatperiodDef = require(path.join(appRoot, '/api/services/class-service/getPeriod-service.js'));
var updateperiodDef = require(path.join(appRoot, '/api/services/class-service/updatePeriod-service.js'));
var updatespecificperiodDef = require(path.join(appRoot, '/api/services/class-service/updateSpecificPeriod-service.js'));
let updateassignmentDef=require(path.join(appRoot, '/api/services/class-service/assignmentUpdate-service.js'));


exports.createperiod = function (req, res) {
    //return new Promise(function (resolve, reject) {
    var logger = getLogger('createperiod');
    var param = {};
    var requestId = req.id;

    co(function* () {
        if (logLevel === "DEBUG") {
            logger.debug("createperiod controller Start");
        }

        param.token = req.headers.authorization;
        param.requestPayload = req.body;
        param.requestId = req.id;

        var initiatedby =typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
        logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

        if (initiatedby != 1)
            return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))


        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: createperiod:: Parameters Received -" + JSON.stringify(param));

        var createperiodObj = new createperiodDef(param);
        var payloadValidation = yield createperiodObj.validateInputPayload();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + "::" + " validation status is:" + payloadValidation);
        var createindexClass = yield createperiodObj.createindexclass();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: createperiod Controller :: createindexClass -" + JSON.stringify(createindexClass));

        var createperiodStatus = yield createperiodObj.create();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: createperiod Controller :: createperiodStatus -" + JSON.stringify(createperiodStatus));
        if(createperiodStatus.totalCreated==0){
            logger.debug("requestId :: " + param.requestId + ":: createperiod Controller :: Deleting Index Class for no periods created - " ,createperiodStatus.totalCreated);
            var deleteindexClass = yield createperiodObj.deleteIndexClass();
            res.send(mapError.errorCodeToDesc(requestId, '502', "createperiod"));
          }else{
            logger.debug("requestId :: " + param.requestId + ":: createperiod Controller :: Classes created -",createperiodStatus.totalCreated);
            res.send(createperiodStatus);
        }
    }).catch(function (err) {
        logger.error("requestId :: " + requestId + " :: createperiod Exception -" + err);
        res.send(err)
    });

    // })

}




exports.getperiods = function (req, res) {
    var logger = getLogger('getperiods');
    var param = {};
    var requestId = req.id;

    co(function* () {
        if (logLevel === "DEBUG") {
            logger.debug("getperiods controller Start");
        }

        param.token = req.headers.authorization;
        param.requestPayload = req.body.teacherid;

        var initiatedby =typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
        logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

        param.ismobile = typeof req.query.ismobile != 'undefined' && (req.query.ismobile == 'true' || req.query.ismobile == 'false') ? req.query.ismobile : false
        if (typeof req.query.ismobile != 'undefined' && param.ismobile == 'true')
            param.ismobile = true;
        else if (typeof req.query.ismobile != 'undefined' && param.ismobile == 'false')
            param.ismobile = false;
        else if (typeof req.query.ismobile != 'undefined' && param.ismobile != 'false' || param.ismobile != 'true')
            param.ismobile = false;
        else
            param.ismobile = false;

        param.requestId = req.id;
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: getperiods:: Parameters Received -" + JSON.stringify(param));

        var getperiodObj = new greatperiodDef(param);
        var getIndexClasses = yield getperiodObj.getindexclass();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: getperiods Controller :: getIndexClasses -" +getIndexClasses);
        //var getallperiods = getIndexClasses
        var getallperiods = yield getperiodObj.getall(initiatedby);
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: getperiods Controller :: getallperiods -",getallperiods.length);
        res.send(getallperiods);
    }).catch(function (err) {
        logger.error("requestId :: " + requestId + " :: getperiods Exception -" + err);
        res.send(err)
    });

};


exports.getindexclasses = function (req, res) {
    var logger = getLogger('getindexclasses');
    var param = {};
    var requestId = req.id;

    var initiatedby =typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
    logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

    if (initiatedby !=1)
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))

    co(function* () {
        if (logLevel === "DEBUG")
            logger.debug("getindexclasses controller Start");
        param.token = req.headers.authorization;
        param.requestId = req.id;
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: getindexclasses:: Parameters Received -" + JSON.stringify(param));

        var getperiodObj = new greatperiodDef(param);
        var getIndexClasses = yield getperiodObj.getindexclassforadmin();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: getindexclasses Controller :: getIndexClasses -" + JSON.stringify(getIndexClasses));
        res.send(getIndexClasses);
    }).catch(function (err) {
        logger.error("requestId :: " + requestId + " :: getindexclasses Exception -" + err);
        res.send(err)
    });

};



exports.updateperiod = function (req, res) {
    var logger = getLogger('updateperiod');
    var param = {};
    var requestId = req.id;

    co(function* () {
        if (logLevel === "DEBUG") {
            logger.debug("updateperiod controller Start");
        }


        var initiatedby =typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
        logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

        if (initiatedby != 1)
            return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))

        param.token = req.headers.authorization;
        param.requestPayload = req.body;
        param.requestId = req.id;
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: updateperiod:: Parameters Received -",param);
        
        var updateperiodObj = new updateperiodDef(param);
        var payloadValidation = yield updateperiodObj.validateInputPayload();

        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + "::" + " validation status is:" + payloadValidation);

       var updateperiodres = yield updateperiodObj.update();

        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: updateperiod Controller :: updateperiodres -" + JSON.stringify(updateperiodres));
        //res.send(updateperiodres);
        res.send(mapError.errorCodeToDesc(requestId, '200', "metadata"))
    }).catch(function (err) {
        logger.error("requestId :: " + requestId + " :: updateperiod Exception -" + err);
        res.send(err)
    });

};



exports.updatespecificperiod = function (req, res) {
    var logger = getLogger('updatespecificperiod');
    var param = {};
    var requestId = req.id;

    co(function* () {
        if (logLevel === "DEBUG") {
            logger.debug("updatespecificperiod controller Start");
        }


        var initiatedby =typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
        logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

        if (initiatedby === 2)
            return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))

        param.token = req.headers.authorization;
        param.requestPayload = req.body;
        param.requestId = req.id;
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: updatespecificperiod:: Parameters Received -",param);

        var updateperiodObj = new updatespecificperiodDef(param);
        var payloadValidation = yield updateperiodObj.validateInputPayload();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + "::" + " validation status is:" + payloadValidation);

        var updateperiodres = yield updateperiodObj.update();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: updatespecificperiod Controller :: updateperiodres - success") //+ JSON.stringify(updateperiodres));
        res.send(updateperiodres);
    }).catch(function (err) {
        logger.error("requestId :: " + requestId + " :: updatespecificperiod Exception -" + err);
        res.send(err)
    });

};


exports.documentstatus = function (req, res) {
    var logger = getLogger('documentstatus');
    var param = {};
    var requestId = req.id;

    co(function* () {
        if (logLevel === "DEBUG") {
            logger.debug("documentstatus controller Start");
        }


        var initiatedby = typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
        logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

        if (initiatedby === 2)
            return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))

        param.token = req.headers.authorization;
        param.requestPayload = req.body;
        param.requestId = req.id;
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: documentstatus:: Parameters Received -" + JSON.stringify(param));

        var updateperiodObj = new updatespecificperiodDef(param);
        var payloadValidation = yield updateperiodObj.validateInputPayload();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + "::" + " validation status is:" + payloadValidation);

        var updateperiodres = yield updateperiodObj.changestatus();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: documentstatus Controller :: updateperiodres - success") //+ JSON.stringify(updateperiodres));
        res.send(updateperiodres);
    }).catch(function (err) {
        logger.debug("requestId :: " + requestId + " :: documentstatus Exception -" + err);
        res.send(JSON.stringify(err))
    });

};


exports.getalldocumentsforperiods = function (req, res) {
    var logger = getLogger('getalldocumentsforperiods');
    var param = {};
    var requestId = req.id;

    co(function* () {
        if (logLevel === "DEBUG") {
            logger.debug("getalldocumentsforperiods controller Start for class -" + req.body.classindex);
        }
        var initiatedby = typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
        logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

        param.token = req.headers.authorization;
        param.requestPayload = req.body.classindex;
        param.requestId = req.id;

        logger.debug("requestId :: " + param.requestId + ":: getalldocumentsforperiods:: Parameters Received -" + JSON.stringify(param.requestPayload));

        var getperiodObj = new greatperiodDef(param);
        /*var getIndexClasses = yield getperiodObj.getindexclass();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: getalldocumentsforperiods Controller :: getIndexClasses -" + JSON.stringify(getIndexClasses));
        */
        var dochistory = yield getperiodObj.getallDocs(initiatedby);
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: getalldocumentsforperiods Controller :: dochistory -" + JSON.stringify(dochistory));
        res.send(dochistory);
    }).catch(function (err) {
        logger.error("requestId :: " + requestId + " :: getalldocumentsforperiods Exception -" + err);
        res.send(err)
    });

};



exports.deletedocument = function (req, res) {
    let logger = getLogger('deletedocument');
    let requestId = req.id
    co(function* () {
        let periodid =typeof req.body.id!='undefined' && req.body.id.length>0?req.body.id:"";
        let documentid = typeof req.body.documentid!='undefined'&&req.body.documentid.length>0?req.body.documentid:"";
        let type = typeof req.body.type!='undefined'&&req.body.type.length>0?req.body.type:"";
        let queryPayload ={ "_id": periodid }
        if (type.toLowerCase() === 'n' && periodid.length>0 && documentid.length>0) {
            Period.findOneAndUpdate(queryPayload, { $pull: { "record.documents": { 'uploadref': documentid } } }, { returnNewDocument: true }, function (err, data) {
                if (err) {
                    logger.debug("requestId :: " + requestId + ":: deletedocument err -" + err);
                    res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "updateperiod"))
                }
                res.json(data.record);
            }).catch((error) => {
                logger.error("requestId :: " + requestId + " :: deletedocument Exception -" + error);
                res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "updateperiod"))
            });
        }else if (type.toLowerCase() === 'a' && periodid.length>0 && documentid.length>0) {
            Period.findOneAndUpdate(queryPayload, { $pull: { "record.assignment": { 'uploadref': documentid } } }, { returnNewDocument: true }, function (err, data) {
                if (err) {
                    logger.debug("requestId :: " + requestId + ":: deletedocument err -" + err);
                    res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "updateperiod"))
                }
                res.json(data.record);
            }).catch((error) => {
                logger.error("requestId :: " + requestId + " :: deletedocument Exception -" + error);
                res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "updateperiod"))
            });
        } else {
            logger.error("requestId :: " + requestId + " :: Invalid Parameter for deletion " + JSON.stringify(req.body));
            res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "updateperiod"))
        }
        
    })
}


exports.teachersinputforassignment = function (req, res) {
    let logger = getLogger('teachersinputforassignment');
    let param = {};
    let requestId = req.id;

    co(function* () {
        if (logLevel === "DEBUG") {
            logger.debug("teachersinputforassignment controller Start");
        }

        var initiatedby = typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
        logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

        if (initiatedby == 2){
            return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))
        }else{
            //logger.debug("Inside else- ",req)
            param.token = req.headers.authorization;
            param.periodid = req.body.periodid;
            param.submittedassignmentid=req.body.assignmentidSubmitted;
            param.submittedagainstassignmentid=req.body.asssignmentidFor;
            param.assignmentsubmittedby=req.body.assignmentsubmittedby;
            param.status=req.body.assignmentstatus;
            param.marks = req.body.marks;
            param.subjectname=req.body.subjectname;
            param.teachername=req.body.teachername;
            param.semester=req.body.semester;
            //param.submittedagainstassignmentid=req.body.submittedagainstassignmentid
            param.assignmentname=req.body.assignmentname;
            param.assignmentpath=req.body.assignmentpath;
            //param.submittedassignmentid=req.body.submittedassignmentid;
            param.submittedassignmentname=req.body.submittedassignmentname;
            param.submittedassignmentpath=req.body.submittedassignmentpath;
            param.requestId=requestId;
            if (logLevel === "DEBUG")
                logger.debug("requestId :: " + requestId + ":: teachersinputforassignment:: Parameters Received -" + JSON.stringify(param));

            let updateassginment = new updateassignmentDef(param);
                let updateassignemntres =yield updateassginment.captureteacherinput();
                if (logLevel === "DEBUG")
                    logger.debug("requestId :: " + requestId + ":: teachersinputforassignment Controller :: updateassignemntres - success",updateassignemntres);
                res.send(updateassignemntres);
        }
    }).catch(function (err) {
        logger.debug("requestId :: " + requestId + " :: teachersinputforassignment Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "updateSpecificStdAssignment"))
    });

};