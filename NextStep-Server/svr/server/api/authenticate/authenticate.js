/**
 * [appRouter Application routes]
 * @param  {[object]} app
 */
const co = require('co');
var path = require('path');
var _ = require("lodash");
let appRoot = path.join(require('app-root-dir').get(), '/server/');
var crud = require(path.join(appRoot, 'api/services/dao-mongo/crud/crud_operations.js'));
let mapError = require(path.join(appRoot, '/utils/codeToErrorMapping.js'));
let apiDetails = require(path.join(appRoot, '/api/config/settings.js'));
let moment = require("moment");



const User = require('../models/User');


function hasExpired(created) {
    var a = moment(new Date());
    var diff = a.diff(created, 'hours');
    //console.log('Diff is -' + diff);
    //console.log('TTL configured -' + apiDetails.TTL);
    return diff > apiDetails.TTL
};



/**
 * [Access token validation and fetches user information]
 * @param  {[object]}   req
 * @param  {[object]}   res
 * @param  {Function} next
 * @return {[object]}        [Returns user info]
 */
function authentication(req, res, next) {
    var logger = getLogger('Authenticate');


    var requestId = req.id;
    var token = _.hasIn(req.headers, "authorization") && req.headers.authorization !== 'undefined' && req.headers.authorization.length > 0 ? req.headers.authorization : 0;
    if (token == 0){
        logger.debug("access Token not found");
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '401', "authentication"))
    }
    else {

        if (logLevel === "DEBUG") {
            logger.debug("access Token " + req.headers.authorization);
        }
        var queryPayload = {};
        queryPayload["$and"] = [];
        queryPayload["$and"].push({ "token.token": token });


        co(function* () {
            var authenticateRes = yield crud.getOne('user', User, queryPayload, requestId, 'authentication');

            if (authenticateRes.length == 0)
                return res.status(401).send(mapError.errorCodeToDesc(requestId, '401', "authentication"))
            else
                logger.debug("requestId :: " + requestId + " :: Authentication Response-", authenticateRes[0]._id);



            var validToken = hasExpired(new Date(authenticateRes[0].token.createdOn));
            //var validToken=true;
            if (validToken === true) {
                res.status(401).send(mapError.errorCodeToDesc(requestId, '402', "authentication"))
            } else {
                if (logLevel === "DEBUG")
                    logger.debug("requestId :: " + requestId + " :: Authentication Success");
                //modify the request body here
                var initiatedby = authenticateRes[0].category.categoryType != 'undefined' && authenticateRes[0].category.categoryType.length > 0 ? authenticateRes[0].category.categoryType : 0
                // if(initiatedby==0 || initiatedby!='A')
                if (initiatedby == 'S')
                    req.body.initiatedby = 2
                else if (initiatedby == 'T')
                    req.body.initiatedby = 3
                else
                    req.body.initiatedby = 1
                next()
            }
        }).catch(function (err) {
            logger.error("requestId :: " + requestId + ":: authentication Controller Exception -" + err + ": JSON Error -" + JSON.stringify(err));
            res.status(401).send(mapError.errorCodeToDesc(requestId, '503', "authentication"))
        });
    }
}



module.exports = authentication;