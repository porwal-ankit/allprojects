import { Injectable } from '@angular/core';
import {SodaApiService} from './soda-api.service';
import {Webseries} from './models/webseries';

@Injectable()
export class WebseriesService {

    private path = 'webseries';

    constructor(private http: SodaApiService) {
    }



    public getWebseries(id: number): Promise<Webseries> {
        const url = `${this.path}/${id}`;
        return this.http.get(url)
            .toPromise()
            .then(response => response.json() as any)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);

        return Promise.reject(error.message || error);
    }
}
