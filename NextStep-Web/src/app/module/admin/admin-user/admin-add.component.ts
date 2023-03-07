import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import {HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType} from '@angular/common/http';
import { UrlListService } from '../../../shared/url-list.service';
import { MatSnackBar } from '@angular/material';
@Component({
  selector: 'app-admin-add',
  templateUrl: './admin-add.component.html',
  styleUrls: ['./admin-add.component.css', '../../../common/header/common.css']
})
export class AdminAddComponent implements OnInit {

  gradeList = [];
  sectionList = [];
  semesterList = [];
  dataObject = {
    email: '',
    userType: '',
    semester: '',
    class: '',
    section: '',
    image: null
  };
  message = '';
  finalObject = { email: []};
  errorEmails = [];
  errorText = '';
  paramUser = 0;
  constructor(public router: Router, private http: HttpClient, private urlListService: UrlListService, private activatedRoute: ActivatedRoute, private _snackBar: MatSnackBar) {}
  ngOnInit() {
    this.getAllRecords();
    this.activatedRoute.params.subscribe(paramsId => {
      if(paramsId.user !== undefined) { 
        this.paramUser = paramsId.user;
      }
    });
  }

  getAllRecords() {
    let response: any, responsesection: any, responsegrade: any, responsesemester: any;
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
    this.http.get(this.urlListService.urls.semesterFetch)
    .subscribe(event => { 
      responsesemester = event;
      if(responsesemester && responsesemester.length > 0) {
        this.semesterList = responsesemester;
      }     
    })
  }

  removeSpace(text: string) {
    text = text ? text.split("\n").join("") : '';
    return text ? text.split(" ").join("") : '';
  }

  validateFields(data: { email: any; userType: any; semester: any; class: any; section: any; image?: any; }, form) {
    this.finalObject.email = [];
    this.errorEmails = [];
    this.message = '';
    this.errorText = '';
    var testList = data.email.split(',');
    for(var i=0; i<testList.length; i++) {
      if(this.validateEmail(testList[i])) {
        this.finalObject.email.push({ email: this.removeSpace(testList[i]), semester: data.semester, category: data.userType, class: data.class, section: data.section});
      } else {
        this.errorEmails.push(testList[i]);
      }
    }
    if(this.errorEmails.length === 0) {
      this.saveUsers(this.finalObject, form);
    }
    if(this.errorEmails.length > 0) {
      for(var i=0; i<this.errorEmails.length; i++) {
        this.errorText += this.errorEmails[i] + ' ';
      }
      this.message = 'error';
      this._snackBar.open('Invalid users: ' + this.errorText, '', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: 'error-message'
      }); 
    }
  }

  onSave(form: NgForm) {
    if (!form.valid) {
      return;
    }
    this.validateFields(this.dataObject, form);
  }

  saveUsers(data: { email: any[]; }, form) {
    let response: any;
    this.http.post(this.urlListService.urls.accountBulk, data)
      .subscribe(event => {  
        response = event;
        if(response[0].code === '200-TUS-001') {
          this.message = 'succuss';
          this._snackBar.open('User(s) has been saved successfully !', '', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'success-message'
          });
          form.resetForm();
        } else {
          this._snackBar.open(response[0].desc, '', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'error-message'
          });   
        }
      })
  }

  validateEmail(email: string) {
    //Check minimum valid length of an Email.
    if (email.length <= 2) { return false; }
    //If whether email has @ character.
    if (email.indexOf("@") == -1) { return false; }

    var parts = email.split("@");
    var dot = parts[1].indexOf(".");
    var len = parts[1].length;
    var dotSplits = parts[1].split(".");
    var dotCount = dotSplits.length - 1;

    //Check whether Dot is present, and that too minimum 1 character after @.
    if (dot == -1 || dot < 2 || dotCount > 2) { return false; }

    //Check whether Dot is not the last character and dots are not repeated.
    for (var i = 0; i < dotSplits.length; i++) {
        if (dotSplits[i].length == 0) {
            return false;
        }
    }
    return true;
  }

  onCancelClick() {
    if(this.paramUser === 0) {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/u/' + this.paramUser + '/admin-dashboard']);
    }
  }

}
