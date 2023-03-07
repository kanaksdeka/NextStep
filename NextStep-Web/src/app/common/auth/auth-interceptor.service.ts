import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpParams
} from '@angular/common/http';
import { take, exhaustMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';
import { isObject } from 'util';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  paramsUser = 0;
  tokennew = '';
  constructor(private authService: AuthService, private activatedRoute: ActivatedRoute) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    let queryString = window.location.href, urlString = [];
    urlString = queryString.split('/u/');
    if(urlString.length > 1 && userData.users) {
      let temp = urlString[1].split('/')[0];
      this.paramsUser = parseInt(temp);
      for(var i=0; i<userData.users.length; i++) {
        if(parseInt(userData.users[i].user) === this.paramsUser) {
          this.tokennew = userData.users[i].userinfo.token;
        }
      }
    }    
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.authService.user.pipe(
      take(1),
      exhaustMap(user => {
        if (!user) {
          return next.handle(req);
        }
        if(this.paramsUser > 0) {
          const modifiedReq = req.clone({
            setHeaders: {
              Authorization: `${this.tokennew}`
            }
          });  
          return next.handle(modifiedReq);
        } else {
          const modifiedReq = req.clone({
            setHeaders: {
              Authorization: `${user.token}`
            }
          });
          return next.handle(modifiedReq);
        }
        // const modifiedReq = req.clone({
        //   params: new HttpParams().set('auth', user.token)
        // });
      })
    );
  }
}
