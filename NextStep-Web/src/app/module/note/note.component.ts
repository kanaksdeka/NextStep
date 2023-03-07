import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { UrlListService } from '../../shared/url-list.service';
import {HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType} from '@angular/common/http';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { IfStmt } from '@angular/compiler';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';


@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css', '../../common/header/common.css']
})
export class NoteComponent implements OnInit {

  dataObject = {
    dateInput: '2020-07-08'
  };
  dataActual = {
    zoom: 'HDDG54GDG12',
    whiteBoard: 'http://localhost:4200/#/document-history',
    noteList: []
  };
  noteListDuplicate = [];
  validDates = [];
  classDetails = {};
  classDetailsId = '';
  loader = false;
  types = '';
  search = '';
  disabled = true;
  searchdate = '';
  constructor(public router: Router, private urlListService: UrlListService, private http: HttpClient, private _snackBar: MatSnackBar, public dialog: MatDialog) {}
  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const classinfo = JSON.parse(localStorage.getItem('classinfo'));
    this.classDetails = classinfo;
    this.classDetailsId = classinfo.id;
    this.getHistory(userData, classinfo.parentId);
  }

  onCancelClick() {
    this.router.navigate(['/dashboard/121']);
  }

  getShortDay(day: string) {
    if(day === 'Monday') { return 'Mon'; }
    if(day === 'Tuesday') { return 'Tue'; }
    if(day === 'Wednesday') { return 'Wed'; }
    if(day === 'Thursday') { return 'Thu'; }
    if(day === 'Friday') { return 'Fri'; }
    if(day === 'Saturday') { return 'Sat'; }
    if(day === 'Sunday') { return 'Sun'; }
  }

  parseDays(data: string | any[]) {
    var shortDays = '';
    for(var i=0; i<data.length; i++) {
      if(i < data.length-1) {
        shortDays += this.getShortDay(data[i]) + ', ';
      } else {
        shortDays += this.getShortDay(data[i]);
      }
    }
    return shortDays;
  }

  formatDate(date) {
    var month = new Array();
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";
    var d = new Date(date),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (day.length < 2) 
        day = '0' + day;
    return [month[d.getMonth()] + ' ' + day + ', ' + year];
  }

  myFilter = (d: Date): boolean => {
    let enableFlag = false;
    this.validDates.some((mydate) => {
      const offset = d.getTimezoneOffset();
      if (offset < 0) {
          d.setHours(12,0,0);
      }
      if (mydate === d.toISOString().substring(0,10)) {
        enableFlag = true;
        return true;
      }
    })
    return enableFlag;
  }

  getClassInfo(userInfo, response) {
    if(userInfo.category === 'T') {
      // if(response && response.length > 0) {
      //   for(var j=1; j<response.length; j++) {
      //     if(response[j].assignments.length > 0) {
      //       this.validDates.push(response[j].startdate.split('T')[0]);
      //       for(var k=0; k<response[j].assignments.length; k++) {
      //         response[j].assignments[k].date = response[j].startdate.split('T')[0];
      //         response[j].assignments[k].docType = 'Assignment';
      //         var titleUrl = response[j].assignments[k].title.split("trueleaplinkurl");
      //         response[j].assignments[k].title = titleUrl[0];
      //         response[j].assignments[k].link = titleUrl[1];
      //         this.dataActual.noteList.push(response[j].assignments[k]);
      //         this.noteListDuplicate.push(response[j].assignments[k]); 
      //       }
      //     }
      //   }
      // }
      this.dataActual.noteList = this.dataActual.noteList.sort((a, b) => (a.date < b.date) ? 1 : -1);
      this.noteListDuplicate = this.noteListDuplicate.sort((a, b) => (a.date < b.date) ? 1 : -1);
    }
  }
  
  getHistory(userData: any, classId: any) {
    let response: any;
    this.loader = true;
    this.http.post(this.urlListService.urls.noteHistory, { classindex: classId })
    .subscribe(
      resData => {
        response = resData;
        this.getClassInfo(userData, response);
        this.loader = false;
      },
      errorMessage => {
        this._snackBar.open(errorMessage.message, '', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'error-message'
        });
        this.loader = false;
      }
    );
  }

}
