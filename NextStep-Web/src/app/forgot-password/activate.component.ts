import { Component  } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UrlListService } from '../shared/url-list.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-activate-component',
  templateUrl: './activate.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ActivateComponent {

  resettoken = '';
  notActivated = false;
  activated = false;
  constructor(public router: Router, private http: HttpClient, private urlListService: UrlListService, public dialog: MatDialog, private activatedRoute: ActivatedRoute, private _snackBar: MatSnackBar) {}
  ngOnInit() {
    this.activatedRoute.params.subscribe(paramsId => {
        this.resettoken = paramsId.resettoken;
        //this.resettoken = this.resettoken + '==';
    });
    this.activateUser();
  }
  
  activateUser() {
    let response: any;
    this.http.get(this.urlListService.urls.activateUser + this.resettoken)
      .subscribe(event => { 
        response = event;
        if(response.code === "200-TUS-002") {
          this.activated = true;
          this.notActivated = false;
        } else {
          this.activated = false;
          this.notActivated = true;
        }
      },
      errorMessage => {
        this.activated = false;
        this.notActivated = true;
      })
  }

}
