import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UrlListService } from '../../shared/url-list.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { NotifyDialogComponent } from '../notify-dialog/notify-dialog.component';
import moment from 'moment';
import { ClassAttendanceDialogComponent } from './class-attendance-dialog.component';

export interface DialogData {
  tempData: any;
  id: string,
  subject: string
}

@Component({
  selector: 'app-dashboard-details',
  templateUrl: './dashboard-details.component.html',
  styleUrls: ['./dashboard-details.component.css', '../../common/header/common.css']
})
export class DashboardDetailsComponent implements OnInit {

  category = 'S';
  dataObject = {
    zoom: '',
    zoomPassword: '',
    whiteBoard: '',
    index: 0,
    noteTitle: '',
    note: '',
    image: '',
    checked: 'Public',
    documentType: 'A',
    link: '',
    date: '',
    videoType: 'zoom',
    jitsiRoomName: '',
    videoUrl: ''
  };
  dataActual = {
    zoom: '',
    zoomPassword: '',
    whiteBoard: '',
    noteList: [],
    videoType: 'zoom',
    jitsiRoomName: '',
    videoUrl: ''
  };
  selectedDate: any;
  classDetails = {
    id: '',
    date: '',
    extendedProps: {
      days: [],
      grade: '',
      grade_name: '',
      section: '',
      section_name: '',
      subject: '',
      subject_name: '',
      semester: '',
      semester_name: '',
      times: '',
      toolbarTitle: '',
      documents: [],
      weblink: {
        zoom: {code: '', password: ''}
      }
    }
  };
  fileToUpload: File = null;
  fileProgressBar = false;
  profileData = {
    id: ''
  };
  reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
  //todayDate = new Date().toISOString().slice(0,10);
  todayDate = '';
  paramUser = 0;

  constructor(public router: Router, private activatedRoute: ActivatedRoute, private http: HttpClient, private _snackBar: MatSnackBar, private urlListService: UrlListService, public dialog: MatDialog) {}
  ngOnInit() {
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

    this.selectedDate = this.formatDate(classinfo.date);
    this.classDetails = classinfo;
    this.profileData.id = userinfo.id;
    this.category = userinfo.category;
    this.getClassInfo(classinfo.extendedProps.documents);
    this.dataObject.jitsiRoomName = classinfo.id;
    this.dataActual.jitsiRoomName = classinfo.id;
    if(Object.keys(classinfo.extendedProps.weblink).length > 0) {
      this.dataObject.zoom = classinfo.extendedProps.weblink.zoom.code;
      this.dataObject.zoomPassword = classinfo.extendedProps.weblink.zoom.password;
      this.dataObject.videoType = classinfo.extendedProps.weblink.skype.password;
      this.dataObject.videoUrl = classinfo.extendedProps.weblink.video.url;
      this.dataActual.zoom = classinfo.extendedProps.weblink.zoom.code;
      this.dataActual.zoomPassword = classinfo.extendedProps.weblink.zoom.password;
      this.dataActual.videoType = classinfo.extendedProps.weblink.skype.password;
      this.dataActual.videoUrl = classinfo.extendedProps.weblink.video.url;
      if(classinfo.extendedProps.weblink.dashboard) {
        this.dataObject.whiteBoard = classinfo.extendedProps.weblink.dashboard.url;
        this.dataActual.whiteBoard = classinfo.extendedProps.weblink.dashboard.url;
      }
    }
    if(this.dataObject.whiteBoard !== '' || this.dataObject.whiteBoard !== undefined) {
      this.dataObject.whiteBoard = this.classDetails.id;
      this.dataActual.whiteBoard = this.classDetails.id;
    }
    this.todayDate = classinfo.date;
  }

  checkDate(date) {
    if(date.split('T')[0] > new Date().toISOString().slice(0,10)) {
      return false;
    } else {
      return true;
    }
  }

