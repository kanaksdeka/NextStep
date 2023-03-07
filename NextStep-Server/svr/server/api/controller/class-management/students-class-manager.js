let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');

var _ = require("lodash");
var co = require('co');
const { resolve } = require('path');
const Period = require(path.join(appRoot, 'api/models/Period'));
const User=require(path.join(appRoot, 'api/models/User'));
const PeriodIndex = require(path.join(appRoot, 'api/models/PeriodIndex'));
const async = require('async');

let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));
var greatperiodDef=require(path.join(appRoot, '/api/services/class-service/getPeriod-service.js'));



exports.getindexclassesfortheday = function (req, res) {
    var logger = getLogger('getindexclassesfortheday');
    var param = {};
    var requestId = req.id;
    param.token = req.headers.authorization;


    co(function* () {
        if (logLevel === "DEBUG") 
            logger.debug("getindexclasses controller Start");
        param.token = req.headers.authorization;

        var initiatedby =typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
        logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

        param.ismobile=typeof req.query.ismobile!='undefined' && (req.query.ismobile=='true'||req.query.ismobile=='false')?req.query.ismobile:false
        if(typeof req.query.ismobile!='undefined' && param.ismobile=='true')
            param.ismobile=true;
        else if(typeof req.query.ismobile!='undefined' && param.ismobile=='false')
            param.ismobile=false;
        else if(typeof req.query.ismobile!='undefined' && param.ismobile!='false'||param.ismobile!='true')
           param.ismobile=false;
        else    
            param.ismobile=false;

        param.requestId = req.id;
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: getindexclassesfortheday:: Parameters Received -" + JSON.stringify(param));

        var getperiodObj = new greatperiodDef(param);
        var getIndexClasses = yield getperiodObj.getindexclassforstudent();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + param.requestId + ":: getindexclassesfortheday Controller :: getIndexClasses -" + JSON.stringify(getIndexClasses));
       // res.send(getIndexClasses);

        logger.debug("requestId :: " + param.requestId + ":: getindexclassesfortheday Controller :: getIndexClasses -" + JSON.stringify(getIndexClasses));
        var getallperiods = yield getperiodObj.getall(initiatedby);
        logger.debug("requestId :: " + param.requestId + ":: getindexclassesfortheday Controller :: getallperiods -" + JSON.stringify(getallperiods));
        res.send(getallperiods);
    }).catch(function (err) {
        logger.error("requestId :: " + requestId + " :: getindexclassesfortheday Exception - " +err+ ":: JSON Error -"+JSON.stringify(err));
        res.send(err)
    });

};



