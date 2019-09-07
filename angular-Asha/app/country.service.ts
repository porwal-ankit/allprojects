import { Injectable } from '@angular/core';
import { SodaApiService } from './soda-api.service';
import {Headers} from '@angular/http';


@Injectable()
export class CountryService {

  private path = 'countries';

  constructor(private http: SodaApiService) { }


  public getCountries(): Promise<any> {
    let url = this.path;

    let headers = new Headers();
    headers.set('Accept', 'application/json');

    return this.http.get(url, {headers: headers})
        .toPromise()
        .then(response => {
          return response.json();
        })
        .catch(this.handleError);
  }

  private handleError( error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
