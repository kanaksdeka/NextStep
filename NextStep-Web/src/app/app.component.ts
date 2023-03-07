import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './common/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  private userSub: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    //this.userSub = this.authService.user.subscribe(user => {
      //this.isAuthenticated = !!user;
      // if(this.isAuthenticated) {
      //   this.router.navigate(['/dashboard']);
      // }
      //console.log('isAuthenticated', !!user);
    //});
    //this.authService.autoLogin();
    // const userData: {
    //   username: string;
    //   id: string;
    //   _token: string;
    //   _tokenExpirationDate: string;
    // } = JSON.parse(localStorage.getItem('userData'));
    // console.log('userData satya', userData);
    // if(userData) {
    //   this.isAuthenticated = true;
    // }
    this.authService.autoLogin();
  }
  
  ngOnDestroy() {
    this.userSub.unsubscribe();
  }
}