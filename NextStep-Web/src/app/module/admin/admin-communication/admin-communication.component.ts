import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType} from '@angular/common/http';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { UrlListService } from '../../../shared/url-list.service';

@Component({
  selector: 'app-admin-communication',
  templateUrl: './admin-communication.component.html',
  styleUrls: ['./admin-communication.component.css', '../../../common/header/common.css']
})
export class AdminCommunicationComponent implements OnInit {
  dataObject = {
    userType: '',
    teacherid: '',
    grade: '',
    section: '',
    semester: '',
    subject: '',
    student: '',
    message: ''
  };
  messageText = '';
  errorText = '';
  teacherList = [];
  subjectList = [];
  sectionList = [];
  gradeList = [];
  semesterList = [];
  studentList = [];
  loader = false;
  paramUser = 0;
  userid = '';
  successful = false;
  constructor(public router: Router, private http: HttpClient, private _snackBar: MatSnackBar, private urlListService: UrlListService, private activatedRoute: ActivatedRoute) { }
  ngOnInit() {
    this.activatedRoute.params.subscribe(paramsId => {
      if(paramsId.user !== undefined) { 
        this.paramUser = paramsId.user;
      }
    });
    const userData = JSON.parse(localStorage.getItem('userData'));
    this.userid = userData.id;
    this.getAllRecords();  
  }
  
  clearFields() {
    this.dataObject.grade = '';
    this.dataObject.section = '';
    this.dataObject.semester = '';
    this.dataObject.subject = '';
    this.dataObject.student = '';
  }

  getAllRecords() {
    this.loader = true;
    let response: any, responsesection: any, responsegrade: any, responseteacher: any;
    this.http.get(this.urlListService.urls.teacherAll)
    .subscribe(event => { 
      responseteacher = event;
      if(responseteacher && responseteacher.length > 0) {
        this.teacherList = responseteacher;
        this.loader = false;
      }     
    })
    this.http.get(this.urlListService.urls.semesterFetch)
    .subscribe(event => { 
      response = event;
      if(response && response.length > 0) {
        this.semesterList = response;
      }     
    })
    this.http.get(this.urlListService.urls.subjectAll)
    .subscribe(event => { 
      response = event;
      if(response && response.length > 0) {
        this.subjectList = response;
      }     
    })
    this.http.get(this.urlListService.urls.sectionAll)
    .subscribe(event => { 
      responsesection = event;
      if(responsesection && responsesection.length > 0) {
        this.sectionList = responsesection;
      }     
    })
    this.http.get(this.urlListService.urls.gradeAll)
    .subscribe(event => { 
      responsegrade = event;
      if(responsegrade && responsegrade.length > 0) {
        this.gradeList = responsegrade;
      }     
    })
  }

  getStudentList() {
    let response: any;
    this.studentList = [];
    if(this.dataObject.grade !== '' && this.dataObject.section !== '' && this.dataObject.semester !== '') {
      this.loader = true;
      this.http.post(this.urlListService.urls.roaster, 
        { 
          class: this.dataObject.grade, 
          section: this.dataObject.section, 
          semester: this.dataObject.semester, 
          subject: this.dataObject.subject 
        })
      .subscribe(
        resData => {
          response = resData;
          if(response.length) {
            this.studentList = response;
          }
          this.loader = false;
        },
        errorMessage => {
          // this._snackBar.open(errorMessage.message, '', {
          //   duration: 5000,
          //   horizontalPosition: 'center',
          //   verticalPosition: 'top',
          //   panelClass: 'error-message'
          // });
        }
      );
    }
  }

  onSave(form: NgForm) {
    if (!form.valid) {
      return;
    }  
    let data: any;
    if(this.dataObject.userType === 'to_class') {
      data = {
        notification: { note: this.dataObject.message },
        class: {
            grade: this.dataObject.grade,  //this is the Grade 
            section: this.dataObject.section, // Section 
            semester: this.dataObject.semester //Semester
        },
        notificationby: this.userid, // The Admin who is sending the notification
        notificationtype: 'to_class'
      };
    }
    if(this.dataObject.userType === 'to_all') {
      data = {
        notification: { note: this.dataObject.message },
        class: {},
        notificationby: this.userid, // The Admin who is sending the notification
        notificationtype: 'to_all'
      };
    }
    if(this.dataObject.userType === 'to_individual_teacher') {
      data = {
        notification: { note: this.dataObject.message },
        class: {},
        notificationby: this.userid, // The Admin who is sending the notification
        toteacherid: this.dataObject.teacherid, // this is the Teacher ID
        notificationtype: 'to_individual_teacher'
      };
    }
    if(this.dataObject.userType === 'to_all_teachers') {
      data = {
        notification: { note: this.dataObject.message },
        class: {},
        notificationby: this.userid, // The Admin who is sending the notification
        notificationtype: 'to_all_teachers'
      };
    }
    this.successful = false;
    let response: any;
    this.http.post(this.urlListService.urls.sendNotification, data)
    .subscribe(
      resData => {
        response = resData;
        if(response.ok === 1) {
          this.successful = true;
        } else if (response.code === "200-SNN-001") {
          this.successful = true;
        } else {
          this.successful = false;
          this._snackBar.open('Failed to send notification !', '', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'error-message'
          });  
        }
      },
      errorMessage => { 
        this.successful = false;
        this._snackBar.open('Failed to send notification !', '', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'error-message'
        });
      }
    );
  }

  onCancelClick() {
    if(this.paramUser === 0) {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/u/' + this.paramUser + '/admin-dashboard']);
    }
  }
}
