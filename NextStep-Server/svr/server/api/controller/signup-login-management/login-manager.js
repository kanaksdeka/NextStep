const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const co = require('co');
let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let apiDetails = require(path.join(appRoot, '/api/config/settings.js'));


let secureRandom = require('secure-random');

let nJwt = require('njwt');

let crud = require(path.join(appRoot, '/api/services/dao-mongo/crud/crud_operations.js'));

let mapError = require(path.join(appRoot, '/utils/codeToErrorMapping.js'));
let encryptionDecryption = require(path.join(appRoot, '/utils/aes-encryption-decryption.js'));

let getSequence = require(path.join(appRoot, 'api/services/dao-mongo/crud/generate-sequence.js'));

const User = require(path.join(appRoot, 'api/models/User'));
const logger = getLogger('profile-loggerlogin-manager');

const sequenceCollectionName = 'sequences';


/**
 * POST /login
 * Sign in using email and password.
 */

function validate(tempUser, password) {
    let tempPassword = new encryptionDecryption();
    let passwordFromCollection = tempUser.password;
    let _pass = tempPassword.encrypt(password);
    if (passwordFromCollection == _pass)
        return true;
    else
        return false
}


exports.login = function (req, res) {
    let requestId = req.id;
    const logger = getLogger('post-login');
    let signingKey = secureRandom(256, {
        type: 'Buffer'
    }); // Create a highly random byte array of 256 bytes 


    if (typeof req.body.email == 'undefined' || typeof req.body.password == 'undefined')
        //return handleError(res, "INVALID");
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '401', "login"))



    let claims = {
        iss: "http://www.trueleap.io/", // The URL of my service 
        sub: req.body.email, // The email of the user in my system 
        scope: "self"
    }

    let jwt = nJwt.create(claims, signingKey);


    if (logLevel === "DEBUG") {
        logger.debug("requestId :: " + requestId + " :: login Controller");
    }


    /*  req.assert('email', 'Email is not valid').isEmail();
      req.assert('password', 'Password cannot be blank').notEmpty();
  
      const errors = req.validationErrors();
  
      if (errors === 'false') {
          logger.error("requestId :: " + requestId + " :: login Controller invalid email/password format");
          return res.status(401).send(mapError.errorCodeToDesc(requestId, '401', "login"))
  
      }*/
    if (logLevel === "DEBUG")
        logger.debug("requestId :: " + requestId + " :: Going to call Passport authenticate");


    /*    let  queryPayload = {
                email: req.body.email
        };*/

    co(function* () {
        try {
            nev.checkMailValidated(req.body.email, requestId, function (err, key) {
                let email = req.body.email;

                if (key === 'continue') {
                    if (logLevel === "DEBUG")
                        logger.debug("requestId :: " + requestId + ":: login Controller :: Going to Verify in user collection for -" + JSON.stringify(req.body.email));
                    /*                    passport.authenticate('local',(err, user, info) => {
                                            if (err || !user) {
                                                logger.error("requestId :: " + requestId + ":: login Controller Error during authenticate");
                                                handleError(res, 'UNAUTHORIZED', info);*/

                    var fetchqueryPayload = {};
                        fetchqueryPayload["$and"] = [];
                        fetchqueryPayload["$and"].push({ "email": req.body.email});
                        fetchqueryPayload["$and"].push({ "status.profilestat": true});
                    User.findOne(/*{
                        email: req.body.email
                    }*/fetchqueryPayload, (err, user) => {
                        if (err) {
                            //handleError(res, 'INTERNAL_SERVER', err);
                            return res.status(401).send(mapError.errorCodeToDesc(requestId, '401', "login"))

                        }
                        if (!user) {
                            //handleError(res, "NO_CONTENT");
                            return res.status(500).send(mapError.errorCodeToDesc(requestId, '204', "login"))

                        }
                        //});
                        //console.log("User Details -"+JSON.stringify(user));
                        let matching = validate(user, req.body.password);
                        if (!matching) {
                            logger.error("requestId :: " + requestId + ":: login Controller Error during authenticate");
                            // handleError(res, 'UNAUTHORIZED',"Invalid Credentials");
                            return res.status(403).send(mapError.errorCodeToDesc(requestId, '403', "login"))

                        } else {

                            req.logIn(user, {
                                session: false
                            }, (err) => {
                                if (err) {
                                    logger.error("requestId :: " + requestId + ":: login Controller Error logging in");
                                    //handleError(res, 'UNAUTHORIZED', err);
                                    return res.status(403).send(mapError.errorCodeToDesc(requestId, '403', "login"))

                                } else {
                                    if (logLevel === "DEBUG") {
                                        logger.debug("requestId :: " + requestId + " :: Login success for =" + JSON.stringify(req.body.email));
                                    }
                                    //Create a token and add to user and save
                                    /*                    let  token = jwt.encode({
                                                            email: user.email,
                                                            time: new Date().getTime()
                                                            
                                                        }, tokenSecret);
                                                        user.token = jwt*/
                                    ;
                                    let queryPayload = {
                                        "email": user.email
                                    };

  

                                    let finalUpdateQuery = {
                                        $set: {
                                            "token": {
                                                "createdOn": new Date(),
                                                "token": jwt
                                            }
                                        }
                                    };
                                    co(function* () {
                                        let updateRes = yield crud.updateData('user', User, queryPayload, finalUpdateQuery, requestId, 'login');
                                    }).catch(function (err) {
                                        logger.error("requestId :: " + requestId + ":: login Controller Exception -" + err + ": JSON Error -" + JSON.stringify(err));
                                        //handleError(res, 'EXCEPTION', err);
                                        return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "login"))


                                    });
                                    let token = jwt.compact();
                                    res.send(200, {
                                        'token': token,
                                        'id': user._id,
                                        'profile': user.profile,
                                        'status': {
                                            'profilestat': user.status.profilestat
                                        },
                                        'category': user.category.categoryType
                                        // 
                                    });
                                }
                            });
                        }
                    });
                    //})(req, res);
                } else if (key === 'forbidden') {
                    logger.error("requestId :: " + requestId + ":: login Controller :: Forbidden as email not verified is -" + email);
                    //  handleError(res, "FORBIDDEN");
                    return res.status(403).send(mapError.errorCodeToDesc(requestId, '403', "login"))

                }
                else {
                    logger.error("requestId :: " + requestId + ":: login got an Error from email_verification  -" + err);
                    //handleError(res, 'INTERNAL_SERVER', err);
                    return res.status(501).send(mapError.errorCodeToDesc(requestId, '501', "login"))

                }
            });
        } catch (err) {
            logger.error("requestId :: " + requestId + ":: login catch block  -" + err);
            //handleError(res, 'EXCEPTION', err);
            return res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "login"))

        }
    }).catch(function (err) {
        logger.error("requestId :: " + requestId + ":: login Controller  -" + err);
        //handleError(res, 'EXCEPTION', err);
        return res.status(502).send(mapError.errorCodeToDesc(requestId, '502', "login"))

    });
};



