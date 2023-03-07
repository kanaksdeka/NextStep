'use strict';
let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let encryptionDecryption = require(path.join(appRoot, '/utils/aes-encryption-decryption.js'));

// Production specific configurations

let db_username = '%db.mongodb.user%';
let db_password = '%db.mongodb.pass%';
let db_replicaset = '%db.mongodb.replicaset%';
let db_name = '%db.mongodb.name%';
let replicaName = '%db.mongodb.replicaName%';
let db_config = '';
if(replicaName && replicaName !== ''){
    db_config = db_name +'?replicaSet='+replicaName;
}else{
    db_config = db_name;
}
let geturl = function() {
    let url;
    if (db_username && db_username !== '') {
        let encryptionDecryptionObj = new encryptionDecryption();
        let decryptedPassword = encryptionDecryptionObj.decrypt(db_password);
            console.log("decryptedPassword"+ decryptedPassword);
        url = 'mongodb://' +
            db_username +
            ':' +
            decryptedPassword +
            '@' +
            db_replicaset +
            '/' +
            db_config
    } else {
        url = 'mongodb://' +
            db_replicaset +
            '/' +
            db_config
    }
    console.log('url' + url);
    return url;
};

let url = geturl();


module.exports = {

    mongo_url: url,
    mock:false,
    timeout: '%timeout%',
    logLevel: '%logLevel%',
    ttl:'%ttl%',
    email:{
        host:'%email.host%',
        user: '%email.user%',
        password: '%email.password%',
        sendermail:'%email.sendermail%',
        verificationurl:'%email.verificationurl%',
        accountResetUrl:'%email.accountResetUrl%'


    },
    elastic:{
        host:'%elastic.host%',
        username:'%elastic.username%',
        password:'%elastic.password%',
        protocol:'%elastic.protocol%',
        port:'%elastic.port%',
        index:'%elastic.index%'
    },
    opco:{
        country: '%opco.country%',
        currency: '%opco.currency%'
    },
    default:{
        password:'%opco.password%',
    },
    tdb_hostIP : '%tdb.hostIP%',
    tdb_username: '%tdb.username%',
    tdb_password: '%tdb.password%',
    tdb_name: '%tdb.dbName%',
    aws_s3:{
        bucket:'%aws_s3.bucket%',
        signatureVersion: '%aws_s3.signatureVersion%',
        accessKeyId: '%aws_s3.accessKeyId%',
        secretAccessKey: '%aws_s3.secretAccessKey%',
        region: '%aws_s3.region%',
        acl:'%aws_s3.acl%',
        signedurlexpiry:900 
    },
};