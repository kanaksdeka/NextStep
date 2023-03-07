import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { UrlListService } from '../../shared/url-list.service';
import {HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType} from '@angular/common/http';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { IfStmt } from '@angular/compiler';
import { error } from 'protractor';
import { userInfo } from 'os';

@Component({
  selector: 'app-document-history',
  templateUrl: './document-history.component.html',
  styleUrls: ['./document-history.component.css', '../../common/header/common.css']
})
export class DocumentHistoryComponent implements OnInit {
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
  classDetails = {
    extendedProps: {
      toolbarTitle: ''
    }
  };
  classDetailsId = '';
  loader = false;
  types = '';
  search = '';
  disabled = true;
  searchdate = '';
  chatHistoryList = [];
  chatHistoryFlag = false;
  paramUser = 0;
  constructor(public router: Router, private urlListService: UrlListService, private http: HttpClient, private _snackBar: MatSnackBar, private activatedRoute: ActivatedRoute) {}
  ngOnInit() {
    //const userData = JSON.parse(localStorage.getItem('userData'));
    //const classinfo = JSON.parse(localStorage.getItem('classinfo'));
    
    let classinfo: any;
    let userinfo: any;

    const tempUserData = JSON.parse(localStorage.getItem('userData'));
    const tempClassinfo = JSON.parse(localStorage.getItem('classinfo'));
    
    this.activatedRoute.params.subscribe(paramsId => {
      if(paramsId.user !== undefined) { 
        this.paramUser = paramsId.user;
        for(var i=0; i<tempUserData.users.length; i++) {
          if(tempUserData.users[i].user === paramsId.user) {
            classinfo = tempUserData.users[i].userinfo.classinfo;
            userinfo = tempUserData.users[i].userinfo;
          }
        } 
      } else {
        classinfo = tempClassinfo;
        userinfo = tempUserData;
      }
    });
    this.classDetails = classinfo;
    this.classDetailsId = classinfo.id;
    this.getHistory(userinfo, classinfo.parentId);
    this.getHistoryList(classinfo, userinfo);
  }

  getHistoryList(classinfo: { extendedProps: { grade: any; section: any; subject: any; semester: any; }; id: any; }, userinfo: { username: { fullname: any; }; }) {
    var data = {
      class: classinfo.extendedProps.grade,
      section: classinfo.extendedProps.section,
      subject: classinfo.extendedProps.subject,
      semester: classinfo.extendedProps.semester,
      period: classinfo.id,
      user: userinfo.username.fullname
    };

    let response: any;
    this.http.post(this.urlListService.urls.chatHistory, data)
    .subscribe(
      resData => {
        response = resData;
        if(response.success && response.data.length > 0) {
          this.chatHistoryList = response.data.reverse();
        }
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
      if(response && response.length > 0) {
        for(var j=1; j<response.length; j++) {
          if(response[j].documents.length > 0) {
            this.validDates.push(response[j].startdate.split('T')[0]);
            for(var k=0; k<response[j].documents.length; k++) {
              response[j].documents[k].date = response[j].startdate.split('T')[0];
              response[j].documents[k].docType = 'Document';
              var titleUrl = response[j].documents[k].title.split("trueleaplinkurl");
              response[j].documents[k].title = titleUrl[0];
              response[j].documents[k].link = titleUrl[1];
              this.dataActual.noteList.push(response[j].documents[k]);
              this.noteListDuplicate.push(response[j].documents[k]); 
            }
          }
          if(response[j].assignments.length > 0) {
            this.validDates.push(response[j].startdate.split('T')[0]);
            for(var k=0; k<response[j].assignments.length; k++) {
              response[j].assignments[k].date = response[j].startdate.split('T')[0];
              response[j].assignments[k].docType = 'Assignment';
              var titleUrl = response[j].assignments[k].title.split("trueleaplinkurl");
              response[j].assignments[k].title = titleUrl[0];
              response[j].assignments[k].link = titleUrl[1];
              this.dataActual.noteList.push(response[j].assignments[k]);
              this.noteListDuplicate.push(response[j].assignments[k]); 
            }
          }
          if(response[j].classnote !== null) {
            this.validDates.push(response[j].classnote.date.split('T')[0]);
            var temp = {
              date: response[j].classnote.date.split('T')[0],
              docType: 'Classnote',
              title: "Class note",
              note: response[j].classnote.notes
            };
            this.dataActual.noteList.push(temp);
            this.noteListDuplicate.push(temp);
          }          
        }
      }
      this.dataActual.noteList = this.dataActual.noteList.sort((a, b) => (a.date < b.date) ? 1 : -1);
      this.noteListDuplicate = this.noteListDuplicate.sort((a, b) => (a.date < b.date) ? 1 : -1);
    }
  }

  clearSearch() {
    this.types = '';
    this.search = '';
    this.searchdate = '';
    this.disabled = true;
    this.dataActual.noteList = this.noteListDuplicate;
  }

  onSearch() {
    this.disabled = false;
    if(this.search) {
      var temp = [];
      for(var i=0; i<this.noteListDuplicate.length; i++) {
        if(this.search === this.noteListDuplicate[i].title) {
          temp.push(this.noteListDuplicate[i]);
        }
      }
      this.dataActual.noteList = temp;
    }
  }

  onSearchSelect() {
    this.disabled = false;
    if(this.types) {
      if(this.types !== 'chatHistory') {
        var temp = [];
        for(var i=0; i<this.noteListDuplicate.length; i++) {
          if(this.types === this.noteListDuplicate[i].docType) {
            temp.push(this.noteListDuplicate[i]);
          }
        }
        this.dataActual.noteList = temp;
        this.chatHistoryFlag = false;
      } else {
        this.chatHistoryFlag = true;
      }
    }
  }

  updateNotes(event: any) {
    this.disabled = false;
    if(event.value) {
      const offset = event.value.getTimezoneOffset();
      if (offset < 0) {
        event.value.setHours(12,0,0);
      }
      var filterDate = event.value.toISOString().substring(0,10), temp = [];
      for(var i=0; i<this.noteListDuplicate.length; i++) {
        if(filterDate === this.noteListDuplicate[i].date) {
          temp.push(this.noteListDuplicate[i]);
        }
      }
      this.dataActual.noteList = temp;
    }
  }

  onLink(item: { link: string; }) {
    let tab = window.open();                 
    tab.location.href = item.link;
  }
  
  onDownload(item) {
    window.open(item.path, "_blank");
  }
  
  getHistory(userData: any, classId: any) {
    let response: any;
    this.loader = true;
    this.http.post(this.urlListService.urls.docHistory, { classindex: classId })
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
