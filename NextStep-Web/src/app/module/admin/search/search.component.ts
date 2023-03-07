import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import {HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType} from '@angular/common/http';
import { UrlListService } from '../../../shared/url-list.service';

@Component({
  selector: 'app-admin-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css', '../../../common/header/common.css']
})
export class SearchComponent implements OnInit {
  searchString = '';
  list = [];
  count = 0;
  category = '';
  last = false;
  paramUser = 0;
  loader = false;
  empty = false;
  constructor(public router: Router, public dialog: MatDialog, private http: HttpClient, private urlListService: UrlListService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    let userinfo: any;
    
    const tempUserData = JSON.parse(localStorage.getItem('userData'));
    this.activatedRoute.params.subscribe(paramsId => {
      if(paramsId.user !== undefined) { 
        this.paramUser = paramsId.user;
        for(var i=0; i<tempUserData.users.length; i++) {
          if(tempUserData.users[i].user === paramsId.user) {
            userinfo = tempUserData.users[i].userinfo;
          }
        } 
      } else {
        userinfo = tempUserData;
      }
    });
    this.category = userinfo.category;
    
  }

  onCancelClick() {
    if(this.paramUser === 0) {
      if(this.category === 'A') {
        this.router.navigate(['/admin-dashboard']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    } else {
      if(this.category === 'A') {
        this.router.navigate(['/u/' + this.paramUser + '/admin-dashboard']);
      } else {
        this.router.navigate(['/u/' + this.paramUser + '/dashboard']);
      }
    }
  }

  onSave(form: NgForm) {
    if (!form.valid) {
      return;
    }
    this.list = [];
    let response: any;
    this.loader = true;
    this.empty = false;
    this.http.get(this.urlListService.urls.search + this.searchString)
    .subscribe(event => { 
      response = event;
      this.loader = false;
      this.count = response[0].count;
      for(var i=1; i<response.length; i++) {
        response[i].content = response[i].content.substring(0, 310);
        this.list.push(response[i]);
      }
      if(this.count === 0) {
        this.empty = true;
      }
    })
  }

  onDownload(url: string) {
    window.open(url, "_blank");
  }

}
