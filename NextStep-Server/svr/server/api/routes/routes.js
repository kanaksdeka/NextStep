

'use strict';
/**
 * [appRouter Application routes]
 * @param  {[object]} app
 */

var path = require('path');
const { nextTick } = require('process');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
var app = require(path.join(appRoot, 'trlp.js'));
const authentication = require(path.join(appRoot, 'api/authenticate/authenticate'));
//var cors = require('cors')

console.log("Approot is -" + appRoot)


var appRouter = function (app) {


  /**
   * Controllers (route handlers).
   */
  const loginController = require(path.join(appRoot, 'api/controller/signup-login-management/login-manager'));
  const signupController = require(path.join(appRoot, 'api/controller/signup-login-management/signup-manager'));
  const profileController = require(path.join(appRoot, 'api/controller/user-management/profile-manager'));
  const periodController = require(path.join(appRoot, 'api/controller/class-management/period-manager'));
  const subjectController = require(path.join(appRoot, 'api/controller/subject-management/subject-manager'));
  const gradeController = require(path.join(appRoot, 'api/controller/class-management/grade-manager'));
  const sectionController = require(path.join(appRoot, 'api/controller/class-management/section-manager'));
  const studentclasscontroller = require(path.join(appRoot, 'api/controller/class-management/students-class-manager'));
  const zoomController = require(path.join(appRoot, 'api/authenticate/zoom-signature'));
  const searchcontroller = require(path.join(appRoot, 'api/controller/search-management/search-controller'));
  const notificationController = require(path.join(appRoot, 'api/controller/notification-management/notification-manager'));
  const scoreController=require(path.join(appRoot, 'api/controller/gradeBook-management/gradebook-manager'));
  const attendanceController=require(path.join(appRoot, 'api/controller/attendance-management/attendance-manager'));
  const semesterController=require(path.join(appRoot, 'api/controller/class-management/semester-manager'));
  const rosterController=require(path.join(appRoot, 'api/controller/user-management/roster-manager'));
  const cacheController=require(path.join(appRoot, 'api/controller/metadata-management/metadata-manager'));





  //Signup and Login

  app.post('/service/account/login', loginController.login);
  app.post('/service/account/logout', authentication, loginController.logout);
  app.get('/service/account/email-verification/:url', signupController.verifyAccount);
  app.post('/service/account/reset/password', loginController.forgotpassword);
  app.post('/service/account/change/password',loginController.changepassword);
  app.post('/service/account/change/profile/password',authentication,loginController.changepassword);
  //  app.post('/service/account/profile/update',authentication,profileController.updateprofile);
  //app.post('/service/account/temp/signup',signupController.tempSignUp);
  app.post('/service/account/temp/bulk', authentication, signupController.bulksignup);

  //Class API

  app.post('/service/class/period/create', authentication, periodController.createperiod);
  app.post('/service/class/period/update', authentication, periodController.updateperiod);
  app.post('/service/modify/daily/class', authentication, periodController.updatespecificperiod);
  app.post('/service/change/doc/status', authentication, periodController.documentstatus);
  app.post('/service/delete/doc', authentication,periodController.deletedocument);


  app.post('/service/class/doc/history/', authentication, periodController.getalldocumentsforperiods);
  app.post('/service/class/period/fetch', authentication, periodController.getperiods); // Called when teacher login in
  /*app.get('/service/class/all',  function(req, res,next) {
      req.headers.checkuser='A';
      next();
     },authentication,periodController.getindexclasses);
  */

  app.get('/service/class/all', authentication, periodController.getindexclasses); //called by Admin
  app.get('/service/student/class/all', authentication, studentclasscontroller.getindexclassesfortheday); //Called when Student Logs In
  app.post('/service/student/class/note', authentication, studentclasscontroller.capturemynotesfortheday);
  app.post('/service/student/note/history', authentication, studentclasscontroller.getmynotesforclass);

  app.post('/service/config/create/subject', authentication, subjectController.createsubject);
  app.get('/service/config/fetch/subject', authentication, subjectController.getsubjects);
  app.post('/service/config/update/subject', authentication, subjectController.updatesubject);
  app.post('/service/config/delete/subject', authentication, subjectController.deletesubject);

  app.post('/service/config/create/grade', authentication, gradeController.creategrade);
  app.get('/service/config/fetch/grade', authentication, gradeController.getgrades);
  app.post('/service/config/update/grade', authentication, gradeController.updategrade);
  app.post('/service/config/delete/grade', authentication, gradeController.deletegrade);

  app.post('/service/config/create/semester', authentication, semesterController.createsemester);
  app.get('/service/config/fetch/semester', authentication, semesterController.getsemester);
  app.post('/service/config/update/semester', authentication, semesterController.updatesemester);
  app.post('/service/config/delete/semester', authentication, semesterController.deletesemester);


  app.get('/service/config/fetch/teachers', authentication, profileController.getteachers);
  app.get('/service/config/fetch/students', authentication, profileController.fetchStudents);
  //app.get('/service/fetch/assignment/scoring/:semester',authentication,profileController.getmyscores);
  //app.get('/service/fetch/assignment/submitted/:semester',authentication,profileController.getmyAssignments);
  app.post('/service/config/refresh/cache',authentication, cacheController.refreshcache);


  //Moved from Param to Query to support if Semester is passed in else the defautl Semester from profile is taken ,
  app.get('/service/fetch/assignment/scoring',authentication,profileController.getmyscores); //query parameter name is semester
  app.get('/service/fetch/assignment/submitted',authentication,profileController.getmyAssignments); //query parameter name is semester
  app.post('/service/account/profile/update', authentication, profileController.updateprofile);
  app.get('/service/account/profile/fetch', authentication, profileController.getprofile);
  
  app.post('/service/fetch/roaster/student/all',authentication,rosterController.getstudents);


  app.post('/service/config/create/section', authentication, sectionController.createsection);
  app.get('/service/config/fetch/section', authentication, sectionController.getsections);
  app.post('/service/config/update/section', authentication, sectionController.updatesection);
  app.post('/service/config/delete/section', authentication, sectionController.deletesection);

  app.post('/service/class/zoom/signature', authentication, zoomController.zoomSignature);
  app.get('/service/global/search/doc', authentication, searchcontroller.search);
  app.post('/service/search/doc/in-period/',authentication, searchcontroller.searchDocumentsForPeriod);

  
  app.post('/service/notify', authentication, notificationController.sendnotification);
  app.post('/service/update/notification', authentication, notificationController.notificationstatus);
  app.post('/service/fetch/notification', authentication, notificationController.fetchallnotification);


  app.post('/service/check/submitted/assignment',authentication,periodController.teachersinputforassignment);
  app.post('/service/fetch/student/score',authentication,scoreController.getscores);
  app.post('/service/submit/student/grade',authentication,scoreController.submitfinalgrade);
  app.post('/service/fetch/student/average/grade',authentication,scoreController.fetchavggrade);

  app.post('/service/update/attendance', authentication, attendanceController.setAttendance);
  app.post('/service/fetch/attendance', authentication, attendanceController.getAttendance);
  app.post('/service/fetch/dayattendance', authentication, attendanceController.getDayAttendance);
  app.post('/service/fetch/studentsattendance', authentication, attendanceController.getStudentAttendance);
};

module.exports = appRouter; 
