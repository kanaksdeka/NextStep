let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));


exports.refreshcache = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('refreshcache');
    logger.debug("requestId :: " + requestId + " :: Inside refreshcache");
    var initiatedby = typeof req.body.initiatedby != 'undefined' && req.body.initiatedby > 0 ? req.body.initiatedby : 0;
    logger.debug("requestId :: " + requestId + ":: Initiated by is -" + req.body.initiatedby)

    if (initiatedby != 1 && initiatedby != 3)
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '403', "authentication"))
    try {
        mapper.fillSubjectMap();
        mapper.fillSectionMap();
        mapper.fillSemesterMap();
        mapper.fillClassMap();
        mapper.fillTeacherMap();
        mapper.fillStudentMap();
        res.status(200).send(mapError.errorCodeToDesc(requestId, '200', "metadata"))

    } catch (err) {
        logger.error("requestId :: " + requestId + " :: refreshcache Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};


