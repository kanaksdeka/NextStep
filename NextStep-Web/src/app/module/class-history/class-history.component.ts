import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { UrlListService } from '../../shared/url-list.service';
import {HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType} from '@angular/common/http';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { IfStmt } from '@angular/compiler';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { isArray, isObject } from 'util';
export interface DialogData {
  tempData: any;
  id: string,
  subject: string
}

@Component({
  selector: 'app-class-history',
  templateUrl: './class-history.component.html',
  styleUrls: ['./class-history.component.css', '../../common/header/common.css']
})
export class ClassHistoryComponent implements OnInit {
  dataObject = {
    dateInput: '2020-07-08'
  };
  dataActual = {
    zoom: 'HDDG54GDG12',
    whiteBoard: 'http://localhost:4200/#/document-history',
    noteList: []
  };
  noteListDuplicate = [];
  validDates = [];
  classDetails = {
    extendedProps: {
      toolbarTitle: ''
    }
  };
  classDetailsId = '';
  loader = false;
  types = '';
  search = '';
  disabled = true;
  searchdate = '';
  paramUser = 0;
  searchString = '';
  list = [];
  count = 0;
  category = '';
  last = false;
  classId = '';
  empty = false;
  constructor(public router: Router, private urlListService: UrlListService, private http: HttpClient, private _snackBar: MatSnackBar, public dialog: MatDialog, private activatedRoute: ActivatedRoute) {}
  ngOnInit() {
    //const userData = JSON.parse(localStorage.getItem('userData'));
    //const classinfo = JSON.parse(localStorage.getItem('classinfo'));
    let classinfo: any;
    let userinfo: any;

    const tempUserData = JSON.parse(localStorage.getItem('userData'));
    const tempClassinfo = JSON.parse(localStorage.getItem('classinfo'));
    this.classId = localStorage.getItem('class-id');
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
  }

  onSave(form: NgForm) {
    if (!form.valid) {
      return;
    }
    let response: any;
    this.loader = true;
    this.empty = false;
    this.http.post(this.urlListService.urls.classHistory, { mainclassid: this.classId, searchstring: this.searchString })
    .subscribe(event => { 
      response = event;
      this.list = response;
      this.loader = false;
      if(!isArray(response)) {
        this.empty = true;
      }
    })
  }

  onCancelClick() {
    if(this.paramUser === 0) {
      this.router.navigate(['/dashboard']);  
    } else {
      this.router.navigate(['/u/' + this.paramUser + '/dashboard']);
    }
  }

  onLink(item: { link: string; }) {
    let tab = window.open();                 
    tab.location.href = item.link;
  }
  
  onDownload(url: string) {
    window.open(url, "_blank");
  }

  // onDownload(awsurl) {
  //   let response: any;
  //   this.http.get(awsurl)
  //   .subscribe(
  //     resData => {
  //       response = resData;
  //       let blob = new Blob([response], {
  //         type: response.type
  //       })
  //       let url = window.URL.createObjectURL(blob);
  //       let a = document.createElement('a');
  //       a.href = url;
  //       a.download = 'AAAAAA';
  //       a.click();
  //   }
  //   );
  // }
  
}