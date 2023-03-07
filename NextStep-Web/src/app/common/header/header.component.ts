import { Component, OnInit, OnDestroy, Output, EventEmitter, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfileComponent } from '../../module/profile/profile.component';
import { UrlListService } from '../../shared/url-list.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ResetPasswordComponent } from '../../forgot-password/reset-password.component';
export interface DialogData {
  list: [],
  load: false
}
export interface DialogDataExpand {
  message: {
    noteExpand: ''
  }
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  private userSub: Subscription;
  uName = 'Admin';
  userType = 'Admin';
  userid = 0;
  notificationCount: any;
  notificationList = [];
  paramsUser = 0;
  userDataAll: any;
  profilephoto = '';
  constructor(private authService: AuthService, private router: Router, public dialog: MatDialog, public urlListService: UrlListService, private http: HttpClient, private activatedRoute: ActivatedRoute) {}

  inputName = '';
  @Output() buttonClicked = new EventEmitter();
  showName() {
    console.log('showName clicked.');
    this.inputName = 'temp'
    this.buttonClicked.emit(this.inputName);
  }

  ngOnInit() {
    let userinfo: any;
    this.userSub = this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
    });
    const classinfo = JSON.parse(localStorage.getItem('classinfo'));
    const tempUserData = JSON.parse(localStorage.getItem('userData'));
    this.userDataAll = tempUserData;
    this.activatedRoute.params.subscribe(paramsId => {
      if(paramsId.user !== undefined) { 
        this.paramsUser = parseInt(paramsId.user);
        for(var i=0; i<tempUserData.users.length; i++) {
          if(tempUserData.users[i].user === paramsId.user) {
            userinfo = tempUserData.users[i].userinfo;
          }
        } 
      } else {
        userinfo = tempUserData;
      }
    });
    this.userid = userinfo.id;
    if(userinfo.category === 'S' || userinfo.category === 'T' || userinfo.category === 'A') {
      this.uName = userinfo.username.fullname;
    }
    this.uName = (this.uName === '') ? 'Name' : this.uName;
    if(userinfo.category === 'S') {
      this.userType = 'Student';
    }
    if(userinfo.category === 'T') {
      this.userType = 'Teacher';
    }
    this.getNotification(classinfo);
    if(userinfo.username.fullname === '') {
      this.onProfile();
    }
    this.profilephoto = userinfo.username.profilephoto;
  }

  onReset() {
    const dialogProjectRef = this.dialog.open(ResetPasswordComponent, {
      disableClose: true,
      panelClass: 'profile-new-class',
      width: '400px',
      data: {'paramsUser': this.paramsUser}
    });

    dialogProjectRef.afterClosed().subscribe(result => {
      if(result !== undefined) {
        console.log('The dialog was closed', result);
      }
    });
  }

  onDifferentUser() {
    window.open(this.urlListService.urls.diffUser + 'u/' + (this.paramsUser + 1) + '/login/user'); 
  }

  onLogout() {
    //console.log('aa',this.paramsUser);
    //if(this.paramsUser === 0) {
      this.authService.logout();
    //} else {
      // for(var i=0; i<this.userDataAll.users.length; i++) {
      //   if(this.userDataAll.users[i].user === this.paramsUser) {
      //   }
      // }
      // let newUser = this.userDataAll.users.filter(function( obj ) {
      //   return parseInt(obj.user) !== this.paramsUser;
      // });
      // console.log('newUser', newUser);
    //}
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  onProfile(): void {
    const dialogProjectRef = this.dialog.open(ProfileComponent, {
      disableClose: true,
      panelClass: 'profile-new-class',
      width: '500px',
      data: {'paramsUser': this.paramsUser}
    });

    dialogProjectRef.afterClosed().subscribe(result => {
      if(result !== undefined) {
        console.log('The dialog was closed', result);
      }
    });
  }

  getNotification(classinfo) {
    let response: any;
    this.http.post(this.urlListService.urls.fetchNotification, {'userid': this.userid})
    .subscribe(
      resData => {
        response = resData;
        let count = 0;
        for(var i=0; i<response.length; i++) {
          if(!response[i].viewed) {
            count += 1;
          }
        }
        this.notificationCount = count > 0 ? count : '';
        this.notificationList = response;
        for(var i=0; i<this.notificationList.length; i++) {
          this.notificationList[i].date = this.formatDate(this.notificationList[i].date);
          this.notificationList[i].limitedText = '';
          this.notificationList[i].message.noteExpand = this.notificationList[i].message.note;
          if(this.notificationList[i].message.note.length > 55) {
            this.notificationList[i].limitedText = this.notificationList[i].message.note;
            this.notificationList[i].message.note = this.notificationList[i].message.note.slice(0, 55) + '...';
          }
        }
        this.notificationList = this.notificationList.sort((a, b) => (a.viewed) ? 1 : -1);
        var viewedNotification = false;
        for(var i=0; i<this.notificationList.length; i++) {
          if(!this.notificationList[i].viewed) {
            viewedNotification = true;
            break;
          }
        }
        if(classinfo === null && viewedNotification) {
          this.showNotification('load');
        }
      },
      errorMessage => {
        if(errorMessage.status === 401) {
          this.getExpiry();
        } 
      }
    );
  }

  getExpiry() {
    const dialogProjectRef = this.dialog.open(ExpiryComponent, {
      disableClose: true,
      panelClass: 'profile-new-class',
      width: '300px',
      data: ''
    });

    dialogProjectRef.afterClosed().subscribe(result => {
      this.authService.logout();
    });
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
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    var d = new Date(date),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (day.length < 2) 
        day = '0' + day;
    return [weekday[d.getDay()] + ', ' + month[d.getMonth()] + ' ' + day + ', ' + year];
  }

  showNotification(type) {
    var positionVal = {}, classVal = 'notification-list', temp = { list: this.notificationList, load: false };
    if(type === 'load') {
      positionVal = {top: '0%'};
      classVal = 'notification-list-load';
      temp = { list: this.notificationList, load: true };
    } else {
      positionVal = {top: '0%', right: '0%'};
    }
    const dialogProjectRef = this.dialog.open(DialogNotification, {
      disableClose: true,
      panelClass: classVal,
      position: positionVal,
      width: '450px',
      data: temp
    });

    dialogProjectRef.afterClosed().subscribe(result => {
      this.getNotification('load');
    });
  }
}

