import { Component, OnInit, Inject, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { NgForm } from '@angular/forms';
import { ZoomMtg } from '@zoomus/websdk';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UrlListService } from '../../shared/url-list.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { WebSocketService } from '../../services/websocket.service';
import { timer } from 'rxjs';
import JitsiMeetExternalAPI from '../../../lib/jitsi/external_api.js';
import { ClassAttendanceDialogComponent } from '../dashboard-details/class-attendance-dialog.component';

export interface DialogData {
}

ZoomMtg.preLoadWasm();
ZoomMtg.prepareJssdk();

@Component({
  selector: 'app-class-launch',
  templateUrl: './class-launch.component.html',
  styleUrls: ['./class-launch.component.css', '../../common/header/common.css']
})
export class ClassLaunchComponent implements OnInit {

  selectedDate: string[];
  layoutType = 'default';
  title = '';
  urls = {
    zoom: {
      number: '',
      password: ''
    },
    whiteBoard: ''
  };
  whiteBoardurl: any;
  noteclass = '';
  videowidth = '70%';
  videoheight = '450px';
  whiteboardwidth = '29%';
  whiteboardheight = '200px';
  classnotewidth = '29%';
  classnoteheight = '200px';
  chatboxwidth = '29%';
  chatboxheight = '275px';
  showAll = {
    video: true,
    whiteboard: true,
    classnote: false,
    chatbox: true
  };
  firstdiv = '70%';
  seconddiv = '29%';
  extraElement = false;
  userinfo: any;
  classDetails :any;
  chatinputbox: '';
  smallSize = true;
  bigSize = false;
  @ViewChild('myEl', { read: '', static: true }) 
  myDiv: ElementRef;

  //signatureEndpoint = 'http://localhost:4000'
  signatureEndpoint = '';
  apiKey = '4QeYXqSARl6a1joypX8L-w';
  role = 0;
  leaveUrl = this.urlListService.urls.leaveUrl + '#/dashboard/5f12f2c9e197714c8162be25/class';
  //leaveUrl = 'https://trueleap.io/#/dashboard/5f12f2c9e197714c8162be25/class';
  //leaveUrl = 'http://localhost:4200/#/dashboard/5f12f2c9e197714c8162be25/class';
  userName = '';
  meetingNumber = '';
  passWord = '';
  userEmail = 'kanakd2013@gmail.com';
  callAttdendance = 'NA';
  time =0;
  timerDisplay: any = null;
  paramUser = 0;
  obs$;

