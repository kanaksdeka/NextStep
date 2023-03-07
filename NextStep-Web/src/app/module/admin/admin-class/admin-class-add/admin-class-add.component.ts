import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType} from '@angular/common/http';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { UrlListService } from '../../../../shared/url-list.service';
import moment from 'moment';

export interface DialogData {
  cData: {
    id: 0
  };
}

@Component({
  selector: 'app-admin-class-add',
  templateUrl: './admin-class-add.component.html',
  styleUrls: ['./admin-class-add.component.css', '../../../../common/header/common.css']
})
export class AdminClassAddComponent implements OnInit {

  classData = {
    teacherid: '',
    semester: '',
    class: '',
    section: '',
    subject: '',
    days: [],
    dateFrom: '',
    dateTo: '',
    from: '',
    to: '',
    cData: {}
  };
  classID = 0;
  textButton = 'Add';
  profileData = {
    id: ''
  };
  hideName = true;
  todayDate = new Date().toISOString().slice(0,10);
  teacherList = [];
  subjectList = [];
  sectionList = [];
  gradeList = [];
  semesterList = [];
  loader = false;
  disabledFlag = false;
  editStudent = false;
  constructor(public dialogRef: MatDialogRef<AdminClassAddComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData, private http: HttpClient, private _snackBar: MatSnackBar, private urlListService: UrlListService) {}
  ngOnInit() {
    this.getAllRecords();
    if(this.data.cData !== undefined && (typeof this.data.cData === 'object')) {
      this.classID = this.data.cData.id;
      this.textButton = 'Update';     
      this.disabledFlag = true;
      this.prepareEditData(this.data.cData);
    }   
  }

  prepareEditData(data) {
    this.editStudent = data.editStudent;
    if(!data.editStudent) {
      this.classData = data;
      this.classData.teacherid = data.mainteacherindex;
      this.classData.dateFrom = data.startdate.split('T')[0];
      this.classData.dateTo = data.enddate.split('T')[0];
      this.classData.from = this.getTimeAMPM(data.startdate, data.starttime);
      this.classData.to = this.getTimeAMPM(data.enddate, data.endtime);
    }
  }

  getTimeAMPM(utcDate, getUTCTime) {
    var tempValue = utcDate.split('T')[0] + ' ' + getUTCTime;
    var stillUtc = moment.utc(tempValue).toDate();
    var local = moment(stillUtc).local().format('hh:mm'), final: any;
    var ampm = moment(stillUtc).local().format('A');
    final = local;
    if(ampm === 'PM') {
      final = parseInt(local.split(':')[0]) + 12;
      final = final + ':' +local.split(':')[1];
    }
    return final;
  }
  
  getAllRecords() {
    this.loader = true;
    let response: any, responsesection: any, responsegrade: any, responseteacher: any;
    this.http.get(this.urlListService.urls.teacherAll)
    .subscribe(event => { 
      responseteacher = event;
      if(responseteacher && responseteacher.length > 0) {
        for(var i=0; i<responseteacher.length; i++) {
          if(responseteacher[i].profile.fullname === '') {
            responseteacher[i].profile.fullname = responseteacher[i].email;
          }
        }
        this.teacherList = responseteacher;
        this.loader = false;
      } else {
        this._snackBar.open('Please create teachers first and then try addign new class !', '', {
          duration: 6000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'error-message'
        });
        this.loader = false;
      }     
    })
    this.http.get(this.urlListService.urls.semesterFetch)
    .subscribe(event => { 
      response = event;
      if(response && response.length > 0) {
        this.semesterList = response;
        this.loader = false;
      } else {
        this._snackBar.open('Please create semeters first and then try addign new class !', '', {
          duration: 6000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'error-message'
        });
        this.loader = false;
      }     
    })
    this.http.get(this.urlListService.urls.subjectAll)
    .subscribe(event => { 
      response = event;
      if(response && response.length > 0) {
        this.subjectList = response;
        this.loader = false;
      } else {
        this._snackBar.open('Please create subjects first and then try addign new class !', '', {
          duration: 6000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'error-message'
        });
        this.loader = false;
      }     
    })
    this.http.get(this.urlListService.urls.sectionAll)
    .subscribe(event => { 
      responsesection = event;
      if(responsesection && responsesection.length > 0) {
        this.sectionList = responsesection;
        this.loader = false;
      } else {
        this._snackBar.open('Please create sections first and then try addign new class !', '', {
          duration: 6000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'error-message'
        });
        this.loader = false;
      }     
    })
    this.http.get(this.urlListService.urls.gradeAll)
    .subscribe(event => { 
      responsegrade = event;
      if(responsegrade && responsegrade.length > 0) {
        this.gradeList = responsegrade;
        this.loader = false;
      } else {
        this._snackBar.open('Please create grades first and then try addign new class !', '', {
          duration: 6000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'error-message'
        });
        this.loader = false;
      }     
    })
  }

