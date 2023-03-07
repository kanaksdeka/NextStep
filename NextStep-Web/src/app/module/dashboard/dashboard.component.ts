import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { AddClassComponent } from '../add-class/add-class.component';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType} from '@angular/common/http';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { UrlListService } from '../../shared/url-list.service';
import { AuthService } from '../../common/auth/auth.service';
import moment from 'moment-timezone';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css', '../../common/header/common.css']
})
export class DashboardComponent implements OnInit {
  spinnerCall = true;
  actionFlag = true;
  classList = [
    // {
    //   id: '121',
    //   class: 'V Sec A',
    //   days: 'Wednesday, Friday',
    //   time: '9.30 - 10.30',
    //   subject: 'Mathematics',
    //   from: '09:30',
    //   to: '10:30',
    //   dateFrom: '2020-07-01',
    //   dateTo: '2020-07-04',
    //   data: {
    //     class: 'V',
    //     section: 'Sec A',
    //     days: ['Wednesday', 'Friday'],
    //     subject: 'Mathematics',
    //     from: '09:30',
    //     to: '10:30',
    //     dateFrom: '2020-07-01',
    //     dateTo: '2020-07-04',
    //   }
    // }
  ];
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
  paramUser = 0;
  completeUserInfo: any;
  constructor(private authService: AuthService, private route: ActivatedRoute, public router: Router, public dialog: MatDialog, private http: HttpClient, private _snackBar: MatSnackBar, private urlListService: UrlListService, private activatedRoute: ActivatedRoute) {}
  ngOnInit() {
    let userData: any;
    const tempUserData = JSON.parse(localStorage.getItem('userData'));
    this.completeUserInfo = tempUserData;
    this.activatedRoute.params.subscribe(paramsId => {
      if(paramsId.user !== undefined) { 
        this.paramUser = paramsId.user;
        for(var i=0; i<tempUserData.users.length; i++) {
          if(tempUserData.users[i].user === paramsId.user) {
            userData = tempUserData.users[i].userinfo;
            this.reload();
          }
        } 
      } else {
        userData = tempUserData;
      }
    });
    this.profileData.id = userData.id;
    this.profileData.category = userData.category;
    this.getClassInfo(this.profileData.category);
  }

  reload() {
    if (!localStorage.getItem('x-dashboard-fkp')) { 
      localStorage.setItem('x-dashboard-fkp', 'no reload') 
      document.defaultView.location.reload(); 
    } else {
      localStorage.removeItem('x-dashboard-fkp') 
    }
  }

  //need to delete if not reuired
  dateClick(info) {
    console.log('dateStr: ', info.dateStr);
    console.log('jsEvent: ', info.jsEvent);
    console.log('view: ', info.view);
    //this.onCreateNewClass({});
  }

  clickButton(event) {
    console.log('event', event);
  }

  eventHover(event: any) {
    event.el.title = event.event.extendedProps.toolbarTitle;
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
    if(this.paramUser === 0) {
      localStorage.setItem('classinfo', JSON.stringify(temp));
      this.router.navigate(['/dashboard/5f12f2c9e197714c8162be25']);
    } else {
      for(var i=0; i<this.completeUserInfo.users.length; i++) {
        if(this.completeUserInfo.users[i].user === this.paramUser) {
          this.completeUserInfo.users[i].userinfo.classinfo = temp;
        }
      }
      localStorage.setItem('userData', JSON.stringify(this.completeUserInfo));
      this.router.navigate(['/u/' + this.paramUser + '/dashboard/5f12f2c9e197714c8162be25']);
    }
  }

  onCreateNewClass(data: any): void {
    const dialogProjectRef = this.dialog.open(AddClassComponent, {
      disableClose: true,
      panelClass: 'create-new-class',
      width: '500px',
      data: {'cData': data}
    });

    dialogProjectRef.afterClosed().subscribe();
  }
  
