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
  selector: 'app-admin-subject',
  templateUrl: './admin-subject.component.html',
  styleUrls: ['./admin-subject.component.css', '../../../common/header/common.css']
})
export class AdminSubjectComponent implements OnInit {
  subjectList = [];
  displayedColumns: string[] = [ 'subject', 'action' ];
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
    this.http.get(this.urlListService.urls.subjectAll)
    .subscribe(event => { 
      response = event;
      if(response && response.length > 0) {
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

  onAddEditRecord(type: string, item: { _id: number; subject: string; }) {
    let tempData = { id: 0, subject: '' };
    if(type === 'edit') {
      tempData.id = item._id;
      tempData.subject = item.subject;
    }
    const dialogRef = this.dialog.open(DialogAddEditAdminRecordDialog, {
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

  onDeleteRecord(item: { _id: any; subject: any; }) {
    let tempData = { id: item._id, subject: item.subject };
    const dialogRef = this.dialog.open(DialogDeleteAdminRecordDialog, {
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
  '<div class="header-text">Add New Subject</div><mat-icon aria-hidden="false" class="close-cross" (click)="onCancelClick()" aria-label="Example close icon">close</mat-icon></div><div class="content">' +
  '   <form #authForm="ngForm" (ngSubmit)="onSave(authForm)">' +
  '   <div fxLayout="row" fxLayoutAlign="start none">' +
  '     <div class="request-form"><div class="request-form-content">' +
  '         <mat-form-field class="request-field" appearance="outline"><mat-label>Subject Name</mat-label><input matInput [(ngModel)]="dataObject.subject" id="subject" name="subject" placeholder="Enter Subject Name" autocomplete="off" maxlength="20" required></mat-form-field>' +
  '       </div></div></div>' +
  '   <div fxLayout="row" fxLayoutAlign="center none"><button mat-raised-button color="primary" type="submit">{{textButton}} Subject</button></div>' +
  '   </form></div></div></div>',
})

export class DialogAddEditAdminRecordDialog {
  dataObject = {
    id: 0,
    subject: ''
  };
  textButton = 'Add';
  constructor(
    public dialogRef: MatDialogRef<DialogAddEditAdminRecordDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private _snackBar: MatSnackBar, private http: HttpClient, private urlListService: UrlListService) {
    }
  ngOnInit() {
    if(this.data) {
      this.dataObject.id = this.data.tempData.id;
      this.dataObject.subject = this.data.tempData.subject;
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
    if(this.dataObject.id === 0) {
      let response: any;
      this.http.post(this.urlListService.urls.subjectCreate, { subject: this.dataObject.subject })
      .subscribe(event => { 
        response = event;
        if(response.code === '200-MET-001') {
          this._snackBar.open('New subject is added successfully !', 'X', {
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
      this.http.post(this.urlListService.urls.subjectUpdate, { key: this.dataObject.id, subject: this.dataObject.subject })
      .subscribe(event => { 
        response = event;
        if(response.code === '200-MET-001') {
          this._snackBar.open('Subject is updated successfully !', 'X', {
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
  '     <div class="request-form">Are you sure want to delete subject {{dataObject.subject}} ?</div></div>' +
  '   <div fxLayout="row" fxLayoutAlign="center none"><button mat-raised-button type="button" (click)="onClick()" style="margin-right: 10px;">Yes</button><button mat-raised-button type="button" (click)="onCancelClick()">No</button></div>' +
  '   </form></div></div></div>',
})

export class DialogDeleteAdminRecordDialog {
  dataObject = {
    id: 0,
    subject: ''
  };
  
  constructor(
    public dialogRef: MatDialogRef<DialogDeleteAdminRecordDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private _snackBar: MatSnackBar, private http: HttpClient, private urlListService: UrlListService) {
    }
  ngOnInit() {
    if(this.data) {
      this.dataObject.id = this.data.tempData.id;
      this.dataObject.subject = this.data.tempData.subject;
    }
  }  
  
  onCancelClick() {
    this.dialogRef.close();
  }

  onClick() {
    let response: any;
    this.http.post(this.urlListService.urls.subjectDelete, { key: this.dataObject.id })
    .subscribe(event => { 
      response = event;
      if(response.code === '200-MET-001') {
        this._snackBar.open('Subject is deleted successfully !', 'X', {
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