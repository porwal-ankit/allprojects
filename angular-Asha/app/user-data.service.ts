import {Injectable} from '@angular/core';
import {UserLoginService} from './user-login.service';
import {User} from './models/user';
import {LocalStorageService} from 'ngx-webstorage';
import {UserService} from './user.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class UserDataService {

    private tokenUserData = 'user_data';

    private _user: BehaviorSubject<User> = new BehaviorSubject(null);
    public user: Observable<User> = this._user.asObservable().distinctUntilChanged();


    constructor(private userLogin: UserLoginService,
                private userService: UserService,
                private storage: LocalStorageService) {

        this.userLogin.status.subscribe(() => {
            this.load();
        });
    }

    public isLoggedIn() {
        return this.userLogin.loggedIn;
    }

    public isLoaded() {
        let user = this.getUser();

        return ( user && user.id );
    }

    public getUser() {
        return this._user.getValue();
    }

    private load() {

        if (!this.userLogin.isLoggedIn()) {
            this._user.next(null);
            return;
        }

        let token = this.userLogin.getToken();
        if (!token) {
            this._user.next(null);
            return;
        }

        let userData = this.storage.retrieve(this.tokenUserData);
        if (userData && userData.token == token) {
            this._user.next(userData);
            return false;
        }

        this.userService.getUser().then(user => {
            this._user.next(user);
            user['token'] = token;
            this.storage.store(this.tokenUserData, user);
        });
    }

    public reload() {
        let currentUser = this.getUser();
        if( !currentUser || !currentUser['token'] ) {
            return;
        }

        this.userService.getUser().then(user => {
            this._user.next(user);
            user['token'] = currentUser['token'];
            this.storage.store(this.tokenUserData, user);
        });
    }

}
