import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import {HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType} from '@angular/common/http';
import { UrlListService } from '../../../shared/url-list.service';

export interface PeriodicElement {
}
export interface DialogData {
  tempData: any;
  id: string,
  subject: string
}
@Component({
  selector: 'app-admin-semester',
  templateUrl: './admin-semester.component.html',
  styleUrls: ['./admin-semester.component.css', '../../../common/header/common.css']
})
export class AdminSemesterComponent implements OnInit {
  subjectList = [];
  displayedColumns: string[] = [ 'semester', 'startdate', 'enddate', 'action' ];
  dataSource = new MatTableDataSource<PeriodicElement>(this.subjectList);
  paramUser = 0;
  //@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatPaginator, { read: '', static: true }) paginator: MatPaginator;

  constructor(public router: Router, public dialog: MatDialog, private http: HttpClient, private urlListService: UrlListService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(paramsId => {
      if(paramsId.user !== undefined) { 
        this.paramUser = paramsId.user;
      }
    });
    this.getAllRecords();
  }

  onCancelClick() {
    if(this.paramUser === 0) {
      this.router.navigate(['/admin-class']);
    } else {
      this.router.navigate(['/u/' + this.paramUser + '/admin-class']);
    }
  }

  getAllRecords() {
    let response: any;
    this.http.get(this.urlListService.urls.semesterFetch)
    .subscribe(event => { 
      response = event;
      if(response && response.length > 0) {
        for(var i=0; i<response.length; i++) {
          response[i].startdate = response[i].startdate.split('T')[0];
          response[i].enddate = response[i].enddate.split('T')[0];
        }
        this.subjectList = response;
        this.dataSource = new MatTableDataSource<PeriodicElement>(this.subjectList);
        this.dataSource.paginator = this.paginator;
      }     
    })
  }

  onClickAddEditRecord() {
    var tempData = { _id: 0, subject: '' };
    this.onAddEditRecord('add', tempData);
  }

