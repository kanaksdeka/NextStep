import { Component, Input  } from '@angular/core';
import { NgForm, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, AuthResponseData } from '../common/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { UrlListService } from '../shared/url-list.service';
import { userInfo } from 'os';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  //@Input() appAuth: AppAuth;
  //authenticated = false;
  progressBar = false;
  credential = false;
  paramsUser = '';
  userData: any;
  constructor(private authService: AuthService, private router: Router, private activatedRoute: ActivatedRoute, private http: HttpClient, private urlListService: UrlListService) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    this.activatedRoute.params.subscribe(paramsId => {
      if(paramsId.user !== undefined) { this.paramsUser = paramsId.user; }
    });
    this.userData = userData;
    if(userData !== null && this.paramsUser === '') {
      if(userData.category === 'A') {
        this.router.navigate(['/admin-dashboard']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }
    this.reload();
  }
  
  reload() {
    if (!localStorage.getItem('x-log-hwe-fkp')) { 
      localStorage.setItem('x-log-hwe-fkp', 'no reload') 
      document.defaultView.location.reload(); 
    } else {
      localStorage.removeItem('x-log-hwe-fkp') 
    }
  }

  isLoading = false;
  loginData = {
    username: '',
    password: '',
    signed: false
  };
  
  username = new FormControl('', [Validators.required]);
  password = new FormControl('', [Validators.required]);

  onSubmit(form: NgForm) {
    if(this.loginData.username !== '' && this.loginData.password !== '') {
      //var user = {username: 'John', id: 'user01', _token : 'xyz' , _tokenExpirationDate: '2020-07-13T04:41:54.164Z'};
      //localStorage.setItem('userData', JSON.stringify(user));
      //this.router.navigate(['/dashboard']);
      this.credential = false;
      const username = this.loginData.username;
      const password = this.loginData.password;
      let authObs: Observable<AuthResponseData>;
      // this.isLoading = true;
      this.progressBar = true;
      if(this.paramsUser === '') {
        authObs = this.authService.login(username, password);
        authObs.subscribe(
          resData => {
            //console.log('LresData', resData.category);
            //this.isLoading = false;
            if(resData.category === 'A') {
              this.router.navigate(['/admin-dashboard']);
            } else {
              this.router.navigate(['/dashboard']);
            }
            
          },
          errorMessage => {
            this.credential = true;
            this.progressBar = false;
            console.log(errorMessage);
            //this.error = errorMessage;
            this.isLoading = false;
          }
        );
      }
      if(parseInt(this.paramsUser) > 0) {
        let response: any;
        let data = {
          email: username,
          password: password
        };
        this.http.post(this.urlListService.urls.login, data)
        .subscribe(
          event => { 
            response = event;
            let userinfo = {
              category: response.category,
              id: response.id,
              email: username,
              username: response.profile,
              status: response.status,
              token: response.token,
            };
            if(this.userData.users === undefined) {
              this.userData.users = [{ user: this.paramsUser, userinfo: userinfo }];
            } else {
              this.userData.users.push({ user: this.paramsUser, userinfo: userinfo });
            }
            localStorage.setItem('userData', JSON.stringify(this.userData));
            if(response.category === 'A') {
              this.router.navigate(['/u/' + this.paramsUser +'/admin-dashboard']);
            } else {
              this.router.navigate(['/u/' + this.paramsUser +'/dashboard']);
            }
          },
          errorMessage => {
            this.credential = true;
            this.progressBar = false;
            console.log(errorMessage);
            //this.error = errorMessage;
            this.isLoading = false;
          }
        );
      }
      form.reset();
    }
  }

  forgotPassword() {
    this.router.navigate(['/forgotpassword']);
  }

}
