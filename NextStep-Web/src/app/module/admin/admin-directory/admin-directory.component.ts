import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { AddClassComponent } from '../../add-class/add-class.component';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { UrlListService } from '../../../shared/url-list.service';
import { AuthService } from '../../../common/auth/auth.service';
import moment from 'moment';

@Component({
  selector: 'app-admin-directoryt',
  templateUrl: './admin-directory.component.html',
  styleUrls: ['./admin-directory.component.css', '../../../common/header/common.css']
})
export class AdminDirectoryComponent implements OnInit {
  spinnerCall = true;
  actionFlag = true;
  teacherid = '';
  loader = false;
  eventList = [
    { id: '121', title: 'Mathematics', date: '2020-07-01 09:30:00', color: 'blue', extendedProps: { toolbarTitle: 'Mathematics Class V Sec A Time: 9:30 to 10:30' } },
    { id: '122', title: 'Mathematics', date: '2020-07-03 09:30:00', color: 'blue', extendedProps: { toolbarTitle: 'Mathematics Class V Sec A Time: 9:30 to 10:30' } }
  ];
  calendarPlugins = [dayGridPlugin, interactionPlugin];
  calendarEvents: EventInput[] = [];
  profileData = {
    id: '',
    category: ''
  };
  teacherList = [];
  classList = [];
  paramUser = 0;
  constructor(private authService: AuthService, private route: ActivatedRoute, public router: Router, public dialog: MatDialog, private http: HttpClient, private _snackBar: MatSnackBar, private urlListService: UrlListService, private ref: ChangeDetectorRef,
  private activatedRoute: ActivatedRoute) { }
  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    this.profileData.id = userData.id;
    this.profileData.category = userData.category;
    this.getTeachers();
    this.activatedRoute.params.subscribe(paramsId => {
      if(paramsId.user !== undefined) { 
        this.paramUser = paramsId.user;
      }
    });
  }

  getTeachers() {
    let responseteacher: any;
    this.http.get(this.urlListService.urls.teacherAll)
    .subscribe(event => { 
      responseteacher = event;
      if(responseteacher && responseteacher.length > 0) {
        this.teacherList = responseteacher;
      }     
    })
  }

  formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
    return [year, month, day].join('-');
  }

  eventClicked(event: any) {
    let temp = { parentId: event.event.extendedProps.parentId, id: event.event.id, date: this.formatDate(event.event.start), extendedProps: event.event.extendedProps };
    localStorage.setItem('classinfo', JSON.stringify(temp));
    this.router.navigate(['/dashboard/5f12f2c9e197714c8162be25']);
  }

  getFormattedUTCTime(utcDate, getUTCTime) {
    var tempValue = utcDate.split('T')[0] + ' ' + getUTCTime;
    var stillUtc = moment.utc(tempValue).toDate();
    var local = moment(stillUtc).local().format('YYYY-MM-DD HH:mm:ss');
    return local;
  }

  getFormattedDT(utcDate, getUTCTime, type) {
    var tempValue = utcDate.split('T')[0] + ' ' + getUTCTime;
    var stillUtc = moment.utc(tempValue).toDate();
    var local = moment(stillUtc).local().format('YYYY-MM-DD');
    if(type === 'time') {
      local = moment(stillUtc).local().format('hh:mm');
    }
    return local;
  }

  getAMPM(utcDate, getUTCTime) {
    var tempValue = utcDate.split('T')[0] + ' ' + getUTCTime;
    var stillUtc = moment.utc(tempValue).toDate();
    var local = moment(stillUtc).local().format('A');
    return local;
  }

  parseClassData(event: Object) {
    var preClassList = [];
    let response: any;
    response = event;
    if(response && response.length > 0) {
      for(var i=0; i<response.length; i++) {
        var tempExtra = [];
        for(var k=1; k<response[i].length; k++) {
          tempExtra.push({ 
            id: response[i][k].uniqueperiodid,
            date: this.getFormattedDT(response[i][k].startdate, response[i][0].starttime, ''),
            actualDate: response[i][k].startdate,
            subject: response[i][0].subject_name,
            class: response[i][0].class_name,
            semester: response[i][0].semester_name,
            section: response[i][0].section_name,
            days: response[i][0].days,
            starttime: this.getFormattedDT(response[i][k].startdate, response[i][0].starttime, 'time'),
            endtime: this.getFormattedDT(response[i][k].startdate, response[i][0].endtime, 'time'),
          });
        }
        this.classList.push({
          id: response[i][0].uniqueperiodid,
          class: response[i][0].class_name,
          days: response[i][0].days,
          time: this.getFormattedDT(response[i][0].startdate, response[i][0].starttime, 'time') + this.getAMPM(response[i][0].startdate, response[i][0].starttime) + ' - ' + this.getFormattedDT(response[i][0].enddate, response[i][0].endtime, 'time') + this.getAMPM(response[i][0].enddate, response[i][0].endtime),
          semester: response[i][0].semester_name,
          section: response[i][0].section_name,
          subject: response[i][0].subject_name,
          dateFrom: this.getFormattedDT(response[i][0].startdate, response[i][0].starttime, ''),
          dateTo: this.getFormattedDT(response[i][0].enddate, response[i][0].endtime, ''),
          from: this.getFormattedDT(response[i][0].startdate, response[i][0].starttime, 'time') + this.getAMPM(response[i][0].startdate, response[i][0].starttime),
          to: this.getFormattedDT(response[i][0].enddate, response[i][0].endtime, 'time') + this.getAMPM(response[i][0].enddate, response[i][0].endtime),
          data: response[i][0],
          extra: tempExtra
        });
        var documents = [], weblink = {};
        for(var j=1; j<response[i].length; j++) {
          // if(response[i][j].documents.length > 0) {
          //   documents = response[i][j].documents;
          // }
          if(response[i][j].weblink !== undefined) {
            weblink = response[i][j].weblink;
          }
          var tempEventDates = [];
          tempEventDates.push({ 
            id: response[i][j].uniqueperiodid, 
            title: response[i][0].subject_name, 
            date: this.getFormattedUTCTime(response[i][j].startdate, response[i][j].starttime),
            color: this.getColor(this.getFormattedDT(response[i][j].startdate, response[i][j].starttime, ''), i),  
            extendedProps: { 
              parentId: response[i][0].uniqueperiodid,
              toolbarTitle: response[i][0].subject_name + ' ' + response[i][0].class_name + ' ' + response[i][0].section_name + ' Time: ' + this.getFormattedDT(response[i][0].startdate, response[i][0].starttime, 'time') + this.getAMPM(response[i][0].startdate, response[i][0].starttime) + ' to ' + this.getFormattedDT(response[i][0].enddate, response[i][0].endtime, 'time') + this.getAMPM(response[i][0].enddate, response[i][0].endtime),
              subject: response[i][0].subject,
              subject_name: response[i][0].subject_name,
              grade: response[i][0].class, 
              grade_name: response[i][0].class_name, 
              semester: response[i][0].semester,
              semester_name: response[i][0].semester_name,
              section: response[i][0].section, 
              section_name: response[i][0].section_name, 
              days: response[i][0].days, 
              times: this.getFormattedDT(response[i][0].startdate, response[i][0].starttime, 'time') + this.getAMPM(response[i][0].startdate, response[i][0].starttime) + ' ' + this.getFormattedDT(response[i][0].enddate, response[i][0].endtime, 'time') + this.getAMPM(response[i][0].enddate, response[i][0].endtime), 
              documents: response[i][j],
              weblink: weblink,
              classObject: response[i]
            }
          });
          this.calendarEvents = this.calendarEvents.concat(tempEventDates);
          documents = [];
          weblink = {};
        }
      }
    } else {
      console.log(response.desc);
      this._snackBar.open(response.desc, '', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: 'error-message'
      });
    } 
    this.spinnerCall = false;
  }

  eventHover(event: any) {
    console.log('aaa', event.el.title);
    event.el.title = event.event.extendedProps.toolbarTitle;
  }

  getTeacherName(teacherid) {
    this.calendarEvents = [];
    this.loader = true;
    this.http.post(this.urlListService.urls.teacherClassAll, { teacherid: teacherid })
      .subscribe(
        event => { 
          this.loader = false;
          this.parseClassData(event);
        },
        error => {
          // if(error.status === 401) {
          //   this.authService.logout();
          // }
          this.loader = false;
        }
      );
  
    //this.ref.markForCheck();
  }
  
  getColor(date, index: number) {
    const colorCodes = ["#023861", "#A9862B", "#18B8BE", "#2C1F9C", "#DB353A", "#20771F", "#9E2021", "#E0317F", "#3788D8", "#5B2E26", "#F93F0D"];
    let today = new Date().toISOString().slice(0,10);
    if(date === today) {
      return colorCodes[index];
    } else if(date > today) {
      return "#205680cf";
    } else {
      return "#757f8ae6";
    }
    //const randomColor = Math.floor(Math.random()*16777215).toString(16);
    //return ("#" + randomColor);
  }

  onCancelClick() {
    if(this.paramUser === 0) {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/u/' + this.paramUser + '/admin-dashboard']);
    }
  }
}