  onAddEditRecord(type: string, item: { _id: any; subject?: string; semester?: any; startdate?: any; enddate?: any; isactive?: any; }) {
    let tempData = { id: 0, semester: '', startdate: '', enddate: '', isactive: false };
    if(type === 'edit') {
      tempData.id = item._id;
      tempData.semester = item.semester;
      tempData.startdate = item.startdate;
      tempData.enddate = item.enddate;
      tempData.isactive = item.isactive;
    }
    const dialogRef = this.dialog.open(DialogAddEditAdminSemesterDialog, {
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

  onDeleteRecord(item: { _id: any; semester: any; }) {
    let tempData = { id: item._id, semester: item.semester };
    const dialogRef = this.dialog.open(DialogDeleteAdminSemesterDialog, {
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

  mapRecord() {
    this.http.post(this.urlListService.urls.refreshCache, { refresh: 'all' })
    .subscribe(event => { 
      //if(response.code === '200-MET-001') {       
    })
  }
}

@Component({
  selector: 'dialog-add-edit-admin-record-dialog',
  template: '<div class="main-content"><div class="well-create"><div class="header">' +
  '<div class="header-text">Add New Semester</div><mat-icon aria-hidden="false" class="close-cross" (click)="onCancelClick()" aria-label="Example close icon">close</mat-icon></div><div class="content">' +
  '   <form #authForm="ngForm" (ngSubmit)="onSave(authForm)">' +
  '   <div fxLayout="row" fxLayoutAlign="start none">' +
  '     <div class="request-form"><div class="request-form-content">' +
  '         <mat-form-field class="request-field" appearance="outline"><mat-label>Semester Name</mat-label><input matInput [(ngModel)]="dataObject.semester" id="subject" name="subject" placeholder="Enter Semester Name" autocomplete="off" maxlength="20" required></mat-form-field>' +
  '         <mat-form-field class="request-field-date" appearance="outline">' +
  '            <mat-label>Start Date</mat-label>' +
  '            <input matInput type="date" [(ngModel)]="dataObject.startDate" id="startDate" name="startDate" placeholder="Enter date" autocomplete="off" required>' +
  '         </mat-form-field>' +
  '         <mat-form-field class="request-field-date" appearance="outline">' +
  '            <mat-label>End Date</mat-label>' +
  '            <input matInput type="date" [(ngModel)]="dataObject.endDate" id="endDate" name="endDate" placeholder="Enter date" autocomplete="off" required>' +
  '         </mat-form-field>' +
  '       </div></div></div>' +
  '   <div fxLayout="row" fxLayoutAlign="center none"><button mat-raised-button color="primary" type="submit">{{textButton}} Semester</button></div>' +
  '   </form></div></div></div>',
})

export class DialogAddEditAdminSemesterDialog {
  dataObject = {
    id: 0,
    semester: '',
    startDate: '', 
    endDate: '',
    isactive: false
  };
  textButton = 'Add';
  constructor(
    public dialogRef: MatDialogRef<DialogAddEditAdminSemesterDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private _snackBar: MatSnackBar, private http: HttpClient, private urlListService: UrlListService) {
    }
  ngOnInit() {
    if(this.data) {
      this.dataObject.id = this.data.tempData.id;
      this.dataObject.semester = this.data.tempData.semester;
      this.dataObject.startDate = this.data.tempData.startdate;
      this.dataObject.endDate = this.data.tempData.enddate;
      this.dataObject.isactive = this.data.tempData.isactive;
      if(this.dataObject.id !== 0) { this.textButton = 'Update'; }
    } 
  }  
  
  onCancelClick() {
    this.dialogRef.close();
  }

  onSave(form: NgForm) {
    let message = '';
    if (!form.valid) {
      return;
    }
    var startDate = this.dataObject.startDate.split('-');
    var endDate = this.dataObject.endDate.split('-');
    var start = startDate[0] + '/' + startDate[1] + '/' + startDate[2];
    var end = endDate[0] + '/' + endDate[1] + '/' + endDate[2];
    if(this.dataObject.id === 0) {
      let response: any;
      this.http.post(this.urlListService.urls.semesterCreate, { semester: this.dataObject.semester, startDate: start, endDate: end })
      .subscribe(event => { 
        response = event;
        if(response.code === '200-MET-001') {
          this._snackBar.open('New semester is added successfully !', 'X', {
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
          this.dialogRef.close();
        }     
      })
    } else {
      let response: any;
      this.http.post(this.urlListService.urls.semesterUpdate, {  semesterid: this.dataObject.id, semester: this.dataObject.semester, startDate: start, endDate: end, isactive: this.dataObject.isactive })
      .subscribe(event => { 
        response = event;
        if(response.code === '200-MET-001') {
          this._snackBar.open('Section is updated successfully !', 'X', {
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

}

@Component({
  selector: 'dialog-delete-admin-record-dialog',
  template: '<div class="main-content"><div class="well-create"><div class="header">' +
  '<div class="header-text">Delete Confirmation</div><mat-icon aria-hidden="false" class="close-cross" (click)="onCancelClick()" aria-label="Example close icon">close</mat-icon></div><div class="content">' +
  '   <form #authForm="ngForm">' +
  '   <div fxLayout="row" fxLayoutAlign="start none">' +
  '     <div class="request-form">Are you sure want to delete semester {{dataObject.semester}} ?</div></div>' +
  '   <div fxLayout="row" fxLayoutAlign="center none"><button mat-raised-button type="button" (click)="onClick()" style="margin-right: 10px;">Yes</button><button mat-raised-button type="button" (click)="onCancelClick()">No</button></div>' +
  '   </form></div></div></div>',
})

export class DialogDeleteAdminSemesterDialog {
  dataObject = {
    id: 0,
    semester: ''
  };
  
  constructor(
    public dialogRef: MatDialogRef<DialogDeleteAdminSemesterDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private _snackBar: MatSnackBar, private http: HttpClient, private urlListService: UrlListService) {
    }
  ngOnInit() {
    if(this.data) {
      this.dataObject.id = this.data.tempData.id;
      this.dataObject.semester = this.data.tempData.semester;
    }
  }  
  
  onCancelClick() {
    this.dialogRef.close();
  }

  onClick() {
    let response: any;
    this.http.post(this.urlListService.urls.semesterDelete, {  semesterid: this.dataObject.id })
    .subscribe(event => { 
      response = event;
      if(response.code === '200-MET-001') {
        this._snackBar.open('Semester is deleted successfully !', 'X', {
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