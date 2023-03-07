import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UrlListService {

  //preUrl = 'http://35.164.171.15:9001/';
  domain = document.getElementsByTagName('base')[0].href.split('//');
  baseUrl = this.domain[0] + '//' + this.domain[1];
  preUrl = this.domain[0] + '//api.' + this.domain[1];
  service = 'service/';
  fileService = 'file-service/';
  board = 'dashboard/boards/';
  differentUser = document.getElementsByTagName('base')[0].href;

  urls = {
    diffUser: this.differentUser + '#/',
    whiteboard: this.preUrl + this.board, 
    dashboardGlance: '/insights.html',
    dashboardCommunity: 'https://api1.trueleap.io/',
    login: this.preUrl + this.service + 'account/login',
    studentClassAll: this.preUrl + this.service + 'student/class/all',
    teacherClassAll: this.preUrl + this.service + 'class/period/fetch',
    noteUpload: this.preUrl + this.fileService + 'upload',
    profilePhotoUpload: this.preUrl + this.fileService + 'profile-photo/upload',
    getSignature: this.preUrl + this.service + 'class/zoom/signature',
    modifyDailyClass: this.preUrl + this.service + 'modify/daily/class',
    classAll: this.preUrl + this.service + 'class/all',
    teacherAll: this.preUrl + this.service + 'config/fetch/teachers',
    gradeAll: this.preUrl + this.service + 'config/fetch/grade',
    gradeCreate: this.preUrl + this.service + 'config/create/grade',
    gradeUpdate: this.preUrl + this.service + 'config/update/grade',
    gradeDelete: this.preUrl + this.service + 'config/delete/grade',
    sectionAll: this.preUrl + this.service + 'config/fetch/section',
    sectionCreate: this.preUrl + this.service + 'config/create/section',
    sectionUpdate: this.preUrl + this.service + 'config/update/section',
    sectionDelete: this.preUrl + this.service + 'config/delete/section',
    subjectAll: this.preUrl + this.service + 'config/fetch/subject',
    subjectCreate: this.preUrl + this.service + 'config/create/subject',
    subjectUpdate: this.preUrl + this.service + 'config/update/subject',
    subjectDelete: this.preUrl + this.service + 'config/delete/subject',
    addClass: this.preUrl + this.service + 'class/period/create',
    updateClass: this.preUrl + this.service + 'class/period/update',
    download:  this.preUrl + this.fileService + 'class/document/public?',
    deleteDocument:  this.preUrl + this.service + 'delete/doc',
    search: this.preUrl + this.service + 'global/search/doc?searchfor=',
    fetchNotification: this.preUrl + this.service + 'fetch/notification',
    modifyNotification: this.preUrl + this.service + 'update/notification',
    sendNotification: this.preUrl + this.service + 'notify',
    semesterFetch: this.preUrl + this.service + 'config/fetch/semester',
    semesterCreate: this.preUrl + this.service + 'config/create/semester',
    semesterUpdate: this.preUrl + this.service + 'config/update/semester',
    semesterDelete: this.preUrl + this.service + 'config/delete/semester',
    roaster: this.preUrl + this.service + 'fetch/roaster/student/all',
    noteHistory: this.preUrl + this.service + 'student/note/history',
    profileFetch: this.preUrl + this.service + 'account/profile/fetch',
    accountBulk: this.preUrl + this.service + 'account/temp/bulk',
    profileUpdate: this.preUrl + this.service + 'account/profile/update',
    updateAttendance: this.preUrl + this.service + 'update/attendance',
    fetchAttendance: this.preUrl + this.service + 'fetch/attendance',
    saveAssignmentWeight: this.preUrl + this.service + 'check/submitted/assignment',
    saveStudentGrade: this.preUrl + this.service + 'submit/student/grade',
    docHistory: this.preUrl + this.service + 'class/doc/history/',
    classHistory: this.preUrl + this.service + 'search/doc/in-period/',
    leaveUrl: this.baseUrl,
    chatHistory: this.preUrl + 'chat/room/chatHistory',
    studentScore: this.preUrl + this.service + 'fetch/student/score',
    studentAverageGrade: this.preUrl + this.service + 'fetch/student/average/grade',
    refreshCache: this.preUrl + this.service + 'config/refresh/cache',
    resetPassword: this.preUrl + this.service + 'account/reset/password',
    changePassword: this.preUrl + this.service + 'account/change/password',
    changeProfilePassword: this.preUrl + this.service + 'account/change/profile/password',
    getAllStudent: this.preUrl + this.service + 'config/fetch/students',
    activateUser: this.preUrl + this.service + 'account/email-verification/'
  };
  constructor() {
    var domain = document.getElementsByTagName('base')[0].href.split('//');
    var preUrl = domain[0] + '//api.' + domain[1];
  //  console.log("A", preUrl);
  }
  
}
