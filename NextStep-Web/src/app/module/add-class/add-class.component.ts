import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType} from '@angular/common/http';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { UrlListService } from '../../shared/url-list.service';

export interface DialogData {
  cData: {
    id: 0,
    class: '',
    section: '',
    semester: '',
    subject: '',
    days: [],
    dateFrom: '',
    dateTo: '',
    from: '',
    to: ''
  };
}

@Component({
  selector: 'app-add-class',
  templateUrl: './add-class.component.html',
  styleUrls: ['./add-class.component.css', '../../common/header/common.css']
})
export class AddClassComponent implements OnInit {

  classData = {
    cData: {
      id: 0,
      class: '',
      section: '',
      semester: '',
      subject: '',
      days: [],
      dateFrom: '',
      dateTo: '',
      from: '',
      to: ''
    }
  };
  classID = 0;
  class = '';
  textButton = 'Add';
  profileData = {
    id: ''
  };
  todayDate = new Date().toISOString().slice(0,10);
  constructor(public dialogRef: MatDialogRef<AddClassComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData, private http: HttpClient, private _snackBar: MatSnackBar, private urlListService: UrlListService) {}
  ngOnInit() {
    if(this.data.cData !== undefined) {
      this.classID = this.data.cData.id;
      //this.data.cData.dateFrom = this.formatDate(this.data.cData.dateFrom);
      //this.data.cData.dateTo = this.formatDate(this.data.cData.dateTo);
      this.classData.cData = this.data.cData;
      //this.class = this.data.cData.class;
      this.textButton = 'Update';
    } 
    const userData = JSON.parse(localStorage.getItem('userData'));
    //console.log('user id = ', userData.id);
    this.profileData.id = userData.id;
  }
  
  onCancelClick() {
    this.dialogRef.close();
  }

  onSave(form: NgForm) {
    if (!form.valid) {
      return;
    }
    if(this.classID === 0) {
      //console.log("AAA IF");
      this.saveClassInfo(this.classData);
    } else {
      console.log("AAA ELSE");
    }
    //this.dialogRef.close(this.classData);
    // this._snackBar.open('New well is saved successfully.', '', {
    //   duration: 2000,
    //   verticalPosition: 'top',
    //   panelClass: ['custom-snackbar']
    // });
    //this.router.navigate(['/well']);
  }

  saveClassInfo(data) {
    const tempData = {
      class: data.class,
      subject: data.subject,
      section: data.section,
      days: data.days,
      starttime: data.from,
      endtime: data.to,
      startDate: data.dateFrom,
      endDate: data.dateTo,
      mainteacher: '',
      mainteacherid: this.profileData.id
    };
    
    this.http.post(this.urlListService.urls.addClass, tempData)
    .subscribe(event => {  
      console.log('response', event);
      if(event) {
        this._snackBar.open('Class is saved successfully !', 'X', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'success-message'
        });
        this.dialogRef.close(data);
      }
    })
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

}
