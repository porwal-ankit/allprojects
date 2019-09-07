import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {LocalStorageService} from 'ngx-webstorage';
import {JwtHelper} from 'angular2-jwt';

@Injectable()
export class UserLoginService {

    private tokenStorageName = 'auth_bearer';

    private jwtHelper: JwtHelper = new JwtHelper();

    private _status: BehaviorSubject<any> = new BehaviorSubject(null);
    public status: Observable<any> = this._status.asObservable();
    private statusToken = null;

    public loggedIn = false;
    private inProgress: boolean = false;
    private redirectUrl: string = null;

    constructor(
        private router: Router,
        private storage: LocalStorageService
    ) {
        this.isLoggedIn();
    }


    public login(redirectUrl?: string): Observable<any> {
        if (!this.inProgress) {
            this.inProgress = true;

            if( redirectUrl ) {
                this.redirectUrl = redirectUrl;
            }

            this.router.navigate([{outlets: {modal: 'login'}}], {queryParamsHandling: 'merge'});
        }

        return this.status;
    }

    public logout() {
        this.deleteToken();
        this.router.navigate(['/']);
        return this.status;
    }

    public deleteToken() {
        this.storage.clear(this.tokenStorageName);
        this.inProgress = false;
        this.redirectUrl = null;
        this.isLoggedIn();
    }

    public setToken(token: string) {
        this.storage.store(this.tokenStorageName, token);
        this.inProgress = false;
        this.isLoggedIn();

        if( token && this.redirectUrl ) {
            this.router.navigate([this.redirectUrl], {queryParamsHandling: 'merge'});
        }

        this.redirectUrl = null;
    }

    public getToken() {
        return this.storage.retrieve(this.tokenStorageName);
    }

    public isLoggedIn() {
        let loginStatus = this.checkLoggedIn();

        if( loginStatus != this.loggedIn ) {
            this.loggedIn = loginStatus;
        }

        let status = this.loggedIn ? 'login' : 'logout';
        let token = this.getToken();

        if(this._status.getValue() != status || this.statusToken != token) {
            this.statusToken = token;
            this._status.next( status );
        }

        return this.loggedIn;
    }

    private checkLoggedIn() {
        let token = this.getToken();
        if (!token) {
            return false;
        }

        try {
            return !this.jwtHelper.isTokenExpired(token);
        } catch (e) {}

        return false;
    }

}
