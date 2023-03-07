let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let errormapping = require(path.join(appRoot, '/utils/errormapping.js'));



//var errormapping = require('./errormapping.js')

exports.errorCodeToDesc=function(requestId, code,module) {
    var logger = getLogger('ErrorMapping');

       /* console.log("Request id -"+requestId);
        console.log("module -"+module);
        console.log("code -"+code);*/



        var errorCode = errormapping[module][code].resCode;
        var errorDesc = errormapping[module][code].resDesc;
        var mappedError={
            "code":errorCode,
            "desc":errorDesc
        }

        if (logLevel === "DEBUG") {
            logger.debug("requestId :: " + requestId + ":: errorCodeToDesc :: Mapped Error is -" + JSON.stringify(mappedError));
        }

        return(mappedError);
}


//module.exports = errorCodeToDesc;
