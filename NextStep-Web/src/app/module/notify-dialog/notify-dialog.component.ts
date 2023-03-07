import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType} from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService } from '../../common/auth/auth.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { UrlListService } from '../../shared/url-list.service';

export interface DialogData {
}

@Component({
  selector: 'app-notify-dialog',
  templateUrl: './notify-dialog.component.html',
  styleUrls: ['./notify-dialog.component.css', '../../common/header/common.css']
})
export class NotifyDialogComponent implements OnInit {

  fileErrorMessage = '';
  //private userSub: Subscription;
  profileData = {
    teacher: '',
    message: '',
    grade: '',
    section: ''
  };
  classInfo: any;
  category = '';
  userid = '';
  teacherList = [];
  loader = false;
  constructor(private authService: AuthService, public router: Router, public dialogRef: MatDialogRef<NotifyDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData, private http: HttpClient, private _snackBar: MatSnackBar, private urlListService: UrlListService) {}
  ngOnInit() {
    // this.userSub = this.authService.user.subscribe(user => {
    //   console.log('isAuthenticated', !!user);
    // });
    const userData = JSON.parse(localStorage.getItem('userData'));
    this.userid = userData.id;
    this.category = userData.category;
    this.classInfo = this.data;
    if(this.category === 'S') {
      this.getTeacher();
    }
    console.log('classInfo', this.classInfo);
  }

  getTeacher() {
    let responseteacher: any;
    this.loader = true;
    this.http.get(this.urlListService.urls.teacherAll)
    .subscribe(event => { 
      responseteacher = event;
      if(responseteacher && responseteacher.length > 0) {
        this.teacherList = responseteacher;
        this.loader = false;
      }     
    })
  }
  
  onSave(form: NgForm) {
    if (!form.valid) {
      return;
    }
    let data: any;
    if(this.classInfo.type === 'tostudent') {
      data = {
        notification: {
          note: this.profileData.message        
        },
        class: {
          subject: this.classInfo.subject
        },
        notificationby: this.userid, // this is the teacher ID
        tostudentid: this.classInfo.studentid, // this is the student ID
        notificationtype: 'to_individual_student' // The notification type
      };
    }
    if(this.classInfo.type === 'allclass') {
      data = {
        notification: {
          note: this.profileData.message
        },
        class: {
          grade: this.classInfo.grade,
          section: this.classInfo.section,
          semester: this.classInfo.semester
        },
        notificationby: this.userid,
        notificationtype: 'to_class'
      };
    }
    if(this.classInfo.type === 'toteacher') {
      data = {
        notification: {
          note: this.profileData.message
        },
        class: {
          grade: this.classInfo.grade,
          section: this.classInfo.section,
          semester: this.classInfo.semester
        },
        notificationby: this.userid,
        toteacherid: this.profileData.teacher,
        notificationtype: 'to_class'
      };
    }
    let response: any;
    this.http.post(this.urlListService.urls.sendNotification, data)
    .subscribe(
      resData => {
        response = resData;
        if(response.ok === 1) {
          this._snackBar.open('Notification is send successfully !', 'X', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'success-message'
          });
          this.dialogRef.close();
        } else if (response.code === "200-SNN-001") {
          this._snackBar.open('Notification is send successfully !', 'X', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'success-message'
          });
          this.dialogRef.close();
        } else {
          this._snackBar.open('Failed to send notification !', '', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'error-message'
          });  
        }
      },
      errorMessage => { 
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
    this.dialogRef.close();
  }

}