  onCancelClick() {
    this.dialogRef.close();
  }

  onSave(form: NgForm) {
    if (!form.valid) {
      return;
    }
    if(this.classID === 0) {
      this.saveClassInfo(this.classData);
    } else {
      this.editClassInfo(this.classData);
    }
  }

  editClassInfo(data) {
    const tempData = {
      id: data._id,
      class: data.class,
      subject: data.subject,
      section: data.section,
      days: data.days,
      starttime: this.getUTCTime(data.dateFrom, data.from),
      endtime: this.getUTCTime(data.dateTo, data.to),
      startDate: this.getDate(data.dateFrom, data.from),
      endDate: this.getDate(data.dateTo, data.to),
      mainteacher: this.getTeacherName(data.teacherid),
      mainteacherid: data.teacherid,
    };
    
    let response: any;
    this.http.post(this.urlListService.urls.updateClass, tempData)
    .subscribe(event => {  
      response = event;
      if(response.code === '200-MET-001') {
        this._snackBar.open('Class is updated successfully !', 'X', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'success-message'
        });
        this.dialogRef.close('yes');
      } else {
        this._snackBar.open(response.desc, '', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'error-message'
        });
      }
    })
  }

  getDate(inputDate, inputTime) {
    const timeZoneOne = moment.tz.guess(true);    
    const istMomentObj = moment.tz(inputDate + ' ' + inputTime, timeZoneOne);
    const utcMomentObj = moment.utc(istMomentObj);
    return utcMomentObj.format("YYYY-MM-DD");
  }

  getUTCTime(inputDate, inputTime) {
    const timeZoneOne = moment.tz.guess(true);    
    const istMomentObj = moment.tz(inputDate + ' ' + inputTime, timeZoneOne);
    //convert the IST to UTC and Save it
    const utcMomentObj = moment.utc(istMomentObj);
    return utcMomentObj.format("HH:mm");
  }

  saveClassInfo(data) {
    const tempData = {
      class: data.class,
      semester: data.semester,
      subject: data.subject,
      section: data.section,
      days: data.days,
      starttime: this.getUTCTime(data.dateFrom, data.from),
      endtime: this.getUTCTime(data.dateTo, data.to),
      startDate: this.getDate(data.dateFrom, data.from),
      endDate: this.getDate(data.dateTo, data.to),
      mainteacher: this.getTeacherName(data.teacherid),
      mainteacherid: data.teacherid,
    };
    let response: any;
    this.http.post(this.urlListService.urls.addClass, tempData)
    .subscribe(event => {  
      response = event;
      if(response.code === '200-CRP-001') {
        this._snackBar.open('Class is saved successfully !', 'X', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'success-message'
        });
        this.dialogRef.close('yes');
      } else {
        this._snackBar.open(response.desc, '', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'error-message'
        });
      }
    })
  }

  getTeacherName(id: any) {
    for(var i=0; i<this.teacherList.length; i++) {
      if(this.teacherList[i]._id === id) {
        return (this.teacherList[i].profile.fullname);
      }
    }
  }
}