  formatDate(date) {
    const timeZoneOne = moment.tz.guess(true);
    const istMomentObj = moment.tz(date, timeZoneOne);
    return istMomentObj.format("dddd, MMMM Do YYYY");
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

  onCancelClick() {
    if(this.paramUser === 0) {
      if(this.category === 'A') {
        this.router.navigate(['/admin-directory']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    } else {
      if(this.category === 'A') {
        this.router.navigate(['/u/' + this.paramUser + '/admin-directory']);
      } else {
        this.router.navigate(['/u/' + this.paramUser + '/dashboard']);
      }
    }
  }

  saveJitsiVideo() {
    var dataTemp = {
      id: this.classDetails.id,
      zoom : {
        code: this.removeSpace(this.dataObject.zoom),
        password: this.dataObject.zoomPassword,
        url: '',
        publish: true
      },
      skype : {
        code: this.dataObject.jitsiRoomName, 
        password: this.dataObject.videoType, 
        url: '',
        publish: false
      },
      jitsi : {
        code: this.dataObject.jitsiRoomName, 
        password: '', 
        url: '',
        publish: false
      },
      video : {
        code: '', 
        password: '', 
        url: this.dataObject.videoUrl,
        publish: false
      }
    };
    
    this.http.post(this.urlListService.urls.modifyDailyClass, dataTemp)
    .subscribe(
      resData => {},
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

  radioChange() {
    this.dataActual.videoType = this.dataObject.videoType;
    if(this.dataObject.videoType === 'jitsi') {
      this.saveJitsiVideo();
    }
  }

  onClickLaunch() {
    if(this.category === 'S') {
      this.goToLaunch();
    } else {
      if(this.dataActual.videoType === 'zoom' && this.dataActual.zoom !== '' && this.dataActual.zoomPassword !== '') {
        this.goToLaunch();
      } else if(this.dataActual.videoType === 'video' && this.dataActual.videoUrl !== '') {
        this.goToLaunch();
      } else if(this.dataActual.videoType === 'jitsi') {
        this.goToLaunch();
      } else {
        this._snackBar.open('Please update ' + this.dataActual.videoType + ' information to procceed !', '', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'error-message'
        });
      } 
    }
  }

  goToLaunch() {
    if(this.paramUser === 0) {
      var temp = JSON.parse(localStorage.getItem('classinfo'));
      temp.zoom = { code: this.removeSpace(this.dataActual.zoom), number: this.removeSpace(this.dataActual.zoom), password: this.dataActual.zoomPassword };
      temp.skype = { code: this.dataActual.jitsiRoomName, password: this.dataActual.videoType };
      temp.jitsi = { code: this.dataActual.jitsiRoomName };
      temp.video = { url: this.dataActual.videoUrl };
      temp.whiteBoard = this.dataActual.whiteBoard;
      temp.videoUrl = this.dataActual.videoUrl;
      temp.videoType = this.dataActual.videoType;
      temp.jitsiRoomName = this.dataActual.jitsiRoomName;
      temp.extendedProps.weblink.zoom = temp.zoom;
      temp.extendedProps.weblink.skype = temp.skype;
      temp.extendedProps.weblink.jitsi = temp.jitsi;
      temp.extendedProps.weblink.video = temp.video;
      localStorage.setItem('classinfo', JSON.stringify(temp));
      this.router.navigate(['dashboard/5f12f2c9e197714c8162be25/class']);  
    } else {
      let tempUserData = JSON.parse(localStorage.getItem('userData'));
      for(var i=0; i<tempUserData.users.length; i++) {
        if(tempUserData.users[i].user === this.paramUser) {
          tempUserData.users[i].userinfo.classinfo.zoom = { 'number': this.removeSpace(this.dataActual.zoom), 'password': this.dataActual.zoomPassword };
          tempUserData.users[i].userinfo.classinfo.whiteBoard = this.dataActual.whiteBoard;
        }
      }
      localStorage.setItem('userData', JSON.stringify(tempUserData));
      this.router.navigate(['/u/' + this.paramUser + '/dashboard/5f12f2c9e197714c8162be25/class']);
    }
  }

  goTo(item: string) {
    if(this.paramUser === 0) {
      if(item === 'student') {
        this.router.navigate(['/student']);
      }
      if(item === 'document') {
        this.router.navigate(['/class-document']);
      }
      if(item === 'checkassignment') {
        this.router.navigate(['/check-assignment']);
      }
      if(item === 'gradebook') {
        this.router.navigate(['/gradebook']);
      }
      if(item === 'quiz') {
        this.router.navigate(['/quiz']);
      }
      if(item === 'note') {
        this.router.navigate(['/note']);
      }
      if(item === 'search') {
        this.router.navigate(['/search']);
      }
    } else {
      if(item === 'student') {
        this.router.navigate(['/u/' + this.paramUser + '/student']);
      }
      if(item === 'document') {
        this.router.navigate(['/u/' + this.paramUser + '/class-document']);
      }
      if(item === 'checkassignment') {
        this.router.navigate(['/u/' + this.paramUser + '/check-assignment']);
      }
      if(item === 'gradebook') {
        this.router.navigate(['/u/' + this.paramUser + '/gradebook']);
      }
      if(item === 'quiz') {
        this.router.navigate(['/u/' + this.paramUser + '/quiz']);
      }
      if(item === 'note') {
        this.router.navigate(['/u/' + this.paramUser + '/note']);
      }
      if(item === 'search') {
        this.router.navigate(['/u/' + this.paramUser + '/search']);
      }
    }
    if(item === 'notify') {
      this.openNotify();
    }
    if(item === 'zoom') {
      window.open('https://zoom.us/signin', "_blank");
    }
    if(item === 'jitsi') {
      window.open('https://meet.trueleap.in/', "_blank");
    }
    if(item === 'chathistory') {
      this.chatHistory();
    }
    if(item === 'classattendance') {
      this.classAttendance();
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

  chatHistory() {
    const dialogProjectRef = this.dialog.open(ChatHistoryDialogComponent, {
      disableClose: true,
      panelClass: 'chat-history-wrapper',
      width: '800px',
      data: {}
    });

    dialogProjectRef.afterClosed().subscribe(result => {
      if(result !== undefined) {
        console.log('The dialog was closed', result);
      }
    });
  }

  openNotify() {
    let data: any;
    if(this.category === 'S') {
      data = {grade: this.classDetails.extendedProps.grade, section: this.classDetails.extendedProps.section, type: 'toteacher'}
    }
    if(this.category === 'T') {
      data = {grade: this.classDetails.extendedProps.grade, section: this.classDetails.extendedProps.section, semester: this.classDetails.extendedProps.semester, type: 'allclass'}
    }
    const dialogProjectRef = this.dialog.open(NotifyDialogComponent, {
      disableClose: true,
      panelClass: 'notify-dialog',
      width: '500px',
      data: data
    });

    dialogProjectRef.afterClosed().subscribe(result => {
      if(result !== undefined) {
        console.log('The dialog was closed', result);
      }
    });
  }

  removeSpace(text: string) {
    return text ? text.split(" ").join("") : '';
  }

  onSaveStream(form: NgForm) {
    if (!form.valid) {
      return;
    }
    this.saveVideoInformation('');
  }

  saveVideoInformation(type) {
    var response: any, dataTemp = {
      id: this.classDetails.id,
      zoom : {
        code: this.removeSpace(this.dataObject.zoom),
        password: this.dataObject.zoomPassword,
        url: '',
        publish: true
      },
      skype : {
        code: this.dataObject.jitsiRoomName, 
        password: this.dataObject.videoType, 
        url: '',
        publish: false
      },
      jitsi : {
        code: this.dataObject.jitsiRoomName, 
        password: '', 
        url: '',
        publish: false
      },
      video : {
        code: '', 
        password: '', 
        url: this.dataObject.videoUrl,
        publish: false
      }
    };
    if(this.category === 'S') {
      this.onClickLaunch();
    } else { 
      this.http.post(this.urlListService.urls.modifyDailyClass, dataTemp)
      .subscribe(
        resData => {
          response = resData;
          if(response.code === '200-UPP-001') {
            if(type === 'launch') {
              this.onClickLaunch();
            } else {
              this._snackBar.open('Video information has been updated successfully !', 'X', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: 'success-message'
              });
              this.dataActual.zoom = this.removeSpace(this.dataObject.zoom);
              this.dataActual.zoomPassword = this.dataObject.zoomPassword;
              this.dataActual.whiteBoard = this.dataObject.whiteBoard;
              this.dataActual.jitsiRoomName = this.dataObject.jitsiRoomName;
              this.dataActual.videoType = this.dataObject.videoType;
              this.dataActual.videoUrl = this.dataObject.videoUrl;
              var temp = JSON.parse(localStorage.getItem('classinfo'));
              temp.zoom = { code: this.removeSpace(this.dataActual.zoom), number: this.removeSpace(this.dataActual.zoom), password: this.dataActual.zoomPassword };
              temp.skype = { code: this.dataActual.jitsiRoomName, password: this.dataActual.videoType };
              temp.jitsi = { code: this.dataActual.jitsiRoomName };
              temp.video = { url: this.dataActual.videoUrl };
              temp.extendedProps.weblink.zoom = temp.zoom;
              temp.extendedProps.weblink.skype = temp.skype;
              temp.extendedProps.weblink.jitsi = temp.jitsi;
              temp.extendedProps.weblink.video = temp.video;
              temp.videoType = this.dataObject.videoType;
              temp.jitsiRoomName = this.dataObject.jitsiRoomName;
              temp.whiteBoard = this.dataActual.whiteBoard;
              temp.videoUrl = this.dataActual.videoUrl;
              localStorage.setItem('classinfo', JSON.stringify(temp));
            }
          } else {
            this._snackBar.open('Failed to update zoom information !', '', {
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

  generateNewWhiteboard() {
    const dialogProjectRef = this.dialog.open(DialogGenerateWhiteboard, {
      disableClose: true,
      panelClass: 'generate-new-whiteboard',
      width: '550px',
      data: {}
    });

    dialogProjectRef.afterClosed().subscribe(result => {
      if(result === 'yes') {
        this.saveWhiteboard();
      }
    });
  }

  saveWhiteboard() {
    var response: any, dataTemp = {
      id: this.classDetails.id,
      dashboard: {
        url: this.dataObject.whiteBoard + Math.floor(Math.random() * 100) + 1,
        publish: true
      }
    };

    this.http.post(this.urlListService.urls.modifyDailyClass, dataTemp)
    .subscribe(
      resData => {
        response = resData;
        if(response.code === '200-UPP-001') {
          this._snackBar.open('New whiteboard is generated successfully !', 'X', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'success-message'
          });
          this.dataActual.zoom = this.removeSpace(this.dataObject.zoom);
          this.dataActual.zoomPassword = this.dataObject.zoomPassword;
          this.dataActual.whiteBoard = this.dataObject.whiteBoard;
          var temp = JSON.parse(localStorage.getItem('classinfo'));
          temp.zoom = { 'number': this.removeSpace(this.dataActual.zoom), 'password': this.dataActual.zoomPassword };
          temp.whiteBoard = this.dataActual.whiteBoard;
          localStorage.setItem('classinfo', JSON.stringify(temp));
        } else {
          this._snackBar.open('Failed to generate new whiteboard !', '', {
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

  onEditStream() {
    this.dataObject.zoom = this.removeSpace(this.dataActual.zoom);
    this.dataObject.zoomPassword = this.dataActual.zoomPassword;
    this.dataObject.whiteBoard = this.dataActual.whiteBoard;
  }
  // onDownload(item: { id: string; filename: string; }) {
  //   var params = 'periodid=' + this.classDetails.id + '&documentid=' + item.id;
  //   let response: any;
  //   this.http.get(this.urlListService.urls.download + params, {responseType: 'blob'})
  //   .subscribe(
  //     resData => {
  //       response = resData;
  //       let blob = new Blob([response], {
  //         type: response.type
  //       })
  //       let url = window.URL.createObjectURL(blob);
  //       let a = document.createElement('a');
  //       a.href = url;
  //       a.download = item.filename;
  //       a.click();
  //     },
  //     errorMessage => { 
  //       this._snackBar.open('This document requested for download cannot be found', '', {
  //         duration: 5000,
  //         horizontalPosition: 'center',
  //         verticalPosition: 'top',
  //         panelClass: 'error-message'
  //       });
  //     }
  //   );
  // }

  onDownload(item) {
    window.open(item.path, "_blank");
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    if(this.fileToUpload.size > 314573700) {
      this._snackBar.open('File size shouldn\'t exceeds 300MB. Please select a proper file !', '', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: 'error-message'
      });
      this.fileToUpload = null;
      this.dataObject.image = '';
    }
  }

  isUrlValid(userInput: string) {
    var res = userInput.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if(res == null)
        return false;
    else
        return true;
  }

  onSaveNote(form: NgForm) {
    var linkFlag = true;
    if(this.dataObject.link !== '') {
      linkFlag = this.isUrlValid(this.dataObject.link);
      if(!linkFlag) {
        this._snackBar.open('Link/Url field is invalid', '', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'error-message'
        });
        return;
      }
    }
    if (form.valid && linkFlag) {
      var params = '', response: any, fileNameTemp = '';
      const formData: FormData = new FormData();
      if(this.fileToUpload === null) {
        formData.append('file', '');
      }
      if(this.fileToUpload !== null) {
        fileNameTemp = this.fileToUpload.name;
        formData.append('file', this.fileToUpload, this.fileToUpload.name);
      }
      params = this.classDetails.extendedProps.grade + ':' + this.dataObject.documentType +':' + this.classDetails.id + ':' + this.dataObject.checked;
      formData.append('uploadparam', params);
      if(this.dataObject.link !== '') {
        formData.append('title', this.dataObject.noteTitle + 'trueleaplinkurl' + this.dataObject.link);
      } else {
        formData.append('title', this.dataObject.noteTitle);
      }
      formData.append('note', this.dataObject.note);
      if(this.dataObject.documentType === 'A') {
        var tempDate = this.dataObject.date.split("-");
        formData.append('validupto', tempDate[1] + "/" +tempDate[2] + "/" + tempDate[0]);
      }
      this.fileProgressBar = true;
      this.http.post(this.urlListService.urls.noteUpload, formData)
      .subscribe(
        resData => {
          response = resData;
          if(response.code === '200-UPP-001') {
            this._snackBar.open('Note has been added successfully !', 'X', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: 'success-message'
            });
            this.dataActual.noteList.push({title: this.dataObject.noteTitle, note: this.dataObject.note, filename: fileNameTemp});
            this.fileToUpload = null;
            //form.resetForm();
            this.dataObject.noteTitle = '';
            this.dataObject.note = '';
            this.dataObject.documentType = 'N';
            this.dataObject.checked = 'Public';
          } else {
            this._snackBar.open('Failed to add note !', '', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: 'error-message'
            });
          }
          this.fileProgressBar = false;
        },
        errorMessage => {
          this._snackBar.open(errorMessage.message, '', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'error-message'
          });
          console.log(errorMessage);
          this.fileProgressBar = false;
        }
      );
    }
    // const isExist = this.dataActual.noteList.filter(x => x.index === this.dataObject.index);
    // if(isExist.length === 0) {
    //   this.dataActual.noteList.push(tempNote);
    // }
    // if(isExist.length > 0) {
    //   this.dataActual.noteList[this.dataObject.index] = tempNote;
    // }  
    // this.dataObject.index = this.dataObject.index + 1;
    //form.resetForm();
    //this.fileProgressBar = false;
  }

  onEditNote(item) {
    this.dataObject.index = item.index;
    this.dataObject.noteTitle = item.title;
    this.dataObject.note = item.note;
    //this.dataObject.image = item.image;
  }

  onDeleteNote(item) {
    let response: any, types = '';
    if(item.docType === 'document') {
      types = 'N';
    }
    if(item.docType === 'assignment') {
      types = 'N';
    }
    const data = {
      id: this.classDetails.id,
      documentid: item.id,
      type: types
    };
    this.http.post(this.urlListService.urls.deleteDocument, item)
      .subscribe(
        resData => {
          response = resData;
          console.log('response', response);
          // if(response.code === '200-FUP-001') {
            this._snackBar.open('Document is deleted successfully !', 'X', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: 'success-message'
            });
          //   this.dataActual.noteList.push({title: this.dataObject.noteTitle, note: this.dataObject.note, filename: fileNameTemp});
          //   this.fileToUpload = null;
          //   //form.resetForm();
          //   this.dataObject.noteTitle = '';
          //   this.dataObject.note = '';
          //   this.dataObject.documentType = 'N';
          //   this.dataObject.checked = 'Public';
          // } else {
          //   this._snackBar.open('Failed to add note !', '', {
          //     duration: 5000,
          //     horizontalPosition: 'center',
          //     verticalPosition: 'top',
          //     panelClass: 'error-message'
          //   });
          // }
          //this.fileProgressBar = false;
        },
        errorMessage => {
          this._snackBar.open(errorMessage.message, '', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'error-message'
          });
          console.log(errorMessage);
          this.fileProgressBar = false;
        }
      );
  }

  getClassInfo(response) {
    if(response.document !== undefined && response.documents.length > 0) {
      for(var k=0; k<response.documents.length; k++) {
        response.documents[k].date = response.startdate.split('T')[0];
        response.documents[k].docType = 'Document';
        var titleUrl = response.documents[k].title.split("trueleaplinkurl");
        response.documents[k].title = titleUrl[0];
        response.documents[k].link = titleUrl[1];
        this.dataActual.noteList.push(response.documents[k]);
      }
    }
    if(response.assignments !== undefined && response.assignments.length > 0) {
      for(var k=0; k<response.assignments.length; k++) {
        response.assignments[k].date = response.startdate.split('T')[0];
        response.assignments[k].docType = 'Assignment';
        var titleUrl = response.assignments[k].title.split("trueleaplinkurl");
        response.assignments[k].title = titleUrl[0];
        response.assignments[k].link = titleUrl[1];
        this.dataActual.noteList.push(response.assignments[k]);
      }
    }
    //console.log('AA', j, response.classnote);
    // if(response.classnote !== undefined) {
    //   var temp = {
    //     date: response.classnote.date.split('T')[0],
    //     docType: 'Classnote',
    //     title: "Class note",
    //     note: response.classnote.notes
    //   };
    //   this.dataActual.noteList.push(temp);
    // }          
    this.dataActual.noteList = this.dataActual.noteList.sort((a, b) => (a.date < b.date) ? 1 : -1);
  }

  submitAssignment(item) {
    const dialogProjectRef = this.dialog.open(DialogSubmitAssignmentSt, {
      disableClose: true,
      panelClass: 'submit-assignment-weight',
      width: '550px',
      data: item.id
    });

    dialogProjectRef.afterClosed().subscribe(result => {
      if(result !== undefined) {
        console.log('The dialog was closed', result);
      }
    });
  }

}
@Component({
  selector: 'dialog-submit-assignment-st',
  templateUrl: './dashboard-details-student.component.html',
  styleUrls: ['./dashboard-details.component.css', '../../common/header/common.css']
})

export class DialogSubmitAssignmentSt {
  assignmentData = {
    noteTitle: '',
    note: '',
    link: '',
    image: ''
  };
  basicInfo = {
    userid: 0,
    grade: '',
    submittedby: '',
    section: '',
    assignmentperiod: ''
  };
  documentnumber: any;
  fileStProgressBar = false;
  fileToUpload: File = null;
  constructor(
    public dialogRef: MatDialogRef<DialogSubmitAssignmentSt>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private _snackBar: MatSnackBar, private http: HttpClient, private urlListService: UrlListService) {
    }
  ngOnInit() {
    //console.log('this.data', this.data);
    const classinfo = JSON.parse(localStorage.getItem('classinfo'));
    const userinfo = JSON.parse(localStorage.getItem('userData'));
    this.basicInfo.userid = userinfo.id;
    this.basicInfo.grade = classinfo.extendedProps.grade;
    this.basicInfo.submittedby = userinfo.username.fullname;
    this.basicInfo.section = classinfo.extendedProps.section;
    this.documentnumber = this.data;
    this.basicInfo.assignmentperiod = classinfo.id;
  }
  
  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    if(this.fileToUpload.size > 314573700) {
      this._snackBar.open('File size shouldn\'t exceeds 300MB. Please select a proper file !', '', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: 'error-message'
      });
      this.fileToUpload = null;
      this.assignmentData.image = '';
    }
  }
  
  onCancelClick() {
    this.dialogRef.close();
  }

  isUrlValid(userInput: string) {
    var res = userInput.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if(res == null)
        return false;
    else
        return true;
  }
  
  saveNote(form: NgForm) {
    if (!form.valid) {
      return;
    }
    var linkFlag = true;
    if(this.assignmentData.link !== '') {
      linkFlag = this.isUrlValid(this.assignmentData.link);
      if(!linkFlag) {
        this._snackBar.open('Link/Url field is invalid', '', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'error-message'
        });
        return;
      }
    }
    if (form.valid && linkFlag) {
      var params = '', response: any, fileNameTemp = '';
      const formData: FormData = new FormData();
      if(this.fileToUpload === null) {
        formData.append('file', '');
      }
      if(this.fileToUpload !== null) {
        fileNameTemp = this.fileToUpload.name;
        formData.append('file', this.fileToUpload, this.fileToUpload.name);
      
        params = this.basicInfo.grade + ':' + 'AS' +':' + this.basicInfo.userid;
        formData.append('uploadparam', params);
        if(this.assignmentData.link !== '') {
          formData.append('title', this.assignmentData.noteTitle + 'trueleaplinkurl' + this.assignmentData.link);
        } else {
          formData.append('title', this.assignmentData.noteTitle);
        }
        //formData.append('validupto', '2/2/2020');
        formData.append('note', this.assignmentData.note);
        formData.append('submittedby', this.basicInfo.submittedby);
        formData.append('section', this.basicInfo.section);
        formData.append('documentnumber', this.documentnumber);
        formData.append('assignmentperiod', this.basicInfo.assignmentperiod);
        this.fileStProgressBar = true;
        this.http.post(this.urlListService.urls.noteUpload, formData)
        .subscribe(
          resData => {
            response = resData;
            if(response.code === '200-UPP-001') {
              this._snackBar.open('Assignment has been submitted successfully !', 'X', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: 'success-message'
              });
              this.dialogRef.close();
            } else {
              this._snackBar.open('Failed to submit assignment !', '', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: 'error-message'
              });
            }
            this.fileStProgressBar = false;
          },
          errorMessage => {
            this._snackBar.open(errorMessage.message, '', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: 'error-message'
            });
            console.log(errorMessage);
            this.fileStProgressBar = false;
          }
        );
      } else {
        this._snackBar.open('Please upload your assignment first and then Submit !', '', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'error-message'
        });
      }
    }
  }

}

@Component({
  selector: 'dialog-submit-assignment-st',
  templateUrl: './chat-history-dialog-component.component.html',
  styleUrls: ['./dashboard-details.component.css', '../../common/header/common.css']
})

export class ChatHistoryDialogComponent {
  chatHistoryList = [];
  loader = true;
  constructor(
    public dialogRef: MatDialogRef<ChatHistoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private _snackBar: MatSnackBar, private http: HttpClient, private urlListService: UrlListService) {
    }
  ngOnInit() {
    const classinfo = JSON.parse(localStorage.getItem('classinfo'));
    const userinfo = JSON.parse(localStorage.getItem('userData'));
    this.getHistory(classinfo, userinfo);
  }

  getHistory(classinfo: { extendedProps: { grade: any; section: any; subject: any; semester: any; }; id: any; }, userinfo: { username: { fullname: any; }; }) {
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
        this.loader = false;
        response = resData;
        if(response.success && response.data.length > 0) {
          this.chatHistoryList = response.data.reverse();
        }
      },
      errorMessage => {
        this.loader = false;
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

@Component({
  selector: 'dialog-generate-whiteboard',
  templateUrl: './generate-new-whiteboard.component.html',
  styleUrls: ['./dashboard-details.component.css', '../../common/header/common.css']
})

export class DialogGenerateWhiteboard {
  constructor(
    public dialogRef: MatDialogRef<DialogGenerateWhiteboard>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    }
  ngOnInit() {}

  onCancelClick(item: any) {
    this.dialogRef.close(item);
  }

}