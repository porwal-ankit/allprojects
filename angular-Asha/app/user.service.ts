import {Injectable} from '@angular/core';
import {SodaApiService} from './soda-api.service';
import {Headers} from '@angular/http';
import {User} from './models/user';
import {UserLoginService} from './user-login.service';
import {Router} from '@angular/router';

@Injectable()
export class UserService {

    private path = 'user';

    constructor(
        private http: SodaApiService,
        private userLogin: UserLoginService,
        private router: Router
    ) {
    }


    public login(username: string, password: string): Promise<any> {
        let url = this.path + '/login';

        let postBody = new URLSearchParams();
        postBody.set('username', username);
        postBody.set('password', password);

        let headers = new Headers();
        headers.set('Content-Type', 'application/x-www-form-urlencoded');

        return this.http.post(url, postBody.toString(), {headers: headers})
            .toPromise()
            .then(
                successResponse => {
                    let data = successResponse.json();
                    if (!data.token) {
                        throw new Error('No token in login response');
                    }

                    this.userLogin.setToken(data.token);
                },
                errorResponse => {
                    if (errorResponse.status === 401) {
                        if( errorResponse.json().message.status == '401 Disabled' ) {
                            throw new Error('Email Not Verified');
                        } else {
                            throw new Error('Wrong username and/or password');
                        }
                    } else {
                        throw new Error('Something went wrong...');
                    }
                }
            );
    }


    public directLogin(lid: number, mds: string, uid: number): Promise<any> {
        let url = this.path + '/direct-login/'+ encodeURIComponent(String(lid)) +'/'+ encodeURIComponent(String(uid)) +'/'+ encodeURIComponent(mds);

        return this.http.post(url, '')
            .toPromise()
            .then(
                successResponse => {
                    let data = successResponse.json();
                    if (!data.token) {
                        throw new Error('No token in login response');
                    }

                    this.userLogin.setToken(data.token);
                    this.router.navigate(['/']);
                },
                errorResponse => {
                    if (errorResponse.status === 401) {
                        if( errorResponse.json().message.status == '401 Disabled' ) {
                            throw new Error('Email Not Verified');
                        } else {
                            throw new Error('Wrong username and/or password');
                        }
                    } else {
                        throw new Error('Something went wrong...');
                    }
                }
            );
    }

    public logout() {
        this.userLogin.deleteToken();
    }

    public register(user: User) {
        let url = this.path;

        return this.http.post(url, user)
            .toPromise()
            .then(
                successResponse => {
                    return successResponse.json();
                },
                errorResponse => {
                    if ( errorResponse.headers.get('Content-Type').indexOf('application/problem+json') !== -1) {
                        throw errorResponse.json();
                    }

                    throw errorResponse;
                }
            );
    }

    public verify(userId: number, token: string) {
        let url = this.path +'/'+ userId +'/verify?token='+ encodeURIComponent(token);

        return this.http.post(url, {})
            .map( data => data.json() )
            .toPromise();
    }

    public getUser(): Promise<User> {
        let headers = new Headers();
        headers.set('Content-Type', 'application/json');

        let url = this.path;

        return this.http.get(url, {headers: headers})
            .map(data => data.json() as User)
            .toPromise();
    }

    public resendVerificationEmail(email: string) {
        let url = this.path + '/resend-verification?email='+ encodeURIComponent(email);

        return this.http.post(url, '')
            .toPromise()
            .then(
                successResponse => {
                    return true;
                },
                errorResponse => {
                    return false;
                }
            );
    }

    public update(user: User) {
        let url = this.path;

        return this.http.put(url, user)
            .toPromise()
            .then(
                successResponse => successResponse.json(),
                errorResponse => {
                    if ( errorResponse.headers.get('Content-Type').indexOf('application/problem+json') !== -1) {
                        throw errorResponse.json();
                    }

                    throw errorResponse;
                }
            );
    }

    public requestPasswordResetToken(email: string) {
        let url = this.path + '/request-reset-token';

        return this.http.post(url, {email: email})
            .toPromise()
            .then(
                successResponse => {
                    return true;
                }
            );
    }

    public resetPasswordWithToken(email: string, token: string, newPassword: string) {
        let url = this.path + '/reset-password';

        return this.http.post(url, {
                email: email,
                token: token,
                password: newPassword
            })
            .toPromise()
            .then(
                successResponse => {
                    return true;
                }
            );
    }
}
