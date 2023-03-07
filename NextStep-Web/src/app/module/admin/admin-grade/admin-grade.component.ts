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
  selector: 'app-admin-grade',
  templateUrl: './admin-grade.component.html',
  styleUrls: ['./admin-grade.component.css', '../../../common/header/common.css']
})
export class AdminGradeComponent implements OnInit {
  subjectList = [];
  
  displayedColumns: string[] = [ 'grade', 'action' ];
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
    this.http.get(this.urlListService.urls.gradeAll)
    .subscribe(event => { 
      response = event;
      if(response && response.length > 0) {
        this.subjectList = response;
        this.dataSource = new MatTableDataSource<PeriodicElement>(this.subjectList);
        this.dataSource.paginator = this.paginator;
      }     
    })
  }

  onAddEditRecord(type: string, item: { _id: number; grade: string; }) {
    let tempData = { id: 0, grade: '' };
    if(type === 'edit') {
      tempData.id = item._id;
      tempData.grade = item.grade;
    }
    const dialogRef = this.dialog.open(DialogAddEditGradeAdminRecordDialog, {
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

  onDeleteRecord(item: { _id: any; grade: any; }) {
    let tempData = { id: item._id, grade: item.grade };
    const dialogRef = this.dialog.open(DialogDeleteAdminGradeRecordDialog, {
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
  '<div class="header-text">Add New Grade</div><mat-icon aria-hidden="false" class="close-cross" (click)="onCancelClick()" aria-label="Example close icon">close</mat-icon></div><div class="content">' +
  '   <form #authForm="ngForm" (ngSubmit)="onSave(authForm)">' +
  '   <div fxLayout="row" fxLayoutAlign="start none">' +
  '     <div class="request-form"><div class="request-form-content">' +
  '         <mat-form-field class="request-field" appearance="outline"><mat-label>Grade Name</mat-label><input matInput [(ngModel)]="dataObject.grade" id="subject" name="subject" placeholder="Enter Grade Name" autocomplete="off" maxlength="20" required></mat-form-field>' +
  '       </div></div></div>' +
  '   <div fxLayout="row" fxLayoutAlign="center none"><button mat-raised-button color="primary" type="submit">{{textButton}} Grade</button></div>' +
  '   </form></div></div></div>',
})

export class DialogAddEditGradeAdminRecordDialog {
  dataObject = {
    id: 0,
    grade: ''
  };
  textButton = 'Add';
  constructor(
    public dialogRef: MatDialogRef<DialogAddEditGradeAdminRecordDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private _snackBar: MatSnackBar, private http: HttpClient, private urlListService: UrlListService) {
    }
  ngOnInit() {
    if(this.data) {
      console.log('this.data', this.data.tempData);
      this.dataObject.id = this.data.tempData.id;
      this.dataObject.grade = this.data.tempData.grade;
      if(this.dataObject.id !== 0) { this.textButton = 'Update'; }
    }
  }  
  
  onCancelClick() {
    this.dialogRef.close();
  }

  onSave(form: NgForm) {
    if (!form.valid) {
      return;
    }
    if(this.dataObject.id === 0) {
      let response: any;
      this.http.post(this.urlListService.urls.gradeCreate, { grade: this.dataObject.grade })
      .subscribe(event => { 
        response = event;
        if(response.code === '200-MET-001') {
          this._snackBar.open('New grade is added successfully !', 'X', {
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
      this.http.post(this.urlListService.urls.gradeUpdate, { key: this.dataObject.id, grade: this.dataObject.grade })
      .subscribe(event => { 
        response = event;
        if(response.code === '200-MET-001') {
          this._snackBar.open('Grade is updated successfully !', 'X', {
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
    }
  }

}

@Component({
  selector: 'dialog-delete-admin-record-dialog',
  template: '<div class="main-content"><div class="well-create"><div class="header">' +
  '<div class="header-text">Delete Confirmation</div><mat-icon aria-hidden="false" class="close-cross" (click)="onCancelClick()" aria-label="Example close icon">close</mat-icon></div><div class="content">' +
  '   <form #authForm="ngForm">' +
  '   <div fxLayout="row" fxLayoutAlign="start none">' +
  '     <div class="request-form">Are you sure want to delete {{dataObject.grade}} ?</div></div>' +
  '   <div fxLayout="row" fxLayoutAlign="center none"><button mat-raised-button type="button" (click)="onClick()" style="margin-right: 10px;">Yes</button><button mat-raised-button type="button" (click)="onCancelClick()">No</button></div>' +
  '   </form></div></div></div>',
})

export class DialogDeleteAdminGradeRecordDialog {
  dataObject = {
    id: 0,
    grade: ''
  };
  
  constructor(
    public dialogRef: MatDialogRef<DialogDeleteAdminGradeRecordDialog>,
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
    this.http.post(this.urlListService.urls.gradeDelete, { key: this.dataObject.id })
    .subscribe(event => { 
      let response: any;
      response = event;
      if(response.code === '200-MET-001') {
        this._snackBar.open('Grade is deleted successfully !', 'X', {
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
  }

}
