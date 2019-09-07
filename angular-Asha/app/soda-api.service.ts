import {Injectable} from '@angular/core';
import {Http, RequestOptionsArgs, Response, Request, Headers, ConnectionBackend, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {UserLoginService} from './user-login.service';

@Injectable()
export class SodaApiService extends Http {

    private relativeEndpointUrl = '/api/';
    private absoluteEndpointUrl = 'https://api.imagepoint.sodatech.com/';

    constructor(
        _backend: ConnectionBackend,
        _defaultOptions: RequestOptions,
        private userLogin: UserLoginService
    ) {
        super(_backend, _defaultOptions);
    }

    request(request: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        // Set URL
        let url = '';
        if (typeof request === 'string') {
            url = request;
            request = this.getRequestUrl(request);

        } else {
            url = request.url;
            request.url = this.getRequestUrl(request.url);
        }

        // execute request
        return Observable.of(1).mergeMap( () => {
            if ( !options ) {
                options = {};
            }
            this.setDefaultHeaders(request, options);
            return super.request(request, options);
        })
        .retryWhen( errors => errors.switchMap(sourceErr => {
                if (url != 'user/login' && (sourceErr.status === 403 || sourceErr.status === 401)) {
                        return this.userLogin.login()
                                .skip(1);
                }

                return Observable.throw(sourceErr);
            })
        );
    }

    public download(apiUrl) {
        window.open( this.getRequestUrl(apiUrl), '_self');
    }

    private setDefaultHeaders(request: string | Request, options?: RequestOptionsArgs): void {
        let headers: Headers;
        if (typeof request === 'string') {
            if (!options) {
                options = {headers: new Headers()};
            }
            headers = options.headers;

        } else {
            headers = request.headers;
        }

        let token = this.userLogin.getToken();
        if (token && this.userLogin.isLoggedIn()) {
            headers.set('Authorization', 'Bearer ' + token);
        } else if (headers.has('Authorization')) {
            headers.delete('Authorization');
        }

        if (!headers.has('Accept')) {
            headers.set('Accept', 'application/json');
        }
    }

    private getRequestUrl(path: string): string {
        if( path.substr(0,1) == '/' ) {
            path = path.substr(1);
        }

        if( typeof window !== 'undefined' && window.document && window.location.hostname != 'localhost' ) {
            return this.relativeEndpointUrl + path;
        }

        return this.absoluteEndpointUrl + path;
    }

}
