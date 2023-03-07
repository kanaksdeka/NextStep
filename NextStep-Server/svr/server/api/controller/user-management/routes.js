'use strict';
/**
 * [appRouter Application routes]
 * @param  {[object]} app
 */
let request = require('request');
let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let app = require(path.join(appRoot, 'trlp.js'));
let api_config = require(path.join(appRoot,'/api/config/settings.js'));

let appRouter = function(app) {
  let routes = {
                    getplan : require('./populate-meta-data-manager.js').populatePlanData
                }
  api1.get('/getplan',function(req,res,next){console.log("Going to call getplan");next();},routes.getplan);
};

module.exports = appRouter;
