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
  section: string
}
@Component({
  selector: 'app-admin-section',
  templateUrl: './admin-section.component.html',
  styleUrls: ['./admin-section.component.css', '../../../common/header/common.css']
})
export class AdminSectionComponent implements OnInit {
  subjectList = [];
  
  displayedColumns: string[] = [ 'section', 'action' ];
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
    this.http.get(this.urlListService.urls.sectionAll)
    .subscribe(event => { 
      response = event;
      if(response && response.length > 0) {
        this.subjectList = response;
        this.dataSource = new MatTableDataSource<PeriodicElement>(this.subjectList);
        this.dataSource.paginator = this.paginator;
      }     
    })
  }

  onAddEditRecord(type: string, item: { _id: number; section: string; }) {
    let tempData = { id: 0, section: '' };
    if(type === 'edit') {
      tempData.id = item._id;
      tempData.section = item.section;
    }
    const dialogRef = this.dialog.open(DialogAddEditSectionAdminRecordDialog, {
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

  onDeleteRecord(item: { _id: any; section: any; }) {
    let tempData = { id: item._id, section: item.section };
    const dialogRef = this.dialog.open(DialogDeleteAdminSectionRecordDialog, {
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
  '<div class="header-text">Add New Section</div><mat-icon aria-hidden="false" class="close-cross" (click)="onCancelClick()" aria-label="Example close icon">close</mat-icon></div><div class="content">' +
  '   <form #authForm="ngForm" (ngSubmit)="onSave(authForm)">' +
  '   <div fxLayout="row" fxLayoutAlign="start none">' +
  '     <div class="request-form"><div class="request-form-content">' +
  '         <mat-form-field class="request-field" appearance="outline"><mat-label>Section Name</mat-label><input matInput [(ngModel)]="dataObject.section" id="section" name="section" placeholder="Enter Section Name" autocomplete="off" maxlength="20" required></mat-form-field>' +
  '       </div></div></div>' +
  '   <div fxLayout="row" fxLayoutAlign="center none"><button mat-raised-button color="primary" type="submit">{{textButton}} Section</button></div>' +
  '   </form></div></div></div>',
})

export class DialogAddEditSectionAdminRecordDialog {
  dataObject = {
    id: 0,
    section: ''
  };
  textButton = 'Add';
  constructor(
    public dialogRef: MatDialogRef<DialogAddEditSectionAdminRecordDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private _snackBar: MatSnackBar, private http: HttpClient, private urlListService: UrlListService) {
    }
  ngOnInit() {
    if(this.data) {
      console.log('this.data', this.data.tempData);
      this.dataObject.id = this.data.tempData.id;
      this.dataObject.section = this.data.tempData.section;
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
      this.http.post(this.urlListService.urls.sectionCreate, { section: this.dataObject.section })
      .subscribe(event => { 
        response = event;
        if(response.code === '200-MET-001') {
          this._snackBar.open('New section is added successfully !', 'X', {
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
      this.http.post(this.urlListService.urls.sectionUpdate, { key: this.dataObject.id, section: this.dataObject.section })
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
  '     <div class="request-form">Are you sure to delete {{dataObject.section}} ?</div></div>' +
  '   <div fxLayout="row" fxLayoutAlign="center none"><button mat-raised-button type="button" (click)="onClick()" style="margin-right: 10px;">Yes</button><button mat-raised-button type="button" (click)="onCancelClick()">No</button></div>' +
  '   </form></div></div></div>',
})

export class DialogDeleteAdminSectionRecordDialog {
  dataObject = {
    id: 0,
    section: ''
  };
  
  constructor(
    public dialogRef: MatDialogRef<DialogDeleteAdminSectionRecordDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private _snackBar: MatSnackBar, private http: HttpClient, private urlListService: UrlListService) {
    }
  ngOnInit() {
    if(this.data) {
      this.dataObject.id = this.data.tempData.id;
      this.dataObject.section = this.data.tempData.section;
    } 
  }  
  
  onCancelClick() {
    this.dialogRef.close();
  }

  onClick() {
    this.http.post(this.urlListService.urls.sectionDelete, { key: this.dataObject.id })
    .subscribe(event => { 
      let response: any;
      response = event;
      if(response.code === '200-MET-001') {
        this._snackBar.open('Section is deleted successfully !', 'X', {
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
