import { Component, Input, OnInit  } from '@angular/core';
import { NgForm, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, AuthResponseData } from '../../common/auth/auth.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private router: Router) { }
  ngOnInit() {}

  loginData = {
    username: 'abcdetest@testmail.com',
    password: '',
    cpassword: '',
    credential: false
  };

  isLoading = false;
  
  username = new FormControl('', [Validators.required]);
  password = new FormControl('', [Validators.required]);
  cpassword = new FormControl('', [Validators.required]);

  onSubmit() {
    this.loginData.credential = false; 
    
    if(this.loginData.username !== '' && this.loginData.password !== '' && this.loginData.cpassword !== '') {
      if(this.loginData.password === this.loginData.cpassword) {
        this.router.navigate(['/dashboard']);
      } else {
        this.loginData.credential = true;
      }
      
      //var user = {username: 'John', id: 'user01', _token : 'xyz' , _tokenExpirationDate: '2020-07-13T04:41:54.164Z'};
      //localStorage.setItem('userData', JSON.stringify(user));
      //this.router.navigate(['/dashboard']);
    }

    
    // authObs = this.authService.login(username, password);

    // authObs.subscribe(
    //   resData => {
    //     console.log('Response from test API https://jsonplaceholder.typicode.com/todos/1', resData);
    //     this.isLoading = false;
    //     this.router.navigate(['/dashboard']);
    //   },
    //   errorMessage => {
    //     console.log(errorMessage);
    //     //this.error = errorMessage;
    //     this.isLoading = false;
    //   }
    // );

    //form.reset();
  }

}