@Component({
  selector: 'expiry-component',
  templateUrl: './expiry.component.html',
  styleUrls: ['./header.component.css', '../../common/header/common.css']
})

export class ExpiryComponent {
  constructor(
    public dialogRef: MatDialogRef<ExpiryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, public dialog: MatDialog) {
    }
  ngOnInit() {}  
  
  onCancelClick() {
    this.dialogRef.close();
  }
}
@Component({
  selector: 'dialog-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./header.component.css', '../../common/header/common.css']
})

export class DialogNotification {
  list: any;
  userid = 0; 
  load = false;
  constructor(
    public dialogRef: MatDialogRef<DialogNotification>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private http: HttpClient, public urlListService: UrlListService, public dialog: MatDialog) {
    }
  ngOnInit() {
    this.list = this.data.list;
    this.load = this.data.load;
    const userinfo = JSON.parse(localStorage.getItem('userData'));
    this.userid = userinfo.id;
  }  
  
  onCancelClick() {
    this.dialogRef.close();
  }

  getList() {
    let response: any;
    this.http.post(this.urlListService.urls.fetchNotification, {'userid': this.userid})
    .subscribe(
      resData => {
        response = resData;
        this.list = [];
        this.list = response;
        for(var i=0; i<this.list.length; i++) {
          this.list[i].message.noteExpand = this.list[i].message.note;
          this.list[i].date = this.formatDate(this.list[i].date);
          this.list[i].limitedText = '';
          if(this.list[i].message.note.length > 55) {
            this.list[i].limitedText = this.list[i].message.note;
            this.list[i].message.note = this.list[i].message.note.slice(0, 55) + '...';
          }
        }
        this.list = this.list.sort((a, b) => (a.viewed) ? 1 : -1);

      },
      errorMessage => { 
      }
    );
  }

  onMarkAsRead(item: { notificationid: any; }) {
    var data = {
      userid: this.userid,
      notificationid: item.notificationid,
      status: 'r'
    };
    let response: any;
    this.http.post(this.urlListService.urls.modifyNotification, data)
    .subscribe(
      resData => {
        response = resData;
        if(response.code === "200-UNN-001") {
          this.getList();
        }
      },
      errorMessage => { 
      }
    );
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
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    var d = new Date(date),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (day.length < 2) 
        day = '0' + day;
    return [weekday[d.getDay()] + ', ' + month[d.getMonth()] + ' ' + day + ', ' + year];
  }

  onExpand(item: any) {
    const dialogProjectRef = this.dialog.open(DialogNotificationExpand, {
      disableClose: true,
      panelClass: 'notification-list-expand',
      width: '700px',
      data: item
    });

    dialogProjectRef.afterClosed().subscribe(result => {
      this.getList();
    });
  }
}

@Component({
  selector: 'dialog-notification-expand',
  templateUrl: './notification-expand.component.html',
  styleUrls: ['./header.component.css', '../../common/header/common.css']
})

export class DialogNotificationExpand {
  userid = 0; 
  constructor(
    public dialogRef: MatDialogRef<DialogNotificationExpand>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDataExpand, private http: HttpClient, public urlListService: UrlListService, public dialog: MatDialog) {
    }
  ngOnInit() {
    const userinfo = JSON.parse(localStorage.getItem('userData'));
    this.userid = userinfo.id;
    this.onMarkAsRead(this.data);
  }  

  onMarkAsRead(item) {
    var data = {
      userid: this.userid,
      notificationid: item.notificationid,
      status: 'r'
    };
    this.http.post(this.urlListService.urls.modifyNotification, data)
    .subscribe();
  }
  
  onCancelClick() {
    this.dialogRef.close();
  }
}
