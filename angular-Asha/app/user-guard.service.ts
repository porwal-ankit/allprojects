import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {UserLoginService} from './user-login.service';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class UserGuardService implements CanActivate {

  constructor(
      private userLogin: UserLoginService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
      return this.userLogin.status
          .filter( userStatus => {
              return userStatus == 'login' || userStatus == 'logout';
          } )
          .map(userStatus => {
              if( userStatus == 'login') {
                  return true;
              }

              this.userLogin.login( state.url );

              return false;
          });
  }

}
