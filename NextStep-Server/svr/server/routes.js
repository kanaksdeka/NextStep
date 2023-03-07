/**
 * Main application routes
 */

'use strict';


var appRouter = function(app) {
	require('./api/routes/routes.js')(app);
 
};

module.exports = appRouter;