import { Component, Input  } from '@angular/core';
import { NgForm, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { UrlListService } from '../shared/url-list.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  progressBar = false;
  resetFlag = false;
  usernamevalue = '';
  username = new FormControl('', [Validators.required, Validators.email]);
  constructor(public router: Router, private http: HttpClient, private urlListService: UrlListService, public dialog: MatDialog, private _snackBar: MatSnackBar) {}
  ngOnInit() {}
  
  onSubmit() {
    this.resetFlag = false;
    if(this.usernamevalue !== '') {
      let response: any;
      this.progressBar = true;
      this.http.post(this.urlListService.urls.resetPassword, { email: this.usernamevalue })
      .subscribe(event => { 
        response = event;
        if(response.code === "200-FPWD-001") {
          this.progressBar = false;
          this.resetFlag = true;
        } else {
          this.progressBar = true;
          this._snackBar.open(response.desc, '', {
            duration: 7000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'error-message'
          });
        }     
      },
      errorMessage => {
        this.progressBar = true;
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
