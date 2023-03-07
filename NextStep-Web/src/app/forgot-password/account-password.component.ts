import { Component, Input  } from '@angular/core';
import { NgForm, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { UrlListService } from '../shared/url-list.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-account-password',
  templateUrl: './account-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class AccountPasswordComponent {

  resettoken = '';
  progressBar = false;
  resetFlag = false;
  usernamevalue = '';
  cusernamevalue = '';
  username = new FormControl('', [Validators.required]);
  cusername = new FormControl('', [Validators.required]);
  constructor(public router: Router, private http: HttpClient, private urlListService: UrlListService, public dialog: MatDialog, private activatedRoute: ActivatedRoute, private _snackBar: MatSnackBar) {}
  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
        this.resettoken = params.token;
    });
  }
  
  onSubmit() {
    this.resetFlag = false;
    if(this.usernamevalue !== '' && this.cusernamevalue !== '') {
      let response: any;
      this.progressBar = true;
      let data = {
        resettoken: this.resettoken,
        newpassword: this.usernamevalue,
        confirmpassword: this.cusernamevalue
      };
      this.http.post(this.urlListService.urls.changePassword, data)
      .subscribe(event => { 
        response = event;
        this.progressBar = false;
        if(response !== null) {
          if(response.code === "200-CPWD-001") {
            this.resetFlag = true;
          } else {
            this._snackBar.open(response.desc, '', {
              duration: 7000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: 'error-message'
            });
          }
        } else {
          this._snackBar.open('Token has expired. Please re-initiate the reset password again !', '', {
            duration: 7000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'error-message'
          });
        }   
      },
      errorMessage => {
        this.progressBar = false;
        this._snackBar.open(errorMessage.error.desc, '', {
          duration: 7000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'error-message'
        });
      })
    }
  }

}