  url: SafeResourceUrl;
  domain:string = "meet.trueleap.in";
  options: any;
  api: any;
  videoType: 'jitsi';
  jitsiRoomName = '';
  videoUrl: any;  
  constructor(public router: Router, private activatedRoute: ActivatedRoute, public httpClient: HttpClient, @Inject(DOCUMENT) document, private sanitizer: DomSanitizer, private renderer: Renderer2, private urlListService: UrlListService, private _snackBar: MatSnackBar, public dialog: MatDialog, private websocketService: WebSocketService) {}
  ngOnInit() {
    //const classinfo = JSON.parse(localStorage.getItem('classinfo'));
    //this.userinfo = JSON.parse(localStorage.getItem('userData'));
    
    let classinfo: any;
    const tempUserData = JSON.parse(localStorage.getItem('userData'));
    const tempClassinfo = JSON.parse(localStorage.getItem('classinfo'));
    
    this.activatedRoute.params.subscribe(paramsId => {
      if(paramsId.user !== undefined) { 
        this.paramUser = paramsId.user;
        for(var i=0; i<tempUserData.users.length; i++) {
          if(tempUserData.users[i].user === paramsId.user) {
            classinfo = tempUserData.users[i].userinfo.classinfo;
            this.userinfo = tempUserData.users[i].userinfo;
          }
        } 
      } else {
        classinfo = tempClassinfo;
        this.userinfo = tempUserData;
      }
    });
    this.classDetails = classinfo;
    this.videoType = classinfo.videoType;
    this.jitsiRoomName = classinfo.jitsiRoomName;
    this.videoUrl = classinfo.videoUrl;
    if(classinfo.videoType === 'video') {
      var tempVideoUrl = classinfo.videoUrl.split('www.youtube.com');
      if(tempVideoUrl.length > 1) {
        tempVideoUrl = tempVideoUrl[1].split('?v=');
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + tempVideoUrl[1]);
      } else {
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(classinfo.videoUrl);
      }
    }
    this.selectedDate = this.formatDate(classinfo.date);
    this.urls.zoom = classinfo.zoom;
    this.whiteBoardurl = this.sanitizer.bypassSecurityTrustResourceUrl(this.urlListService.urls.whiteboard + classinfo.whiteBoard);
    //this.whiteBoardurl = this.sanitizer.bypassSecurityTrustResourceUrl('http://api.trueleap.io/dashboard/boards/dhyan');
    this.title = classinfo.extendedProps.toolbarTitle;
    this.userName = this.userinfo.username.fullname;
    this.meetingNumber = this.urls.zoom.number;
    this.passWord =  this.urls.zoom.password;
    this.signatureEndpoint = this.urlListService.urls.getSignature;
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://zoom.us/j/9278862669');
    if(classinfo.videoType === 'zoom') {
      if(this.meetingNumber) {
        this.getSignature();
      }
      this.reload();
    }  
  }

  ngAfterViewInit() {
    setTimeout(()=> {
      if(this.videoType === 'jitsi') {
        this.options = {
          roomName: this.jitsiRoomName,
          parentNode: document.querySelector('#meet')
        }
        this.api = new JitsiMeetExternalAPI(this.domain, this.options);
      }
    }, 3000);
  }
  
  reload() {
    if (!localStorage.getItem('x-fkp')) { 
      localStorage.setItem('x-fkp', 'no reload') 
      document.defaultView.location.reload(); 
    } else {
      localStorage.removeItem('x-fkp') 
    }
  }

  getSignature() {
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type': 'application/json',
          //'authorization': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vd3d3LnRydWVsZWFwLmlvLyIsInN1YiI6InNhdHlhaml0ZGVrYTE2QGdtYWlsLmNvbSIsInNjb3BlIjoic2VsZiIsImp0aSI6IjRmMjE2YzhhLTUwM2UtNGJlZi1hZjc0LTE4YWYwZmM4MjBiYiIsImlhdCI6MTU5Nzc3ODEyMSwiZXhwIjoxNTk3NzgxNzIxfQ.nhjN9klJrVi3jVSDxmOx3wdy376WLnCTY8mV4RziFYs'
      })
    };

    this.httpClient.post(this.signatureEndpoint, {
	    meetingNumber: this.meetingNumber,
	    role: this.role
    }, httpOptions).toPromise().then((data: any) => {
      if(data.signature) {
        //console.log(data.signature)
        this.startMeeting(data.signature)
      } else {
        console.log(data)
      }
    }).catch((error) => {
      console.log(error)
    })
  }

  startMeeting(signature) {
    let window = document.getElementById('zmmtg-root');
    window.style.display = 'block';
    window.style.position = 'relative'
    //window.style.width = '50%'

    //this.myDiv.nativeElement.previousSibling = window;
    this.renderer.appendChild(this.myDiv.nativeElement, window);
    ZoomMtg.init({
      leaveUrl: this.leaveUrl,
      isSupportAV: true,
      success: (success) => {
        console.log(success)

        ZoomMtg.join({
          signature: signature,
          meetingNumber: this.meetingNumber,
          userName: this.userName,
          apiKey: this.apiKey,
          userEmail: this.userEmail,
          passWord: this.passWord,
          success: (success) => {
            console.log('success', success)
          },
          error: (error) => {
            console.log(error)
          }
        })

        ZoomMtg.leaveMeeting({
          success: () => {
            console.log('sAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
          },
          error: err => {
            console.log(err);
            // some logic
            }
        });

      },
      error: (error) => {
        console.log(error)
      }
    })
  }
 
  toggleNoteChat(type: string) {
    if(type === 'chatbox-to-Note') {
      this.showAll.classnote = !this.showAll.classnote;
      this.showAll.chatbox = !this.showAll.chatbox;
    }
  }

  chatHeight(chatboxheight) {
    var temp = parseInt(chatboxheight.split('px')[0]);
    temp = temp - 90;
    return (temp + 'px');
  }

  toggleScreen(type: string, content: string) {
    if(content === 'first') {
      this.firstdiv = '100%';
    }
    if(content === 'second') {
      this.seconddiv = '100%';
    }
    if(type === 'video') {
      this.videowidth = '100%';
      this.videoheight = '530px';  
      this.showAll.video = true;
      this.showAll.whiteboard = false;
      this.showAll.classnote = false;
      this.showAll.chatbox = false;
    }
    if(type === 'whiteboard') {
      this.whiteboardwidth = '100%';
      this.whiteboardheight = '400px';
      this.chatboxheight = '275px';  
      this.showAll.video = false;
      this.showAll.whiteboard = true;
      this.showAll.classnote = false;
      this.showAll.chatbox = true;
    }
    if(type === 'classnote') {
      this.classnotewidth = '100%';
      this.classnoteheight = '550px';
      this.showAll.video = false;
      this.showAll.whiteboard = false;
      this.showAll.classnote = true;
      this.showAll.chatbox = false;
    }
    if(type === 'chatbox') {
      this.chatboxwidth = '100%';
      this.chatboxheight = '550px';  
      this.showAll.video = false;
      this.showAll.whiteboard = false;
      this.showAll.classnote = false;
      this.showAll.chatbox = true;
    }
    this.extraElement = true;
    //if(this.userinfo.category === 'T') {
      let data = '';
      data += 'class:' + this.classDetails.extendedProps.grade + '#@#';
      data += 'subject:' + this.classDetails.extendedProps.subject + '#@#';
      data += 'section:' + this.classDetails.extendedProps.section + '#@#';
      data += 'semester:' + this.classDetails.extendedProps.semester + '#@#';
      data += 'period:' + this.classDetails.id + '#@#';
      console.log('data', data);
      this.websocketService.setScreenData(data);
    //}
  }

  getScreenData() {
    let data = this.websocketService.getScreenData();
    if(data) {
      // var started = msg.split('#@#')[6].split(':')[1];
      // if(this.callAttdendance !== started && started === 'Y') {
      //   this.callAttdendance = started;
      //   this.initiateAttendance();      
      // } 
      // if (started === 'N' && this.callAttdendance !== 'N') {
      //   this.callAttdendance = started;
      // }
      return data;
    }
  }

  switchScreen(type: string) {
    if(type === 'video') {
      this.firstdiv = '100%';
      this.videowidth = '100%';
      this.videoheight = '400px';  
      this.classnoteheight = '200px';
      this.showAll.video = true;
      this.showAll.whiteboard = false;
      this.showAll.classnote = false;
      this.showAll.chatbox = false;
    }
    if(type === 'whiteboard') {
      this.seconddiv = '100%';
      this.whiteboardwidth = '100%';
      this.whiteboardheight = '400px';
      this.chatboxheight = '275px';    
      this.showAll.video = false;
      this.showAll.whiteboard = true;
      this.showAll.classnote = false;
      this.showAll.chatbox = true;
    }
    if(type === 'classnote') {
      this.firstdiv = '100%';
      this.classnotewidth = '100%';
      this.classnoteheight = '550px';
      this.showAll.video = false;
      this.showAll.whiteboard = false;
      this.showAll.classnote = true;
      this.showAll.chatbox = false;
    }
    if(type === 'chatbox') {
      this.seconddiv = '100%';
      this.chatboxwidth = '100%';
      this.chatboxheight = '550px';  
      this.showAll.video = false;
      this.showAll.whiteboard = false;
      this.showAll.classnote = false;
      this.showAll.chatbox = true;
    }
  }

  onLayoutChange() {
    if(this.layoutType === 'default') {
      this.toggleNormal();
    }    
    if(this.layoutType === 'video') {
      this.firstdiv = '100%';  
      this.showAll.video = true;
      this.showAll.whiteboard = false;
      this.showAll.classnote = false;
      this.showAll.chatbox = false;
    }
    if(this.layoutType === 'whiteboard') {
      this.seconddiv = '100%';  
      this.whiteboardheight = '300px';
      this.chatboxheight = '100px';
      this.classnoteheight = '100px';
      this.showAll.video = false;
      this.showAll.whiteboard = true;
      this.showAll.classnote = false;
      this.showAll.chatbox = true;
    }
  }

  toggleNormal() {
    this.videowidth = '70%';
    this.videoheight = '300px';
    this.whiteboardwidth = '29%';
    this.whiteboardheight = '200px';
    this.classnotewidth = '29%';
    this.classnoteheight = '100px';
    this.chatboxwidth = '29%';
    this.chatboxheight = '275px';
    this.showAll = {
      video: true,
      whiteboard: true,
      classnote: false,
      chatbox: true
    };
    this.firstdiv = '70%';
    this.seconddiv = '29%';
    this.extraElement = false;
  }

  formatDate(date: string | number | Date) {
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

  onSaveNote(form: NgForm) {
    if (!form.valid) {
      return;
    }
    var response: any, dataTemp = {
      id: this.classDetails.id,
      classnote: {
        notes: this.noteclass,
        publish: true
      }
    };

    this.httpClient.post(this.urlListService.urls.modifyDailyClass, dataTemp)
    .subscribe(
      resData => {
        response = resData;
        if(response.code === '200-UPP-001') {
          this._snackBar.open('Note is added successfully !', 'X', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'success-message'
          });
          //form.resetForm();
        } else {
          this._snackBar.open('Failed to add note !', '', {
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

  startAttendance(type: string) {
    let data = '';
    data += 'class:' + this.classDetails.extendedProps.grade + '#@#';
    data += 'subject:' + this.classDetails.extendedProps.subject + '#@#';
    data += 'section:' + this.classDetails.extendedProps.section + '#@#';
    data += 'semester:' + this.classDetails.extendedProps.semester + '#@#';
    data += 'period:' + this.classDetails.id + '#@#';
    data += 'user:' + this.userName + '#@#';
    if(type === 'Y') {
      // this._snackBar.open('Class attendance is started !', 'X', {
      //   duration: 5000,
      //   horizontalPosition: 'center',
      //   verticalPosition: 'top',
      //   panelClass: 'success-message'
      // });
      //data += 'attendanceStatus:Y';      
      this.initiateAttendance();
      this.startTimer();
    }
    if(type === 'N') {
      // this._snackBar.open('Class attendance is over !', 'X', {
      //   duration: 5000,
      //   horizontalPosition: 'center',
      //   verticalPosition: 'top',
      //   panelClass: 'success-message'
      // });
      this.stopTimer();
    }
    data += 'attendanceStatus:' + type;
    this.websocketService.startAttendance(data);
  }
  
  getAttendance() {
    let msg = this.websocketService.getAttendance();
    if(msg) {
      var started = msg.split('#@#')[6].split(':')[1];
      if(this.callAttdendance !== started && started === 'Y') {
        this.callAttdendance = started;
        this.initiateAttendance();      
      } 
      if (started === 'N' && this.callAttdendance !== 'N') {
        this.callAttdendance = started;
      }
      return started;
    }
  }

  onCancelClick() {
    //ZoomMtg.leaveMeeting({});
    // ZoomMtg.leaveMeeting({
    //   success: () => {
    //     console.log('sAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    //   },
    //   error: err => {
    //     console.log(err);
    //   }
    // });
    //this.router.navigate(['/dashboard/5f12f2c9e197714c8162be25']);
    let tempData = {};
    const dialogRef = this.dialog.open(DialogWarningDialog, {
      width: '400px',
      disableClose: true,
      panelClass: 'warning-dialog',
      data: { tempData }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === 'save') {
        if(this.paramUser === 0) {
          this.router.navigate(['/dashboard/5f12f2c9e197714c8162be25']);
        } else {
          this.router.navigate(['/u/' + this.paramUser + '/dashboard/5f12f2c9e197714c8162be25']);
        }
      }
    });
  }

  initiateAttendance() {
    var attendanceReturnValue = this.websocketService.getAttendance();
    if(this.userinfo.category === 'S' && attendanceReturnValue !== undefined) {
      if(this.classDetails.id === attendanceReturnValue.split('#@#')[4].split(':')[1]) {
        let tempData = {};
        const dialogRef = this.dialog.open(DialogAttendanceDialog, {
          width: '400px',
          disableClose: true,
          panelClass: 'warning-dialog',
          data: { tempData }
        });

        dialogRef.afterClosed().subscribe(result => {
          if(result.success === 'yes') {
            var temp = { period: this.classDetails.id, name: result.studentName };
            this.websocketService.sendResponseAttendance(temp);
            this._snackBar.open('Your attendance is recorded !', 'X', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: 'success-message'
            });
          }
        });
      }
    }
  }

  classAttendance() {
    const dialogProjectRef = this.dialog.open(ClassAttendanceDialogComponent, {
      disableClose: true,
      panelClass: 'attendance-history-wrapper',
      width: '300px',
      data: {}
    });

    dialogProjectRef.afterClosed().subscribe(result => {
      if(result !== undefined) {
        console.log('The dialog was closed', result);
      }
    });
  }

  getResponseAttendance() {
    var data = this.websocketService.getResponseAttendance();
    console.log('data', data);
  }

  sendMessage(item: string) {
    let data = '';
    data += 'class:' + this.classDetails.extendedProps.grade + '#@#';
    data += 'subject:' + this.classDetails.extendedProps.subject + '#@#';
    data += 'section:' + this.classDetails.extendedProps.section + '#@#';
    data += 'semester:' + this.classDetails.extendedProps.semester + '#@#';
    data += 'period:' + this.classDetails.id + '#@#';
    data += 'user:' + this.userName + '#@#';
    if(item === 'message') {
      if(this.chatinputbox !== '') {
        data += 'chatText:' + this.chatinputbox;
        this.websocketService.sendChatMessage(data);
      }
      this.chatinputbox = '';
    } 
    if(item === 'raisehand') {
      data += 'chatText:' + '$raisehand;';
      this.websocketService.sendChatMessage(data);
    }
    if(item === 'emoji-i-applause') {
      data += 'chatText:' + '$emoji-i-applause;';
      this.websocketService.sendChatMessage(data);
    }
    if(item === 'emoji-i-emoticon') {
      data += 'chatText:' + '$emoji-i-emoticon;';
      this.websocketService.sendChatMessage(data);
    }
    if(item === 'emoji-i-ok') {
      data += 'chatText:' + '$emoji-i-ok;';
      this.websocketService.sendChatMessage(data);
    }
    if(item === 'emoji-i-bell') {
      data += 'chatText:' + '$emoji-i-bell;';
      this.websocketService.sendChatMessage(data);
    }
    if(item === 'emoji-i-star') {
      data += 'chatText:' + '$emoji-i-star;';
      this.websocketService.sendChatMessage(data);
    }
    var objDiv = document.getElementById("chat-box-scroll-bottom");
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  getMessage() {
    var msgList = [];
    var allMessage = this.websocketService.getClassChat();
    if(allMessage.length > 0) {
      for(var i=0; i<allMessage.length; i++) {
        var temp = allMessage[i].split('#@#');
        if(this.classDetails.id === temp[4].split(':')[1]) {
          msgList.push(allMessage[i]);
        }
      }
      var objDiv = document.getElementById("chat-box-scroll-bottom");
      objDiv.scrollTop = objDiv.scrollHeight;
      return msgList;
    }
  }

  parseChatTextUser(text) {
    return text.split('#@#')[5].split(':')[1];
  }

  parseChatText(text) {
    return text.split('#@#')[6].split(':')[1];
  }

  stopTimer() {
    this.obs$.next();
    this.obs$.complete();
    this.timerDisplay = null;
    this.time = 0;
  }
  startTimer() {
    if (this.time) return;
    this.obs$ = timer(0, 1000).subscribe(ec => {
      this.time++;
      const timerObj = this.getDisplayTimer(this.time);
       this.timerDisplay = timerObj.hours.digit1 + timerObj.hours.digit2 + ' : ' +
       timerObj.minutes.digit1 + timerObj.minutes.digit2 + ' : ' +
       timerObj.seconds.digit1 + timerObj.seconds.digit2
    });
  }

  getDisplayTimer(time: number) {
    const hours = '0' + Math.floor(time / 3600);
    const minutes = '0' + Math.floor(time % 3600 / 60);
    const seconds = '0' + Math.floor(time % 3600 % 60);

    return {
      hours: { digit1: hours.slice(-2, -1), digit2: hours.slice(-1) },
      minutes: { digit1: minutes.slice(-2, -1), digit2: minutes.slice(-1) },
      seconds: { digit1: seconds.slice(-2, -1), digit2: seconds.slice(-1) },
    };
  } 
  
}

@Component({
  selector: 'dialog-warning-dialog',
  template: '<div class="main-content"><div class="well-create"><div class="header">' +
  '<div class="header-text">Warning Confirmation</div><mat-icon aria-hidden="false" class="close-cross" (click)="onCancelClick()" aria-label="Example close icon">close</mat-icon></div><div class="content">' +
  '   <form #authForm="ngForm">' +
  '   <div fxLayout="row" fxLayoutAlign="start none">' +
  '     <div class="request-form">Are you sure want to exit this class ?</div></div>' +
  '   <div fxLayout="row" fxLayoutAlign="center none"><button mat-raised-button type="button" (click)="onClickSave()" style="margin-right: 10px;">Exit</button><button mat-raised-button type="button" (click)="onCancelClick()">Stay</button></div>' +
  '   </form></div></div></div>',
})

export class DialogWarningDialog {
  dataObject = {
    id: 0,
    section: ''
  };
  
  constructor(
    public dialogRef: MatDialogRef<DialogWarningDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private _snackBar: MatSnackBar, private http: HttpClient) {
    }
  ngOnInit() {
    if(this.data) {
    } 
  }  
  
  onCancelClick() {
    this.dialogRef.close();
  }

  onClickSave() {
    this.dialogRef.close('save');
  }
}

@Component({
  selector: 'dialog-warning-dialog',
  template: '<div class="main-content"><div class="well-create"><div class="header">' +
  '<div class="header-text">Record Your Attendance</div></div><div class="content">' +
  '   <form #authForm="ngForm">' +
  '   <div fxLayout="row" fxLayoutAlign="start none">' +
  '     <div class="request-form">Your teacher has started attendance process. Please confirm to record it.</div></div>' +
  '   <div fxLayout="row" fxLayoutAlign="center none"><button mat-raised-button type="button" (click)="onClickConfirm()">Confirm</button></div>' +
  '   </form></div></div></div>',
})

export class DialogAttendanceDialog {
  dataObject = {};
  userinfo: any;
  classinfo: any;

  constructor(
    public dialogRef: MatDialogRef<DialogAttendanceDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private _snackBar: MatSnackBar, private http: HttpClient, private urlListService: UrlListService) {
    }
  ngOnInit() {
    this.classinfo = JSON.parse(localStorage.getItem('classinfo'));
    this.userinfo = JSON.parse(localStorage.getItem('userData')); 
  }  
  
  onClickConfirm() {
    let response: any;
    var dataTemp = {
      class: this.classinfo.extendedProps.grade,
      subject: this.classinfo.extendedProps.subject,
      semester: this.classinfo.extendedProps.semester,
      section: this.classinfo.extendedProps.section,
      period: this.classinfo.id,
      user: this.userinfo.username.fullname,
      isPresent: 'Y'
    };
    this.http.post(this.urlListService.urls.updateAttendance, dataTemp)
    .subscribe(
      resData => {
        response = resData;
        if(response.code === '200-TAT-001') {
          // this._snackBar.open('Attendance is recorded successfully !', 'X', {
          //   duration: 5000,
          //   horizontalPosition: 'center',
          //   verticalPosition: 'top',
          //   panelClass: 'success-message'
          // });
          this.dialogRef.close({ success: 'yes', studentName: this.userinfo.username.fullname });
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

}