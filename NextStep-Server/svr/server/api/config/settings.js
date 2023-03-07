var config = require('../../config/environment');
//let path = require('path');
//let config =  path.join(require('app-root-dir').get(), '/server/config/environment/development.js');

/**
 * [API Configurations]
 * @type {Object}
 */
var api_config = {
    "aws_s3":{
        "bucket":config.aws_s3.bucket,
        "signatureVersion": config.aws_s3.signatureVersion,
        "accessKeyId": config.aws_s3.accessKeyId,
        "secretAccessKey": config.aws_s3.secretAccessKey,
        "region": config.aws_s3.region,
        "acl":config.aws_s3.acl,
        "signedurlexpiry":config.aws_s3.signedurlexpiry
    },
    "UPLOAD_DIR":{
        "GRADEI":{
            "root":"GRADEI",
            "notes":"notes",
            "assignments":"assignments"
        },
        "GRADEII":{
            "root":"GRADEII",
            "notes":"notes",
            "assignments":"assignments"
        },
        "GRADEIII":{
            "root":"GRADEIII",
            "notes":"notes",
            "assignments":"assignments"
        },
        "GRADEIV":{
            "root":"GRADEIV",
            "notes":"notes",
            "assignments":"assignments"
        },
        "GRADEV":{
            "root":"GRADEV",
            "notes":"notes",
            "assignments":"assignments"
        },
        "GRADEVI":{
            "root":"GRADEVI",
            "notes":"notes",
            "assignments":"assignments"
        },
        "GRADEVII":{
            "root":"GRADEVII",
            "notes":"notes",
            "assignments":"assignments"
        },
        "GRADEVIII":{
            "root":"GRADEVIII",
            "notes":"notes",
            "assignments":"assignments"
        },
        "GRADEIX":{
            "root":"GRADEIX",
            "notes":"notes",
            "assignments":"assignments"
        },
        "GRADEX":{
            "root":"GRADEX",
            "notes":"notes",
            "assignments":"assignments"
        }
    },
    "ZOOM":{
        "API_KEY":"4QeYXqSARl6a1joypX8L-w",
        "API_SECRET":"p6ZYS5YZBvnBuSl4hwghPvUCpyxfOefA3IwY"
    },
    "PTU_MONGODB_URL": config.mongo_url,
    "PTU_API_URL": config.ptu_data_service_url,
    "default_language": "en",
    "mock": config.mock,
    "API_TIME_OUT": config.timeout, 
    "LOG_LEVEL": config.logLevel,
    "TTL":config.ttl,
    "opco":{
        country: config.opco.country,
        currency: config.opco.currency
    },
    "email":{
        host:config.email.host,
        user: config.email.user,
        password: config.email.password,
        sendermail:config.email.sendermail,
        verificationurl:config.email.verificationurl,
        accountResetUrl:config.email.accountResetUrl
    },
    "default":{
        password:config.default.password
    },
    "TDB_HOST_IP" : config.tdb_hostIP,
    "TDB_USER_NAME": config.tdb_username,
    "TDB_PASSWORD": config.tdb_password,
    "TDB_DB_NAME": config.tdb_name,
    "elastic":{
        host:config.elastic.host,
        username:config.elastic.username,
        password:config.elastic.password,
        protocol:config.elastic.protocol,
        port:config.elastic.port,
        index:config.elastic.index
    }
     
}
module.exports = api_config;

