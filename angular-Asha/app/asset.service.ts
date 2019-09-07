import {Injectable} from '@angular/core';
import {SodaApiService} from './soda-api.service';
import {Headers} from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import {Observable} from 'rxjs/Observable';


@Injectable()
export class AssetService {

    private path = 'assets';

    constructor(private http: SodaApiService) {
    }

    public getAssets(options: any): Observable<any> {
        let url = this.path + '?';
        url += 'page=' + (options['page'] > 1 ? options['page'] : 1);
        url += '&itemsPerPage=' + (options['itemsPerPage'] > 0 ? options['itemsPerPage'] : 50);

        if (options['searchKey']) {
            url += '&search=' + encodeURIComponent(options['searchKey']);
        }

        if (options['supplierId']) {
            url += '&supplier_id=' + encodeURIComponent(options['supplierId']);
        }

        if (options['license']) {
            url += '&license=' + encodeURIComponent(options['license']);
        }

        if (options['orientation']) {
            url += '&orientation=' + encodeURIComponent(options['orientation']);
        }

        if (options['format']) {
            url += '&format=' + encodeURIComponent(options['format']);
        }

        if (options['resolution_min']) {
            url += '&resolution_min=' + encodeURIComponent(options['resolution_min']);
        }

        if (options['color']) {
            let color = 'color';
            if ( options['color'] === 'bw' ) {
                color = 'black-white';
            } else if ( options['color'] === 'mch' ) {
                color = 'monochrome';
            }
            url += '&color=' + encodeURIComponent(color);
        }

        if (options['collection']) {
            url += '&collection=' + encodeURIComponent(options['collection']);
        }

        if (options['copyright']) {
            url += '&copyright=' + encodeURIComponent(options['copyright']);
        }

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.get(url, {headers: headers})
            .map(response => {
                let data = response.json();

                return {
                    assets: data['data'],
                    total: +data['total'],
                    faceted: data['facets']
                };
            });
    }

    public getAsset(id: number): Promise<any> {
        const url = `${this.path}/${id}`;
        return this.http.get(url)
            .toPromise()
            .then(response => response.json() as any)
            .catch(this.handleError);
    }



    public getSimilarAssets(id: number, options: any): Promise<any> {
        let url = this.path + '/' + id + '/similar?';
        url += 'page=' + (options['page'] > 1 ? options['page'] : 1);
        url += '&itemsPerPage=' + (options['itemsPerPage'] > 0 ? options['itemsPerPage'] : 50);


        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.get(url, {headers: headers})
            .toPromise()
            .then(response => {
                let data = response.json();

                return {
                    assets: data['data'],
                    total: +data['total']
                };
            })
            .catch(this.handleError);
    }



    public download(id: number, sizeType: string) {
        let url = this.path + '/' + id + '/files/' + sizeType + '?download=true';

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.get(url, {headers: headers})
            .toPromise()
            .then(response => {
                let data = response.json();
                this.http.download(data.downloadUrl);
            })
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }

}
