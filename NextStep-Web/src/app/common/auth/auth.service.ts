import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';
import { UrlListService } from '../../shared/url-list.service';

import { User } from './user.model';

export interface AuthResponseData {
  kind: string;
  token: string;
  profile: any;
  refreshToken: string;
  expiresIn: string;
  id: string;
  category: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = new BehaviorSubject<User>(null);
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router, private urlListService: UrlListService) {}

  // login(username: string, password: string) {
  //   return this.http
  //     .get<AuthResponseData>('https://jsonplaceholder.typicode.com/todos/1')
  //     .pipe(
  //       catchError(this.handleError),
  //       tap(resData => {
  //         resData.username = 'John';
  //         resData.localId = 'user01';
  //         resData.idToken = 'xyz';
  //         resData.expiresIn = '674433';

  //         this.handleAuthentication(
  //           resData.username,
  //           resData.localId,
  //           resData.idToken,
  //           +resData.expiresIn
  //         );
  //       })
  //     );
  // }

  login(username: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        this.urlListService.urls.login,
        {
          email: username,
          password: password
        }
      )
      .pipe(
        catchError(this.handleError),
        tap(resData => {
          this.handleAuthentication(
            resData.profile,
            resData.id,
            resData.category,
            resData.token,
            9999999999,
            username
          );
        })
      );
  }

  autoLogin() {
    const userData: {
      profile: string;
      id: string;
      category: string
      email: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData'));
    //console.log('userData', userData);
    if (!userData) {
      return;
    }

    const loadedUser = new User(
      userData.profile,
      userData.id,
      userData.category,
      userData.email,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/']);
    localStorage.removeItem('userData');
    localStorage.removeItem('classinfo');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuthentication(
    username: any,
    userId: string,
    category: string,
    token: string,
    expiresIn: number,
    email: string
  ) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(username, userId, category, email, token, expirationDate);
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email exists already';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'This email does not exist.';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'This password is not correct.';
        break;
    }
    return throwError(errorMessage);
  }
}
