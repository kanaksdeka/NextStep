import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { UrlListService } from '../../../shared/url-list.service';
export interface PeriodicElement {
}
export interface DialogData {
  tempData: any;
  id: string,
  subject: string
}

@Component({
  selector: 'app-admin-student',
  templateUrl: './admin-student.component.html',
  styleUrls: ['./admin-student.component.css', '../../../common/header/common.css']
})
export class AdminStudentComponent implements OnInit {
  searchString = '';
  subjectList = [];
  loader = false;
  sectionList = [];
  gradeList = [];
  semesterList = [];

  displayedColumns: string[] = ['semester', 'grade', 'section', 'name', 'action'];
  dataSource = new MatTableDataSource<PeriodicElement>(this.subjectList);
  paramUser = 0;

  @ViewChild(MatPaginator, { read: '', static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { read: '', static: true }) sort: MatSort;

  constructor(public router: Router, public dialog: MatDialog, private _snackBar: MatSnackBar, private http: HttpClient, private urlListService: UrlListService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.getAllRecords();
    this.activatedRoute.params.subscribe(paramsId => {
      if (paramsId.user !== undefined) {
        this.paramUser = paramsId.user;
      }
    });
    this.dataSource = new MatTableDataSource<PeriodicElement>(this.subjectList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getAllRecords() {
    let response: any, responsesection: any, responsegrade: any;
    this.loader = true;
    this.http.get(this.urlListService.urls.getAllStudent)
      .subscribe(event => {
        response = event;
        if (response && response.length > 0) {
          for (var i = 0; i < response.length; i++) {
            response[i].name = response[i].profile.fullname;
            response[i].semester_name = response[i].profile.class[0].semester_name;
            response[i].class_name = response[i].profile.class[0].class_name;
            response[i].section_name = response[i].profile.class[0].section_name;
          }
          this.subjectList = response;
          this.dataSource = new MatTableDataSource<PeriodicElement>(this.subjectList);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      });

    this.http.get(this.urlListService.urls.semesterFetch)
      .subscribe(event => {
        response = event;
        if (response && response.length > 0) {
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
        if (response && response.length > 0) {
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
        if (responsesection && responsesection.length > 0) {
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
        if (responsegrade && responsegrade.length > 0) {
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

  onAddEditRecord(studentRec: string): void {
    var tempData = {
      studentRec: studentRec,
      subjectList: this.subjectList,
      sectionList: this.sectionList,
      gradeList: this.gradeList,
      semesterList: this.semesterList
    };

    const dialogProjectRef = this.dialog.open(DialogAddEditAdminStudentDialog, {
      disableClose: true,
      panelClass: 'create-new-class',
      width: '550px',
      data: { tempData }
    });

    dialogProjectRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.getAllRecords();
      }
    });
  }

  onDeleteRecord(item: { _id: any; grade: any; }) {
    // let tempData = { id: item._id, grade: item.grade };
    // const dialogRef = this.dialog.open(DialogDeleteClassAdminGradeRecordDialog, {
    //   width: '400px',
    //   panelClass: 'create-new-class',
    //   data: { tempData }
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('result', result);
    // });
  }

  onCancelClick() {
    if (this.paramUser === 0) {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/u/' + this.paramUser + '/admin-dashboard']);
    }
  }

}

@Component({
  selector: 'dialog-add-edit-admin-student-dialog',
  template: `<div class="main-content">
  <div class="well-create">
      <div class="header">
          <div class="header-text">Edit Student</div>
          <mat-icon aria-hidden="false" class="close-cross" (click)="onCancelClick()" aria-label="Example close icon">
              close</mat-icon>
      </div>
      <div class="content">
           <form #authForm="ngForm" (ngSubmit)="onSave(authForm)">
               <div fxLayout="row" fxLayoutAlign="start none">
                   <div class="request-form">
                      <div class="request-form-content">
                           <mat-form-field class="request-field" appearance="outline">
                              <mat-label>Semester</mat-label>
                              <mat-select [(ngModel)]="studentRec.semester_name" id="semester" name="semester" required>
                               <mat-option *ngFor="let item of semesterList" [value]="item.semester">{{item.semester}}</mat-option>
                              </mat-select>
                          </mat-form-field>
                           <mat-form-field class="request-field" appearance="outline">
                               <mat-label>Grade</mat-label>
                               <mat-select [(ngModel)]="studentRec.class_name" id="class" name="class" required>
                                <mat-option *ngFor="let item of gradeList" [value]="item.grade">{{item.grade}}</mat-option>
                               </mat-select>
                               </mat-form-field>
                           <mat-form-field class="request-field" appearance="outline">
                               <mat-label>Section</mat-label>
                               <mat-select [(ngModel)]="studentRec.section_name" id="section" name="section" required>
                                <mat-option *ngFor="let item of sectionList" [value]="item.section">{{item.section}}</mat-option>
                               </mat-select>
                               </mat-form-field>
                            <mat-form-field class="request-field" appearance="outline">
                               <mat-label>Name</mat-label>
                               <input matInput [(ngModel)]="studentRec.name" id="name"
                                  name="name" placeholder="Enter date" autocomplete="off" readonly required>
                               </mat-form-field>
                           </div>
                  </div>
              </div>
               <div fxLayout="row" fxLayoutAlign="center none"><button mat-raised-button color="primary"
                      type="submit">{{textButton}}</button></div>
               </form>
      </div>
  </div>
</div>`,
})
export class DialogAddEditAdminStudentDialog {
  studentRec: any;
  textButton = 'Save';
  subjectList = [];
  sectionList = [];
  gradeList = [];
  semesterList = [];
  constructor(
    public dialogRef: MatDialogRef<DialogAddEditAdminStudentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private _snackBar: MatSnackBar, private http: HttpClient, private urlListService: UrlListService) {
  }
  ngOnInit() {
    if (this.data) {
      this.studentRec = { ...this.data.tempData.studentRec };
      this.subjectList = this.data.tempData.subjectList;
      this.sectionList = this.data.tempData.sectionList;
      this.gradeList = this.data.tempData.gradeList;
      this.semesterList = this.data.tempData.semesterList;
    }
  }
  onCancelClick() {
    this.dialogRef.close();
  }

  onSave(form: NgForm) {
    if (!form.valid) {
      return;
    }
    console.log(this.studentRec);
    this.dialogRef.close();
  }
}