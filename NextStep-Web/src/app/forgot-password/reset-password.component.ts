  import { Component, OnInit, Inject } from '@angular/core';
  import { Router, ActivatedRoute } from '@angular/router';
  import { NgForm } from '@angular/forms';
  import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
  import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
  import { MatSnackBar } from '@angular/material/snack-bar';
  import { Subscription } from 'rxjs';
  import { AuthService } from '../common/auth/auth.service';
  import { UrlListService } from '../shared/url-list.service';
  
  export interface DialogData {
  }
  
  @Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./forgot-password.component.css', '../common/header/common.css']
  })
  export class ResetPasswordComponent implements OnInit {
  
    profileData = {
      currentpassword: '',
      password: '',
      cpassword: ''
    };
    error = false;
    userData: any;
    constructor(private authService: AuthService, public router: Router, public dialogRef: MatDialogRef<ResetPasswordComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData, private http: HttpClient, private urlListService: UrlListService, private activatedRoute: ActivatedRoute, private _snackBar: MatSnackBar) {}
    ngOnInit() {
      this.userData = JSON.parse(localStorage.getItem('userData'));
    }
    
  
    onSave(form: NgForm) {
      if (!form.valid) {
        return;
      }
      this.error = false;
      if(this.profileData.password !== '' && this.profileData.cpassword !== '' && this.profileData.currentpassword) {
        if((this.profileData.password === this.profileData.currentpassword) || (this.profileData.cpassword === this.profileData.currentpassword)) {
          this._snackBar.open('Current and new password is same. Please change it !', '', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'error-message'
          });
        }
        else if(this.profileData.password === this.profileData.cpassword) {
          var data = {
            userid: this.userData.id,
            currentpassword: this.profileData.currentpassword,
            newpassword: this.profileData.password,
            confirmpassword: this.profileData.cpassword
          };
          let response: any;
          this.http.post(this.urlListService.urls.changeProfilePassword, data)
          .subscribe(event => { 
            response = event;
            if(response.code === "200-CPWD-001") {
              this._snackBar.open('Password change is successfully !', 'X', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: 'success-message'
              });
              this.dialogRef.close();        
            } else {
              this._snackBar.open(response.desc, '', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: 'error-message'
              });
            }     
          },
          errorMessage => {
            this._snackBar.open(errorMessage.error.desc, '', {
              duration: 7000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: 'error-message'
            });
          })
          
        } else {
          this._snackBar.open('Password mis-matched. Please re-enetr proper passwords !', '', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'error-message'
          });
        }
      }  
    }
  
    onCancelClick() {
      this.dialogRef.close();
    }
  
  }