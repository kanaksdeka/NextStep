import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminClassAddComponent } from '../admin-class/admin-class-add/admin-class-add.component';
import { HttpClient } from '@angular/common/http';
import { UrlListService } from '../../../shared/url-list.service';
import moment from 'moment';

export interface PeriodicElement {
}
export interface DialogData {
  tempData: any;
  id: string,
  subject: string
}
@Component({
  selector: 'app-admin-class',
  templateUrl: './admin-class.component.html',
  styleUrls: ['./admin-class.component.css', '../../../common/header/common.css']
})
export class AdminClassComponent implements OnInit {

  subjectList = [];
  editSubjectList = [];
  paramUser = 0;
  displayedColumns: string[] = [ 'active', 'mainteacher', 'class_name', 'section_name', 'subject_name', 'days', 'startdate', 'time', 'action' ];
  dataSource = new MatTableDataSource<PeriodicElement>(this.subjectList);
  showActiveClass = true;
  @ViewChild(MatPaginator, { read: '', static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { read: '', static: true }) sort: MatSort;

  constructor(public router: Router, public dialog: MatDialog, private http: HttpClient, private urlListService: UrlListService, private _snackBar: MatSnackBar, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(paramsId => {
      if(paramsId.user !== undefined) { 
        this.paramUser = paramsId.user;
      }
    });
    this.getAllRecords();
  }

  toggleClass(event) {
    if(event.checked) {
      var temp = [];
      for(var i=0; i<this.subjectList.length; i++) {
        if(this.subjectList[i].active) {
          temp.push(this.subjectList[i]);
        }
      }
      this.dataSource = new MatTableDataSource<PeriodicElement>(temp);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } else {
      var temp = [];
      for(var i=0; i<this.subjectList.length; i++) {
        if(!this.subjectList[i].active) {
          temp.push(this.subjectList[i]);
        }
      }
      this.dataSource = new MatTableDataSource<PeriodicElement>(temp);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  getAllRecords() {
    let response: any;
    this.http.get(this.urlListService.urls.classAll)
    .subscribe(event => { 
      response = event;
      if(response && response.length > 0) {
        this.editSubjectList = response;
        this.subjectList = response.reverse();
        var temp = [];
        for(var i=0; i<this.subjectList.length; i++) {
          if(this.subjectList[i].active) {
            temp.push(this.subjectList[i]);
          }
        }
        this.dataSource = new MatTableDataSource<PeriodicElement>(temp);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }     
    })
  }

  getObject(id: any) {
    for(var i=0; i<this.editSubjectList.length; i++) {
      if(this.editSubjectList[i]._id === id) {
        return this.editSubjectList[i];
      }
    }
  }

  // getTimeAMPM(utcDate, getUTCTime, endDate, endTime) {
  //   var tempValue = utcDate.split('T')[0] + ' ' + getUTCTime;
  //   var stillUtc = moment.utc(tempValue).toDate();
  //   var tempEnd = endDate.split('T')[0] + ' ' + endTime;
  //   var stillEnd = moment.utc(tempEnd).toDate();
  //   var local = moment(stillUtc).local().format('hh:mm') + ' - ' + moment(stillEnd).local().format('hh:mm') + ' ' + moment(stillUtc).local().format('A');    
  //   return local;
  // }

  getTimeAMPM(utcDate, getUTCTime) {
    var tempValue = utcDate.split('T')[0] + ' ' + getUTCTime;
    var stillUtc = moment.utc(tempValue).toDate();
    var local = moment(stillUtc).local().format('hh:mm') + ' ' + moment(stillUtc).local().format('A');    
    return local;
  }

  onAddEditRecord(type: string, data: any): void {
    if(type === 'edit') {
      data = this.getObject(data._id);
    }
    const dialogProjectRef = this.dialog.open(AdminClassAddComponent, {
      disableClose: true,
      panelClass: 'create-new-class',
      width: '550px',
      data: { 'cData': data }
    });

    dialogProjectRef.afterClosed().subscribe(result => {
      if(result === 'yes') {
        this.mapRecord();
        this.getAllRecords();
      }
    });
  }

  onDeleteRecord(item: { _id: any; grade: any; }) {
    let tempData = { id: item._id, grade: item.grade };
    const dialogRef = this.dialog.open(DialogDeleteClassAdminGradeRecordDialog, {
      width: '400px',
      panelClass: 'create-new-class',
      data: { tempData }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === 'yes') {
        this.mapRecord();
        this.getAllRecords();
      }
    });
  }

  onCancelClick() {
    if(this.paramUser === 0) {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/u/' + this.paramUser + '/admin-dashboard']);
    }
  }

  goToRoute(item: string) {
    if(this.paramUser === 0) {
      if(item === 'subject') {
        this.router.navigate(['/admin-subject']);
      }
      if(item === 'grade') {
        this.router.navigate(['/admin-grade']);
      }
      if(item === 'section') {
        this.router.navigate(['/admin-section']);
      }
      if(item === 'semester') {
        this.router.navigate(['/admin-semester']);
      }
    } else {
      if(item === 'subject') {
        this.router.navigate(['/u/' + this.paramUser + '/admin-subject']);
      }
      if(item === 'grade') {
        this.router.navigate(['/u/' + this.paramUser + '/admin-grade']);
      }
      if(item === 'section') {
        this.router.navigate(['/u/' + this.paramUser + '/admin-section']);
      }
      if(item === 'semester') {
        this.router.navigate(['/u/' + this.paramUser + '/admin-semester']);
      }
    }
  }

  mapRecord() {
    this.http.post(this.urlListService.urls.refreshCache, { refresh: 'all' })
    .subscribe(event => { 
      //if(response.code === '200-MET-001') {       
    })
  }

}


@Component({
  selector: 'dialog-delete-admin-record-dialog',
  template: '<div class="main-content"><div class="well-create"><div class="header">' +
  '<div class="header-text">Disable Confirmation</div><mat-icon aria-hidden="false" class="close-cross" (click)="onCancelClick()" aria-label="Example close icon">close</mat-icon></div><div class="content">' +
  '   <form #authForm="ngForm">' +
  '   <div fxLayout="row" fxLayoutAlign="start none">' +
  '     <div class="request-form">Are you sure want to disable this class ?</div></div>' +
  '   <div fxLayout="row" fxLayoutAlign="center none"><button mat-raised-button type="button" (click)="onClick()" style="margin-right: 10px;">Yes</button><button mat-raised-button type="button" (click)="onCancelClick()">No</button></div>' +
  '   </form></div></div></div>',
})

export class DialogDeleteClassAdminGradeRecordDialog {
  dataObject = {
    id: 0,
    grade: ''
  };
  
  constructor(
    public dialogRef: MatDialogRef<DialogDeleteClassAdminGradeRecordDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private _snackBar: MatSnackBar, private http: HttpClient, private urlListService: UrlListService) {
    }
  ngOnInit() {
    if(this.data) {
      this.dataObject.id = this.data.tempData.id;
      this.dataObject.grade = this.data.tempData.grade;
    }
  }  
  
  onCancelClick() {
    this.dialogRef.close();
  }

  onClick() {
    this.http.post(this.urlListService.urls.updateClass, { id: this.dataObject.id, delete: 'true' })
    .subscribe(event => { 
      let response: any;
      response = event;
      if(response.code === '200-MET-001') {
        this._snackBar.open('Grade is disabled successfully !', 'X', {
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

}