/**
 * POST /logout
 * Log out.
 */
exports.logout = function (req, res) {
    let requestId = req.id;
    let email = req.body.email;
    let token = req.headers.authorization;
    const logger = getLogger('logout');


    req.assert('email', 'Email is not valid').isEmail();
    /*req.sanitize('email').normalizeEmail({
        remove_dots: false
    });*/

    const errors = req.validationErrors();

    if (errors === 'false') {
        logger.error("requestId :: " + requestId + " :: logout Controller invalid email format");
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '502', "logout"))

    }

    try {
        if (logLevel === "DEBUG") {
            logger.debug("requestId :: " + requestId + " :: Logout Called ");
            logger.debug("requestId :: " + requestId + " :: Logout Headers -" + JSON.stringify(req.headers));
            logger.debug("requestId :: " + requestId + " :: Logout For -" + JSON.stringify(email));
        }

        let queryPayload = {};
        queryPayload["$and"] = [];
        queryPayload["$and"].push({
            "email": email
        });
        queryPayload["$and"].push({
            "token.token": token
        });


        let finalUpdateQuery = {
            $set: {
                "token": null
            }
        };
        co(function* () {
            let updateRes = yield crud.updateData('user', User, queryPayload, finalUpdateQuery, requestId, 'logout');
            return res.status(200).send(mapError.errorCodeToDesc(requestId, '200', "logout"))

        }).catch(function (err) {
            logger.error("requestId :: " + requestId + ":: logout Controller Exception -" + err + ": JSON Error -" + JSON.stringify(err));
            return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "logout"))

        });
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: Logout Exception -" + err);
        return res.status(500).send(mapError.errorCodeToDesc(requestId, '503', "logout"))
    }
};

