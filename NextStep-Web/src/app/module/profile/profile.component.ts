import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../common/auth/auth.service';
import { UrlListService } from '../../shared/url-list.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import moment from 'moment-timezone';
import { Moment } from 'moment';

export interface DialogData {
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css', '../../common/header/common.css']
})
export class ProfileComponent implements OnInit {

  fileErrorMessage = '';
  public tzNames: any;
  //private userSub: Subscription;
  profileData = {
    id: '',
    name: '',
    email: '',
    parent: '',
    rollNo: '',
    day: '',
    month: '',
    mobile: '',
    address: '',
    pin: '',
    state: '',
    grade: '',
    section: '',
    semester: '',
    category: 'T',
    timezone: '',
    usertimezone: ''
  };
  profilephoto: any;
  constructor(private authService: AuthService, public router: Router, public dialogRef: MatDialogRef<ProfileComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData, private http: HttpClient, private urlListService: UrlListService, private activatedRoute: ActivatedRoute, private _snackBar: MatSnackBar) { }
  ngOnInit() {
    // this.userSub = this.authService.user.subscribe(user => {
    //   console.log('isAuthenticated', !!user);
    // });
    const userData = JSON.parse(localStorage.getItem('userData'));
    this.profileData.id = userData.id;
    this.profileData.email = userData.email;
    this.profileData.category = userData.category;
    this.profileChange(this.data, userData);
    this.tzNames = moment.tz.names().map((tz) => { 
      const timezone = moment.tz(tz).format('Z z');
         return {tzname: tz, tztext: tz + ' ' + timezone};
       });
    const zone_name =  moment.tz.guess();
    const timezone = moment.tz(zone_name).format('Z z');
    this.profileData.usertimezone = moment.tz.guess() + ' ' + timezone;
    this.profileData.timezone = moment.tz.guess();
  }

  profileChange(data, userData) {
    if (data.paramsUser > 0) {
      for (var i = 0; i < userData.users.length; i++) {
        if (parseInt(userData.users[i].user) === data.paramsUser) {
          this.profileData.email = userData.users[i].userinfo.email;
          this.profileData.category = userData.users[i].userinfo.category;
        }
      }
    }
    this.fetchProfile();
  }

  fetchProfile() {
    let response: any;
    this.http.get(this.urlListService.urls.profileFetch)
      .subscribe(
        event => {
          response = event;
          this.profileData.rollNo = response.enrollmentnumber;
          this.profileData.grade = response.class_name;
          this.profileData.semester = response.semester_name;
          this.profileData.section = response.section_name;
          this.profileData.name = response.name;
          this.profileData.parent = response.gurdianname;
          this.profileData.day = response.birthday;
          this.profileData.month = response.birthmonth;
          this.profileData.mobile = response.phone;
          this.profileData.address = response.address.address;
          this.profileData.state = response.address.state;
          this.profileData.pin = response.address.zipcode;
          this.profilephoto = response.profilephoto;
          // this.profileData.timezone = response.timezone ? response.timezone : moment.tz.guess().format();
        },
        error => {
        }
      );
  }

  onSave(form: NgForm) {
    if (!form.valid) {
      return;
    }
    var data = {
      update: {
        address: {
          addressline: this.profileData.address,
          state: this.profileData.state,
          zipcode: this.profileData.pin,
        },
        name: this.profileData.name,
        birthDay: this.profileData.day,
        birthMonth: this.profileData.month,
        parent: this.profileData.parent,
        phonenumber: this.profileData.mobile,
        rollnumber: this.profileData.rollNo,
        timezone: this.profileData.timezone
      }
    };
    this.http.post(this.urlListService.urls.profileUpdate, data)
      .subscribe(
        event => {
          this.dialogRef.close();
        },
        error => {
        }
      );

    // this._snackBar.open('New well is saved successfully.', '', {
    //   duration: 2000,
    //   verticalPosition: 'top',
    //   panelClass: ['custom-snackbar']
    // });
    //this.router.navigate(['/well']);  
  }

  onCancelClick() {
    this.dialogRef.close();
  }

  upload(files: File[]) {
    this.fileErrorMessage = '';
    var ext = files[0].name.substring(files[0].name.lastIndexOf('.') + 1);
    //if (ext.toLowerCase() == 'jpg' || ext.toLowerCase() == 'jpg' || ext.toLowerCase() == 'jpeg' || ext.toLowerCase() == 'tiff' || ext.toLowerCase() == 'jif' || ext.toLowerCase() == 'jfif') {
    if (ext) {
      var formData = new FormData();
      Array.from(files).forEach(f => formData.append('file', f));
      formData.append('profileid', this.profileData.id);

      let response: any;
      this.http.post(this.urlListService.urls.profilePhotoUpload, formData)
        .subscribe(
          resData => {
            response = resData;
            if (response.code === '200-UUR-000') {
              this._snackBar.open('Profile photo is updated successfully !', 'X', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: 'success-message'
              });
              this.fetchProfile();
            } else {
              this._snackBar.open('Failed to upload image !', '', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: 'error-message'
              });
            }
          },
          errorMessage => {
            this._snackBar.open(errorMessage.message, '', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: 'error-message'
            });
          }
        );
    } else {
      this.fileErrorMessage = 'Only JPG/JPEG format is allowed. Please select a supported image only!';
    }
  }

  // basicUpload(files: File[]){
  //   var formData = new FormData();
  //   Array.from(files).forEach(f => formData.append('file', f))
  //   this.http.post('https://file.io', formData)
  //     .subscribe(event => {  
  //       console.log('done')
  //     })
  // }

  //this will fail since file.io dosen't accept this type of upload
  //but it is still possible to upload a file with this style
  // basicUploadSingle(file: File){    
  //   this.http.post('https://file.io', file)
  //     .subscribe(event => {  
  //       console.log('done')
  //     })
  // }

  // uploadAndProgress(files: File[]){
  //   console.log(files)
  //   var formData = new FormData();
  //   Array.from(files).forEach(f => formData.append('file',f))

  //   this.http.post('https://file.io', formData, {reportProgress: true, observe: 'events'})
  //     .subscribe(event => {
  //       if (event.type === HttpEventType.UploadProgress) {
  //         this.percentDone = Math.round(100 * event.loaded / event.total);
  //       } else if (event instanceof HttpResponse) {
  //         this.uploadSuccess = true;
  //       }
  //   });
  // }

  //this will fail since file.io dosen't accept this type of upload
  //but it is still possible to upload a file with this style
  // uploadAndProgressSingle(file: File){    
  //   this.http.post('https://file.io', file, {reportProgress: true, observe: 'events'})
  //     .subscribe(event => {
  //       if (event.type === HttpEventType.UploadProgress) {
  //         this.percentDone = Math.round(100 * event.loaded / event.total);
  //       } else if (event instanceof HttpResponse) {
  //         this.uploadSuccess = true;
  //       }
  //   });
  // }

}