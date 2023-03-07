'use strict';

// Development specific configuration
let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let encryptionDecryption = require(path.join(appRoot, '/utils/aes-encryption-decryption.js'));
let encryptionDecryptionObj = new encryptionDecryption();
//local
let enecryptedPassword = encryptionDecryptionObj.encrypt('tecnotree');//Pr0t3ct3Dd8AdW1n (admin) Pr0t3ct3Dd8n53R (user)
console.log("enecryptedPassword----------------------"+enecryptedPassword);

let db_username = '';
let db_password =''; //Encrypted Password for tecnotree , which is local
let db_replicaset = '127.0.0.1:27017';

//Production
/*let enecryptedPassword = encryptionDecryptionObj.encrypt('Pr0t3ct3Dd8n53R');//Pr0t3ct3Dd8AdW1n (admin) Pr0t3ct3Dd8n53R (user)
console.log("enecryptedPassword----------------------"+enecryptedPassword);

let db_username = 'service_user';
let db_password ='7m0wZ7PFJ9RVe16bqnl+kA=='; //Encrypted Password for dragon

let db_replicaset = '127.0.0.1:27017';*/

let db_name = 'TRLPDB';
let replicaName = ''
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
    console.log('url  ' + url);

    return url;
};

let url = geturl();
module.exports = {
    mongo_url: url,
    mock:false,
    timeout:60000,
    logLevel: "DEBUG",
    ttl:1, //Token expiry is set to 1 hours
    email:{
        host:'mail.privateemail.com',
        user: 'admin@ternarylogics.com',
        password: 'Itspersonal@35330',
        sendermail:'admin@ternarylogics.com',
        //verificationurl:'https://api.trueleap.io/service/'
        verificationurl:'https://trueleap.io/#/activate/',
        accountResetUrl:'https://trueleap.io/#/account/reset?token='
    },
    elastic:{
        host:'15.207.21.129',
        username:'elastic',
        password:'trueleap',
        protocol:'http',
        port:'9200',
        index: 'truleap_docs'
    },
    opco:{
        country: "IN",
        currency: "INR"
    },
    default:{
        password:'trueleap'
    },
    tdb_hostIP : '127.0.0.1',
    tdb_username: 'root',
    tdb_password: 'Bangalore',
    tdb_name: 'TRLPDB',
    aws_s3:{
        bucket:"upload.trueleap.in",
        signatureVersion: "v4",
        accessKeyId: "AKIAXZ3OA223V2ASXNNW",
        secretAccessKey: "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",
        region: "us-west-2",
        acl:"public-read",
        signedurlexpiry:900 
    },

};

