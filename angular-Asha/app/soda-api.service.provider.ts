import {SodaApiService} from './soda-api.service';
import {Http, RequestOptions} from '@angular/http';
import { UserLoginService } from './user-login.service';

export function SodaApiServiceFactory(http: Http, defaultOptions: RequestOptions, userLogin: UserLoginService) {
    return new SodaApiService((<any>http)._backend, defaultOptions, userLogin);
}

export let SodaApiServiceProvider = {
    provide: SodaApiService,
    useFactory: SodaApiServiceFactory,
    deps: [ Http, RequestOptions, UserLoginService ]
};
