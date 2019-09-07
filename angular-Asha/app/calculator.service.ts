import { Injectable } from '@angular/core';
import {SodaApiService} from './soda-api.service';
import {Headers} from '@angular/http';

@Injectable()
export class CalculatorService {

  private path = '';

  constructor(
      private http: SodaApiService
  ) { }


  public getCalculator(assetId: string): Promise<any> {
    let url = this.path + '/assets/' + assetId + '/calculator?';

    let headers = new Headers();
    headers.set('Accept', 'application/json');

    return this.http.get(url, {headers: headers})
        .toPromise()
        .then(response => {
          let data = response.json();

          return data.pricelists;
        })
        .catch(this.handleError);
  }


    public getPricelist(assetId: string, pricelistId: number, calculatorArguments?: any): Promise<any> {
        let url = this.path + '/assets/' + assetId + '/calculator/' + pricelistId + '?';

        for ( let key in calculatorArguments ) {
            if ( !calculatorArguments[key] ) {
                continue;
            }

            url += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(calculatorArguments[key]);
        }

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.get(url, {headers: headers})
            .toPromise()
            .then(response => {
                return response.json();
            })
            .catch(this.handleError);
    }


  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }


}
