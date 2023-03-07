import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UrlListService } from '../../shared/url-list.service';
import {HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType} from '@angular/common/http';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { NotifyDialogComponent } from '../notify-dialog/notify-dialog.component';
@Component({
  selector: 'app-sudent-list',
  templateUrl: './sudent-list.component.html',
  styleUrls: ['./sudent-list.component.css', '../../common/header/common.css']
})
export class SudentListComponent implements OnInit {

  data = [];
  searchStudent = '';
  loader = true;
  classDetails: any;
  paramUser = 0;
  constructor(public router: Router, private urlListService: UrlListService, private http: HttpClient, private _snackBar: MatSnackBar, public dialog: MatDialog, private activatedRoute: ActivatedRoute) {}
  ngOnInit() {
    //const classinfo = JSON.parse(localStorage.getItem('classinfo'));
    
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
    this.classDetails = classinfo;
    this.getStudentList(classinfo);
  }

  getStudentList(item: { extendedProps: { grade: any; section: any; semester: any; subject: any; }; }) {
    let response: any;
    this.loader = true;
    this.http.post(this.urlListService.urls.roaster, { class: item.extendedProps.grade, section: item.extendedProps.section, semester: item.extendedProps.semester, subject: item.extendedProps.subject })
    .subscribe(
      resData => {
        response = resData;
        if(response.length) {
          this.data = response;
        }
        this.loader = false;
      },
      errorMessage => {
        this._snackBar.open(errorMessage.message, '', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'error-message'
        });
        this.loader = false;
      }
    );
  }

  filterFunction(your_collection): any[] {  
    if(this.searchStudent) {
      return your_collection.filter(i => i.name === this.searchStudent);
    } else {
      return your_collection;
    }
  }

  gradeBook(item) {
    console.log('item', item);
  }

  openNotify(item: { studentid: any; }) {
    const dialogProjectRef = this.dialog.open(NotifyDialogComponent, {
      disableClose: true,
      panelClass: 'notify-dialog',
      width: '500px',
      data: {studentid: item.studentid, subject: this.classDetails.extendedProps.subject, type: 'tostudent'}
    });

    dialogProjectRef.afterClosed().subscribe(result => {
      if(result !== undefined) {
        console.log('The dialog was closed', result);
      }
    });
  }

  onCancelClick() {
    if(this.paramUser === 0) {
      this.router.navigate(['/dashboard/5f12f2c9e197714c8162be25']);  
    } else {
      this.router.navigate(['/u/' + this.paramUser + '/dashboard/5f12f2c9e197714c8162be25']);
    }
  }

}
