import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm, FormControl, Validators } from '@angular/forms';
import {HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType} from '@angular/common/http';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { UrlListService } from '../../shared/url-list.service';

@Component({
  selector: 'app-gradebook',
  templateUrl: './gradebook.component.html',
  styleUrls: ['./gradebook.component.css', '../../common/header/common.css']
})
export class GradebookComponent implements OnInit {
  selectStudent = '';
  gradeArrayList = [];
  studentArrayList = [];
  category = 'S';
  textString = '';
  classinfo: any;
  studentList: [];
  load = false;
  gradeLoad = false;
  studentArrayListLength = 0;
  todayDate = new Date().toISOString().slice(0,10);
  paramUser = 0;
  constructor(public router: Router, private activatedRoute: ActivatedRoute, private http: HttpClient, private _snackBar: MatSnackBar, private urlListService: UrlListService) {}
  ngOnInit() {
    //this.classinfo = JSON.parse(localStorage.getItem('classinfo'));
    //const userinfo = JSON.parse(localStorage.getItem('userData'));
    let userinfo: any;

    const tempUserData = JSON.parse(localStorage.getItem('userData'));
    const tempClassinfo = JSON.parse(localStorage.getItem('classinfo'));
    
    this.activatedRoute.params.subscribe(paramsId => {
      if(paramsId.user !== undefined) { 
        this.paramUser = paramsId.user;
        for(var i=0; i<tempUserData.users.length; i++) {
          if(tempUserData.users[i].user === paramsId.user) {
            this.classinfo = tempUserData.users[i].userinfo.classinfo;
            userinfo = tempUserData.users[i].userinfo;
          }
        } 
      } else {
        this.classinfo = tempClassinfo;
        userinfo = tempUserData;
      }
    });

    if(userinfo.category === 'S') {
      this.textString = 'My ';
      this.studentViewRecords(userinfo.id);
    } else {
      this.getStudentList();
      this.textString = '';
    }
    this.category = userinfo.category;
  }

  getGradeDetails(studentid: any) {
    let response: any;
    this.gradeArrayList = [];
    this.http.post(this.urlListService.urls.studentScore, 
      { 
        studentid: studentid,
        semester: this.classinfo.extendedProps.semester 
      })
    .subscribe(
      resData => {
        response = resData;
        this.load = true;
        for(var i=0; i<response.length; i++) {
          var temp = {
            gradetype: 'Midterm',
            gradeweight: '100',
            gradename: '',
            assignmentname_s: response[i].assignmentname_s,
            scoreid: response[i].scoreid,
            compulsary: false,
            compulsarypassmark: '',
            assessmentdate: '',
            outof: '100',
            bestoutof: response[i].score,
            partofmidtermgrade: 'Yes',
            delete: false
          };
          this.gradeArrayList.push(temp);
        }
      },
      errorMessage => {
        this._snackBar.open(errorMessage.message, '', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'error-message'
        });
      }
    );
  }

  getStudentList() {
    let response: any;
    this.http.post(this.urlListService.urls.roaster, 
      { 
        class: this.classinfo.extendedProps.grade, 
        section: this.classinfo.extendedProps.section, 
        semester: this.classinfo.extendedProps.semester, 
        subject: this.classinfo.extendedProps.subject 
      })
    .subscribe(
      resData => {
        response = resData;
        if(response.length) {
          this.studentList = response;
        }
      },
      errorMessage => {
        this._snackBar.open(errorMessage.message, '', {
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
      this.router.navigate(['/dashboard/5f12f2c9e197714c8162be25']);  
    } else {
      this.router.navigate(['/u/' + this.paramUser + '/dashboard/5f12f2c9e197714c8162be25']);
    }
  }

  addRecord() {
    var temp = {
      gradetype: '',
      gradeweight: '',
      gradename: '',
      compulsary: false,
      compulsarypassmark: '',
      assessmentdate: '',
      outof: '',
      bestoutof: '',
      partofmidtermgrade: false,
      delete: false
    };
    this.gradeArrayList.push(temp);
  }

  removeRecord(index: number) {
    this.gradeArrayList.splice(index, 1);
  }

  onSave(form: NgForm) {
    var data = {
      studentid: this.selectStudent,
      finalgrade: []
    };
    for(var i=0; i<this.gradeArrayList.length; i++) {
      var temp = {
        scoreref: this.gradeArrayList[i].scoreid,
        subject: this.classinfo.extendedProps.subject,
        semester: this.classinfo.extendedProps.semester,
        gradetype: this.gradeArrayList[i].gradetype,	
        gradeweight: this.gradeArrayList[i].gradeweight,	
        gradename: this.gradeArrayList[i].gradename,
        compulsary: this.gradeArrayList[i].compulsary,	
        compulsarypassmark: this.gradeArrayList[i].compulsarypassmark,
        assessmentdate: this.gradeArrayList[i].assessmentdate,	
        outof: this.gradeArrayList[i].outof,
        bestoutof: this.gradeArrayList[i].bestoutof,	
        partofmidtermgrade: this.gradeArrayList[i].partofmidtermgrade
      };
      data.finalgrade.push(temp);
    }
    let response: any;
    this.http.post(this.urlListService.urls.saveStudentGrade, data)
    .subscribe(
      resData => {
        response = resData;
        if(response.code === '200-SFG-001') {
          this._snackBar.open('Grades for selected student is saved successfully.', '', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'success-message'
          });
        } else {
          this._snackBar.open(response.desc, '', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'error-message'
          });
        }
      },
      errorMessage => {
        this._snackBar.open(errorMessage.message, '', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'error-message'
        });
      }
    );
  }

  studentViewRecords(id: any) {
    let response: any;
    this.http.post(this.urlListService.urls.studentAverageGrade, { 'studentid': id })
    .subscribe(
      resData => {
        response = resData;
        if(response.length > 0) {
          this.studentArrayList = response;
          this.studentArrayListLength = this.studentArrayList.length;
        } else {
          this.gradeLoad = true;
        }
        console.log('aaaaaaaa', this.studentArrayList);
      },
      errorMessage => {
        this._snackBar.open(errorMessage.message, '', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'error-message'
        });
      }
    );
  }
  
}
