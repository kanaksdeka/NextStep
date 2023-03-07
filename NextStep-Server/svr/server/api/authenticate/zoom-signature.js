const crypto = require('crypto')
const cors = require('cors')
let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let apiDetails = require(path.join(appRoot, 'api/config/settings.js'));


/* endpoint */
exports.zoomSignature = function (req, res) {
  const timestamp = new Date().getTime() - 30000
  const msg = Buffer.from(apiDetails.ZOOM.API_KEY + req.body.meetingNumber + timestamp + req.body.role).toString('base64')
  const hash = crypto.createHmac('sha256', apiDetails.ZOOM.API_SECRET).update(msg).digest('base64')
  //console.log('Api key: ' + apiDetails.ZOOM.API_KEY);
  const signature = Buffer.from(`${apiDetails.ZOOM.API_KEY}.${req.body.meetingNumber}.${timestamp}.${req.body.role}.${hash}`).toString('base64')

  res.json({
    signature: signature
  })
}