var log4js = require('log4js');
var fs = require('fs');
var path = require('path');
var appRoot = path.join(require('app-root-dir').get());
//var apiDetails = require(path.join(appRoot, 'server/api/config/settings.js'));
var logDirectory = appRoot + '/log'

// ensure log directory exists
if(fs.existsSync(logDirectory) === true){
  console.log("Log Folder exists in -"+ logDirectory);
} else{
   fs.mkdirSync(logDirectory);
  }

/*Log4js.Level  Description
OFF   =>   nothing is logged
FATAL => fatal errors are logged
ERROR => errors are logged
WARN  => warnings are logged
INFO  =>  infos are logged
DEBUG => debug infos are logged
TRACE => traces are logged
ALL   =>  everything is logged*/

function createUploadLog(filename){
 /* log4js.configure({
        appenders: [{
                "type": "dateFile",
                "filename":logDirectory + '/trlp-upload.log',
                "alwaysIncludePattern": true,
                "maxLogSize": 10485760, 
                "backups": 3, 
                "compress": true 
               }

    ]

  });*/
    log4js.configure({
    appenders: {
        fileLog: { 
          type: 'dateFile',
          "filename":logDirectory + '/trlp-upload.log',
          "pattern":"-yyyy-MM-dd",
          "alwaysIncludePattern": true,
          "disableClustering":false,
          "maxLogSize": 10485760, 
          "backups": 3, 
          "compress": true 
          },
        },
        categories: {
        fileLog: { appenders: ['fileLog'], level:'DEBUG'},
        default: { appenders: [ 'fileLog'],level:'DEBUG'}
        }

  });

  var logger = log4js.getLogger(filename);
  global.logLevel = "DEBUG"
 // logger.setLevel(global.logLevel);
  return logger;  
}

module.exports = createUploadLog;