/**
 * POST /account/forgot/password
 * Process the reset password request.
 */

function generateRandomPassword() {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

exports.forgotpassword = (req, res, next) => {

    const logger = getLogger('forgotpassword');
    let resetTokenInMail = "";
    let resetUrl="";
    /*req.assert('email', 'Email is not valid').isEmail();
    req.sanitize('email').normalizeEmail({
        remove_dots: false
    });*/
    let requestId = req.id;

    try {
        /* const errors = req.validationErrors();
 
         if (errors === 'false') {
             logger.error("requestId :: " + requestId + " :: forgotpassword Controller Validation Error");
             return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "forgotpassword"))
         }*/
        let password = generateRandomPassword();

        async.waterfall([
            function resetPassword(done) {
                User.findOne({
                    email: req.body.email
                }, (err, user) => {
                    if (err) {
                        logger.error("requestId :: " + requestId + " :: forgotpassword Controller Error in executing Find Query");
                        return res.status(500).send(mapError.errorCodeToDesc(requestId, '503', "forgotpassword"));
                    }
                    if (!user) {
                        logger.error("requestId :: " + requestId + " :: forgotpassword Controller Error User not found");
                        return res.status(204).send(mapError.errorCodeToDesc(requestId, '204', "forgotpassword"))
                    }

                    //Encrypt The Password before resetting

                    let tempPassword = new encryptionDecryption();
                    let _pass = tempPassword.encrypt(password);
                    resetTokenInMail = _pass;
                    resetUrl=apiDetails.email.accountResetUrl+resetTokenInMail

                    user.passwordResetToken = _pass;
                    user.passwordResetExpires = Date.now() + 3600; // 1 hour
                    user.save((err) => {
                        if (err) {
                            logger.error("requestId :: " + requestId + " :: forgotpassword Controller Error in saving password information-" + err);
                            return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "forgotpassword"))

                        }
                        logger.debug("requestId :: " + requestId + " :: forgotpassword Controller Password saved");
                        done(err, password, user);
                    });
                });
                logger.debug("requestId :: " + requestId + " :: forgotpassword Going to send reset password mail");

            },
            function sendForgotPasswordEmail(password, user, done) {
                logger.debug("requestId :: " + requestId + " :: forgotpassword Inside send reset mail due to forget password");
                const transporter = nodemailer.createTransport({
                    host: apiDetails.email.host,
                    port: 465,
                    secure: true, // use SSL
                    auth: {
                        user: apiDetails.email.user,
                        pass: apiDetails.email.password
                    }
                });

                //https://www.trueleap.io/account/reset?resettoken=${resetTokenInMail}\n\n (the URL is changed below)
                //https://trueleap.io/#/account/reset/${resetTokenInMail}\n\n

                const mailOptions = {
                    to: user.email,
                    from: apiDetails.email.sendermail,
                    subject: 'Your Trueleap password reset',
                    text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
                    Please click on the following link(valid for 60 minutes), or paste this into your browser to complete the process:\n\n
                    ${resetUrl}\n\n
                    If you did not request this, please ignore this email and your password will remain unchanged.\n`

                };
                transporter.sendMail(mailOptions, (err) => {
                    if (err) {
                        logger.error("requestId :: " + requestId + " :: forgotpassword Error sending Password reset confirmation mail for -" + req.body.email);
                        return res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "forgotpassword"))
                    } else {
                        logger.debug("requestId :: " + requestId + " :: forgotpassword an e-mail has been sent to " + req.body.email + ' with new password');
                        return res.status(200).send(mapError.errorCodeToDesc(requestId, '200', "forgotpassword"));
                    }
                });
            }
        ], (err) => {
            if (err) {
                logger.error("requestId :: " + requestId + " :: forgotpassword Async Waterfall Error for  -" + req.body.email);
                return res.status(500).send(mapError.errorCodeToDesc(requestId, '503', "forgotpassword"))
            }
        });
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: Forgot Password Exception -" + err);
        return res.status(500).send(mapError.errorCodeToDesc(requestId, '503', "forgotpassword"))

    }
};

/**
 * POST /account/change/password
 * Process the change password request.
 */

exports.changepassword = (req, res, next) => {

    const logger = getLogger('changepassword');
    let email = "";
    let requestId = req.id;

    try {

        let password = req.body.newpassword;
        let resettoken = typeof req.body.resettoken != 'undefined' && req.body.resettoken.length > 0 ? req.body.resettoken : 0;

        async.waterfall([
            function validation(done) {
                let errors = true;
                let password_mismatch=0;
                if (resettoken == 0) {
                    logger.debug("requestId :: " + requestId + " :: Password change via profile");

                    if (typeof req.body.currentpassword == 'undefined' || typeof req.body.newpassword == 'undefined' || typeof req.body.confirmpassword == 'undefined')
                        errors = false;
                    /*if (errors == true && req.body.newpassword == req.body.currentpassword){
                        errors = false;
                        password_mismatch=1
                    }*/
                    if (errors == true && req.body.newpassword != req.body.confirmpassword){
                        errors = false;
                        password_mismatch=2
                    }
                    if (errors == true && req.body.newpassword.length <= 6){
                        errors = false;
                        password_mismatch=3
                   }
                } else {
                    logger.debug("requestId :: " + requestId + " :: Password change due to forget passsword initiation");

                    if (typeof req.body.confirmpassword == 'undefined' || typeof req.body.newpassword == 'undefined')
                        errors = false;
                    if (errors == true && req.body.newpassword != req.body.confirmpassword) {
                        errors = false;
                        password_mismatch=2
                    }
                    if (errors == true && req.body.newpassword.length < 6){
                        errors = false;
                        password_mismatch=3
                    }
                }

                logger.debug("requestId :: " + requestId + " :: Value of errors is -" + errors);
 

                if (errors === false) {
                    switch(password_mismatch){
                        /*case 1:
                            logger.debug("requestId :: " + requestId + " :: New Password and Current password cannot be same");
                            return res.status(404).send(mapError.errorCodeToDesc(requestId, '404', "changepassword"))*/
                        case 2:
                            logger.debug("requestId :: " + requestId + " :: New Password and Confirm password doesnt match");
                            return res.status(405).send(mapError.errorCodeToDesc(requestId, '405', "changepassword"))
                        case 3:
                            logger.debug("requestId :: " + requestId + " :: Password should be more than 6 characters");
                            return res.status(406).send(mapError.errorCodeToDesc(requestId, '406', "changepassword"))
                        default:
                            logger.debug("requestId :: " + requestId + " :: changepassword Controller Validation Error");
                            break;
                    }
                }
                done(null, errors);

            },
            function resetPassword(errors, done) {
                let query = {}
                if (resettoken == 0) {
                    query = {
                        _id: req.body.userid
                    }
                } else {
                    query = {
                        passwordResetToken: resettoken
                    }
                }
                User.findOne(query
                    , (err, user) => {
                        if (err) {
                            logger.error("requestId :: " + requestId + " :: changepassword Controller Error in executing Find Query");
                            return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "changepassword"))
                        }
                        if (!user && resettoken==0) {
                            logger.error("requestId :: " + requestId + " :: changepassword Controller Error User not found");
                            return res.status(204).send(mapError.errorCodeToDesc(requestId, '204', "changepassword"))
                        }if (!user && !resettoken==0) {                            
                            logger.error("requestId :: " + requestId + " :: changepassword Controller - Expired reset token");
                            return res.status(205).send(mapError.errorCodeToDesc(requestId, '205', "changepassword"))
                        }
                        email = user.email;
                        let tempPassword = new encryptionDecryption();
                        let _pass = "";
                        if (resettoken == 0) {
                            let  matching = validate(user, req.body.currentpassword);  //check if the current password provided is correct
                            if (!matching) {
                                logger.error("requestId :: " + requestId + ":: login Controller Error during authenticate");
                                return res.status(402).send(mapError.errorCodeToDesc(requestId, '402', "changepassword"))
                            } else {
                                //Final Check if the current password and the new password ae same
                                var tempnewpassword={}
                                    tempnewpassword.password=req.body.newpassword
                                let comp_new_current=validate(tempnewpassword, req.body.currentpassword);  
                                
                                logger.debug("requestId :: " + requestId + " :: tempnewpassword -",req.body.newpassword);
                                logger.debug("requestId :: " + requestId + " :: comp_new_current is -",comp_new_current);
                                if(comp_new_current){
                                    logger.debug("requestId :: " + requestId + " :: New Password and Current password cannot be same");
                                    return res.status(404).send(mapError.errorCodeToDesc(requestId, '404', "changepassword"))
                                }else{
                                    logger.debug("requestId :: " + requestId + " :: All good setting the new password");
                                    _pass = tempPassword.encrypt(req.body.newpassword);
                                    user.password = _pass;
                                }
                            }
                        } else {
                            if (user.passwordResetExpires > Date.now()) {
                                logger.error("requestId :: " + requestId + " :: changepassword Controller token expied");
                                return res.status(500).send(mapError.errorCodeToDesc(requestId, '504', "changepassword"))
                            } else {
                                _pass = tempPassword.encrypt(req.body.newpassword);
                                user.password = _pass;
                                user.passwordResetExpires = null;
                                user.passwordResetToken = null;

                            }
                        }

                        user.save((err) => {
                            if (err) {
                                logger.error("requestId :: " + requestId + " :: changepassword Controller Error in saving password information-" + err);
                                return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "changepassword"))
                            }
                            logger.debug("requestId :: " + requestId + " :: changepassword Controller Password saved");
                            done(err, password, user);
                        });
                    });
                logger.debug("requestId :: " + requestId + " :: changepassword Going to send change password mail");

            },
            function sendchangepasswordEmail(password, user, done) {
                logger.debug("requestId :: " + requestId + " :: changepassword Inside send change password mail");
                const transporter = nodemailer.createTransport({
                    host: apiDetails.email.host,
                    port: 465,
                    secure: true, // use SSL
                    auth: {
                        user: apiDetails.email.user,
                        pass: apiDetails.email.password
                    }
                });

                const mailOptions = {
                    to: user.email,
                    from: apiDetails.email.sendermail,
                    subject: 'Your Trueleap password has been changed',
                    text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has been changed.`
                };
                transporter.sendMail(mailOptions, (err) => {
                    if (err) {
                        logger.error("requestId :: " + requestId + " :: changepassword Error sending Password reset confirmation mail for -" + email);
                        return res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "changepassword"))
                    } else {
                        logger.debug("requestId :: " + requestId + " :: changepassword an e-mail has been sent to " + email + ' password change confirmation');
                        return res.status(200).send(mapError.errorCodeToDesc(requestId, '200', "changepassword"));
                    }

                });
            }
        ], (err) => {
            if (err) {
                logger.error("requestId :: " + requestId + " :: changepassword Async Waterfall Error for  -" + email);
                return res.status(500).send(mapError.errorCodeToDesc(requestId, '503', "changepassword"))
            }
        });
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: Change Password Exception -" + err);
        return res.status(500).send(mapError.errorCodeToDesc(requestId, '503', "changepassword"))

    }
};