exports.capturemynotesfortheday = function (req, res) {

    let logger = getLogger('getindexclassesfortheday');
    let requestId = req.id;
    let authtoken= req.headers.authorization;


    try{
        if (logLevel === "DEBUG") 
            logger.debug("getindexclasses controller Start");
        var initiatedby =typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
        logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby);

        var notesbody={};
        let index_passed=false;
        let class_name_passed=false;
        let period_passed=false;
        let text_passed=false;

        if (!notesbody) {
            logger.error("requestId :: " + requestId + ":: please provide what you want to capture ");
            res.status(422).send(mapError.errorCodeToDesc(requestId, '422', "updateprofile"))
        } else {
            logger.debug("requestId :: " + requestId + ":: notesbody payload for capture -" ,notesbody);
        }

        var queryPayload = { "token.token": authtoken };
          
            async.waterfall([
                function enrichpayload(done) {
                    User.findOne(queryPayload, (err, user) => {
                        if (!user) {
                            logger.error("requestId :: " + requestId + ":: No user found with logged token ");
                            res.status(204).send(mapError.errorCodeToDesc(requestId, '204', "updateprofile"))
                        } else {
                            logger.debug("requestId :: " + requestId + ":: User found with email -" + user.email);
                        }
            
                        try{
                        //NOTE  only update fields that were actually passed...
                        if (req.body.notes.hasOwnProperty("parentperiodid") && typeof req.body.notes.parentperiodid != 'undefined'  && req.body.notes.parentperiodid.length>0) {
                            notesbody.indexperiod=req.body.notes.parentperiodid;
                            index_passed=true;
                        }
                        if (req.body.notes.hasOwnProperty("childperiodid") && typeof req.body.notes.childperiodid != 'undefined'  && req.body.notes.childperiodid.length>0) {
                            notesbody.period=req.body.notes.childperiodid;
                            period_passed=true;
                        }
                       if (req.body.notes.hasOwnProperty("classname") && typeof req.body.notes.classname != 'undefined'   && req.body.notes.classname.length>0) {
                            notesbody.class=req.body.notes.classname;
                            class_name_passed=true;
                        }
                        if (req.body.notes.hasOwnProperty("text") && typeof req.body.notes.text != 'undefined' && req.body.notes.text.length>0) {
                            notesbody.notetext=req.body.notes.text;
                            text_passed=true;
                        }
                    }catch(err){
                        return res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "updateprofile"))
                    }
                       
                        if((index_passed==false || period_passed==false || class_name_passed==false) && text_passed==false)
                            return res.status(422).send(mapError.errorCodeToDesc(requestId, '422', "updateprofile"))
                        else{

                            notesbody.section=user.profile.class[0].section;
                            notesbody.semester=user.profile.class[0].semester;
                            notesbody.date=new Date();
                            logger.debug("requestId :: " + requestId + " ::capturemynotesfortheday passign to update notes -",notesbody);
                            done(null, notesbody)
                        }
                        }).catch((error) => {
                            logger.error("requestId :: " + requestId + " :: capturemynotesfortheday Exception -" + error);
                            return res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "updateprofile"))
                        });
                },
                function update_profile(notesbody,done) {
                    if (logLevel === "DEBUG")   
                        logger.debug("requestId :: " + requestId + " :: capturemynotesfortheday Controller inside update_profile");

                        User.findOneAndUpdate(
                            queryPayload,
                            { $push: { "record.mynotes": notesbody } },
                            function (error, notes) {
                                if (error) {
                                    logger.debug("requestId :: " + req.id + ":: Updating notes Error -" + error);
                                } else {
                                    logger.debug("requestId :: " + req.id + ":: Updatign notes addition Success -" + notes);
                                    if (notes === null) {
                                        logger.debug("requestId :: " + req.id + ":: Updating notes addition Error ");
                                    } else {
                                        logger.debug("requestId :: " + req.id + ":: Document Update response received -",notes);
                                    }
                                }
                                return res.status(200).send(mapError.errorCodeToDesc(requestId, '200', "updateprofile"))
                            });
                }
            ])
    }catch (err) {
        logger.error("requestId :: " + requestId + " :: capturemynotesfortheday Exception -" + err);
        return res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "updateprofile"))
    }

}


exports.getmynotesforclass = function (req, res) {

    let logger = getLogger('getmynotesforclass');
    let requestId = req.id;
    let authtoken= req.headers.authorization;
    let periodid=req.body.periodid
    let queryPayload={"token.token":authtoken}

    try{
        if (logLevel === "DEBUG") 
            logger.debug("getmynotesforclass controller Start");
        var initiatedby =typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
        logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby);

        async.waterfall([
            function getUserDetails(done) {
                User.findOne(queryPayload, (err, user) => {
                        if (!user) {
                            logger.error("requestId :: " + requestId + ":: No user found with logged token ");
                            res.status(204).send(mapError.errorCodeToDesc(requestId, '204', "mynotes"))
                        } else {
                            logger.debug("requestId :: " + requestId + " :: getmynotesforclass passing to filter notes -",user.record.mynotes);
                            done(null, user.record.mynotes,user.profile.class[0].semester)
                        }
                    }).catch((error) => {
                        logger.error("requestId :: " + requestId + " :: getmynotesforclass Exception -" + error);
                        return res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "mynotes"))
                    });
            },
            function filternotes(noteslist,semester,done) {
                    logger.debug("requestId :: " + requestId + " :: getmynotesforclass Controller inside filternotes for semester -"+semester + " And period is -"+periodid);
                    logger.debug("requestId :: " + requestId + " :: getmynotesforclass Controller inside filternotes noteslist is -"+noteslist);

                    let notesarray=[];
                    noteslist.forEach(element => {
                        if(element.indexperiod==periodid && element.semester==semester){
                            var data={
                                "notes": element.notetext,
                                "capturedon": element.date
                            }
                            notesarray.push(data)
                        }
                    });
                    if(notesarray.length>0)
                        res.send(notesarray)
                    else
                        res.send(mapError.errorCodeToDesc(requestId, '204', "mynotes"))

            }
        ])
    }catch (err) {
        logger.error("requestId :: " + requestId + " :: getmynotesforclass Exception -" + err);
        return res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }

}