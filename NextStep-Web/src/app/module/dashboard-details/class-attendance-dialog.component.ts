import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UrlListService } from '../../shared/url-list.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  tempData: any;
  id: string,
  subject: string
}

@Component({
  selector: 'dialog-submit-assignment-st',
  templateUrl: './class-attendance-dialog-component.component.html',
  styleUrls: ['./dashboard-details.component.css', '../../common/header/common.css']
})

export class ClassAttendanceDialogComponent {
  attendanceList = [];
  loader = true;
  constructor(
    public dialogRef: MatDialogRef<ClassAttendanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private _snackBar: MatSnackBar, private http: HttpClient, private urlListService: UrlListService) {
    }
  ngOnInit() {
    const classinfo = JSON.parse(localStorage.getItem('classinfo'));
    const userinfo = JSON.parse(localStorage.getItem('userData'));
    this.getAttendance(classinfo, userinfo);
  }

  getAttendance(classDetails, userinfo) {
    console.log('aa', classDetails, userinfo);
    let response: any;
    var dataTemp = {
      class: classDetails.extendedProps.grade,
      subject: classDetails.extendedProps.subject,
      semester: classDetails.extendedProps.semester,
      section: classDetails.extendedProps.section,
      period: classDetails.id,
      user: userinfo.username.fullname,
      //isPresent: 'Y'
    };
    this.http.post(this.urlListService.urls.fetchAttendance, dataTemp)
    .subscribe(
      resData => {
        response = resData;
        this.attendanceList = response;
        this.loader = false;
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
    this.dialogRef.close();
  }

}