  onActionClick(event) {
    if(event.actionType === 'edit') {
      event.class = event.data.class_name;
      event.section = event.data.section_name;
      event.days = event.data.days;
      this.onCreateNewClass(event);
    }
    if(event.actionType === 'gradebook') {
      if(this.paramUser === 0) {
        this.router.navigate(['/gradebook']);
      } else {
        this.router.navigate(['/u/' + this.paramUser + '/gradebook']);
      }
    }
    if(event.actionType === 'history') {
      var temp = event.subject + ' ' + event.class + ' ' + event.section + ' Time: ' + event.time 
      localStorage.setItem('class-id', event.id);
      localStorage.setItem('classinfo', JSON.stringify(temp));
      if(this.paramUser === 0) {
        this.router.navigate(['/document-history']);
      } else {
        this.router.navigate(['/u/' + this.paramUser + '/document-history']);
      }
    }
    if(event.actionType === 'notes') {
      if(this.paramUser === 0) {
        this.router.navigate(['/note']);
      } else {
        this.router.navigate(['/u/' + this.paramUser + '/note']);
      }
    }
    if(event.actionType === 'class') {
      var todayDate = new Date(), counter = 0;
      for(var i=0; i<event.extra.length; i++) {
        if(event.extra[i].date >= this.formatDate(todayDate)) {
          let temp = { 
            id: event.extra[i].id, 
            date: this.formatDate(event.extra[i].date), 
            // Need to change parent Id
            parentId: event.extra[i].id, 
            extendedProps: {
              toolbarTitle: event.extra[i].subject + ' ' + event.extra[i].class + ' ' + event.extra[i].section + ' Time: ' + event.extra[i].starttime + ' to ' + event.extra[i].endtime, 
              subject: event.extra[i].subject,
              grade: event.extra[i].class,
              section: event.extra[i].section,
              semester: event.extra[i].semester,
              days: event.extra[i].days,
              times: event.extra[i].starttime + ' to ' + event.extra[i].endtime,
              documents: {},
              weblink: {},
              classObject: []
            }
          };
          localStorage.setItem('classinfo', JSON.stringify(temp));
          if(this.paramUser === 0) {
            this.router.navigate(['/dashboard/5f12f2c9e197714c8162be25']);
          } else {
            this.router.navigate(['/u/' + this.paramUser + '/dashboard/5f12f2c9e197714c8162be25']);
          }
          counter += 0;
          break;
        }
      }
      if(counter === 0) {
        this._snackBar.open('Selected class is already over !', 'X', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'success-message'
        });       
      }
    }
  }

  getDates(startDate: Date, endDate: number | Date) {
    var dates = [],
        currentDate = startDate,
        addDays = function(days) {
          var date = new Date(this.valueOf());
          date.setDate(date.getDate() + days);
          return date;
        };
    while (currentDate <= endDate) {
      dates.push(currentDate);
      currentDate = addDays.call(currentDate, 1);
    }
    return dates;
  };

  getCurrentClass(date) {
    let today = new Date().toISOString().slice(0,10);
    if(date === today) {
      return true;
    }
    return false;
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

  getClassInfo(usercategory) {
    if(usercategory === 'S') {
      this.http.get(this.urlListService.urls.studentClassAll)
      .subscribe(
        event => { 
          this.parseClassData(event);
        },
        error => {
          // if(error.status === 401) {
          //   this.authService.logout();
          // }
        }
      );
    }
    if(usercategory === 'T') {
      this.http.post(this.urlListService.urls.teacherClassAll, { teacherid: this.profileData.id })
      .subscribe(
        event => { 
          this.parseClassData(event);
        },
        error => {
          // if(error.status === 401) {
          //   this.authService.logout();
          // }
        }
      );
    }
  }

  getLocalTime(utcDate) {
    const momentObj = moment.utc(utcDate).local();
    if(parseInt(momentObj.format("h")) < 10) {
      return ('0' + momentObj.format("h:mm"));
    } else {
      return momentObj.format("h:mm");
    }
  }

  appendZero(item) {
    let value = '';
    if(item < 10) {
      value = '0' + item.toString()
    } else {
      value = item.toString();
    }
    return value;
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
    var preClassList = [], selectedClass = [];
    let response: any;
    response = event;
    if(response && response.length > 0) {
      for(var i=0; i<response.length; i++) {
        var tempExtra = [];
        for(var k=1; k<response[i].length; k++) {
          tempExtra.push({ 
            id: response[i][k].uniqueperiodid,
            //date: response[i][k].startdate.split('T')[0],
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
          //time: response[i][0].starttime + ' - ' + response[i][0].endtime,
          time: this.getFormattedDT(response[i][0].startdate, response[i][0].starttime, 'time') + ' ' + this.getAMPM(response[i][0].startdate, response[i][0].starttime) + ' - ' + this.getFormattedDT(response[i][0].enddate, response[i][0].endtime, 'time') + ' ' + this.getAMPM(response[i][0].enddate, response[i][0].endtime),
          semester: response[i][0].semester_name,
          section: response[i][0].section_name,
          subject: response[i][0].subject_name,
          //dateFrom: response[i][0].startdate.split('T')[0],
          //dateTo: response[i][0].enddate.split('T')[0],
          //from: response[i][0].starttime,
          //to: response[i][0].endtime,
          dateFrom: this.getFormattedDT(response[i][0].startdate, response[i][0].starttime, ''),
          dateTo: this.getFormattedDT(response[i][0].enddate, response[i][0].endtime, ''),
          from: this.getFormattedDT(response[i][0].startdate, response[i][0].starttime, 'time') + ' ' + this.getAMPM(response[i][0].startdate, response[i][0].starttime),
          to: this.getFormattedDT(response[i][0].enddate, response[i][0].endtime, 'time') + ' ' + this.getAMPM(response[i][0].enddate, response[i][0].endtime),
          data: response[i][0],
          extra: tempExtra
        });
        var documents = [], weblink = {};
        for(var j=1; j<response[i].length; j++) {
          // if(response[i][j].documents.length > 0) {
          //   documents = response[i][j].documents;
          // }

          if(this.getCurrentClass(this.getFormattedDT(response[i][j].startdate, response[i][j].starttime, ''))) {
            selectedClass.push({
              subject: response[i][0].subject_name,
              time: this.getFormattedDT(response[i][0].startdate, response[i][0].starttime, 'time') + ' ' + this.getAMPM(response[i][0].startdate, response[i][0].starttime) + ' - ' + this.getFormattedDT(response[i][0].enddate, response[i][0].endtime, 'time') + ' ' + this.getAMPM(response[i][0].enddate, response[i][0].endtime) 
            });
          }

          if(response[i][j].weblink !== undefined) {
            weblink = response[i][j].weblink;
          }
          var tempEventDates = [];
          tempEventDates.push({ 
            id: response[i][j].uniqueperiodid, 
            title: response[i][0].subject_name, 
            date: this.getFormattedUTCTime(response[i][j].startdate, response[i][j].starttime),
            //date: response[i][j].startdate.split('T')[0] + ' ' + response[i][0].starttime,
            color: this.getColor(this.getFormattedDT(response[i][j].startdate, response[i][j].starttime, ''), i), 
            extendedProps: { 
              parentId: response[i][0].uniqueperiodid,
              //toolbarTitle: response[i][0].subject_name + ' ' + response[i][0].class_name + ' ' + response[i][0].section_name + ' Time: ' + response[i][0].starttime + ' to ' + response[i][0].endtime,
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
              //times: response[i][0].starttime + ' ' + response[i][0].endtime, 
              times: this.getFormattedDT(response[i][0].startdate, response[i][0].starttime, 'time') + this.getAMPM(response[i][0].startdate, response[i][0].starttime) + ' to ' + this.getFormattedDT(response[i][0].enddate, response[i][0].endtime, 'time') + this.getAMPM(response[i][0].enddate, response[i][0].endtime), 
              documents: response[i][j],
              weblink: weblink,
              classObject: response[i]
            }
          });
          if(this.formatDate(Date()) === response[i][j].startdate.split('T')[0]) {
            preClassList.push({
              subject: response[i][0].subject,
              subject_name: response[i][0].subject_name,
              //starttime: response[i][0].starttime,
              starttime: this.getFormattedDT(response[i][0].startdate, response[i][0].starttime, 'time'),
              //endtime: response[i][0].endtime
              endtime: this.getFormattedDT(response[i][0].enddate, response[i][0].endtime, 'time'),
            });
          }
          this.calendarEvents = this.calendarEvents.concat(tempEventDates);
          documents = [];
          weblink = {};
        }
      }
      this.classList = this.classList.sort((a, b) => (a.subject > b.subject) ? 1 : -1);
      this.classList = this.highLightCurrentClass(this.classList, selectedClass);
      this.createAdvanceClassNotification(preClassList);
    } else {
      console.log(response.desc);
    } 
    this.spinnerCall = false;
  }

  highLightCurrentClass(classList, selectedClass) {
    for(var i=0; i<classList.length; i++) {
      for(var j=0; j<selectedClass.length; j++) {
        if(classList[i].subject === selectedClass[j].subject && classList[i].time === selectedClass[j].time) {
          classList[i].currentClass = true;
        }
      }
    }
    this.classList.sort((a) => (a.currentClass) ? -1 : 1);
    return classList;
  }

  createAdvanceClassNotification(preClassList) {
    preClassList = preClassList.sort((a, b) => (a.time > b.time) ? 1 : -1);
    if(preClassList.length > 0) {
      var now = new Date(), currentTime = '';
      currentTime = now.getHours() + ':' + now.getMinutes();
      for(var i=0; i<preClassList.length; i++) {
        if(
          this.convertHMToSecondsOnly(currentTime) >= this.convertHMToSecondsOnly(preClassList[i].starttime)
          &&
          this.convertHMToSecondsOnly(currentTime) <= this.convertHMToSecondsOnly(preClassList[i].endtime)
        ) {
          this.showMessage(preClassList[i].subject_name + ' class has started !');
        }
        var diff = (this.convertHMToSecondsOnly(preClassList[i].starttime) - this.convertHMToSecondsOnly(currentTime));
        if(diff > 0 && diff <= 15) {
          this.showMessage(preClassList[i].subject_name + ' class is about to start !');
        }
      }
    }
  }

  showMessage(subject: string) {
    this._snackBar.open(subject, 'X', {
      duration: 50000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: 'error-message'
    });
  }

  convertHMToSecondsOnly(str: string) {
    var p = str.split(':'), s = 0, m = 1;
    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }
    return s;
  }
  
}