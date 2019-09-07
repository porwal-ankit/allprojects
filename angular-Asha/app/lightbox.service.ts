import { Injectable } from '@angular/core';
import {SodaApiService} from './soda-api.service';
import {Observable} from 'rxjs/Observable';
import {Headers} from '@angular/http';
import {Lightbox} from './models/lightbox';
import {PagingResult} from './models/paging_result';
import {Article} from './models/article';
import {CartDataService} from './cart-data.service';

@Injectable()
export class LightboxService {

  private path = 'lightboxes';

  constructor(
      private http: SodaApiService,
      private cartDataService: CartDataService
  ) { }


  getLightboxes(options: any = {}): Observable< PagingResult<Lightbox> > {
    let page    = (options['page'] > 1 ? options['page'] : 1);
    let perPage = (options['itemsPerPage'] > 0 ? options['itemsPerPage'] : 50);

    let url = this.path + '?';
    url += 'page=' + page;
    url += '&itemsPerPage=' + perPage;

    let headers = new Headers();
    headers.set('Accept', 'application/json');

    return this.http.get(url, {headers: headers})
        .map(response => {
          let data = response.json();

          let total = 0;

          if (data['@type'] === 'hydra:Collection') {
            let hydra = data;
            data = hydra['hydra:member'];
            total = +hydra['hydra:totalItems'];
          }

          for ( let lightbox of data ) {
              lightbox.creationDate = new Date(lightbox.creationDate);
              lightbox.modificationDate = new Date(lightbox.modificationDate);
          }

          return new PagingResult<Lightbox>(data, total, page, perPage );
        });
  }

    createLightbox( data ) {

        let url = this.path;

        let headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.set('Content-Type', 'application/json');

        return this.http.post(url, data, {headers: headers})
            .map(response => {
                let lightbox = response.json();
                lightbox.creationDate = new Date(lightbox.creationDate);
                lightbox.modificationDate = new Date(lightbox.modificationDate);

                return lightbox;
            });
    }

    updateLightbox( id, data ) {
        let url = this.path + '/' + id;
        let headers = new Headers();

        headers.set('Accept', 'application/json');
        headers.set('Content-Type', 'application/json');

        return this.http.put(url, data, {headers: headers})
            .map(response => {
                let lightbox = response.json();
                lightbox.creationDate = new Date(lightbox.creationDate);
                lightbox.modificationDate = new Date(lightbox.modificationDate);

                return lightbox;
            });
    }

    deleteLightbox( id ) {
        let url = this.path + '/' + id;

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.delete(url, {headers: headers})
            .map(response => {
                return response.json();
            });
    }

    getLightbox(lightboxId): Observable<any> {
        let url = this.path + '/' + lightboxId;

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.get(url, {headers: headers})
            .map(response => {
                let lightbox = response.json();
                lightbox.creationDate = new Date(lightbox.creationDate);
                lightbox.modificationDate = new Date(lightbox.modificationDate);

                return lightbox;
            });
    }

    addAsset(lightboxId: number, assetId: number, comment?: string, position?: number): Observable<any> {

      let url = this.path + '/' + lightboxId + '/assets';

      let headers = new Headers();
      headers.set('Accept', 'application/json');
      headers.set('Content-Type', 'application/json');

      let body = {
          'id': assetId,
          'comment': comment,
          'position': position
      };

      return this.http.post(url, JSON.stringify(body), {headers: headers})
          .map(response => {
              return response.json();
          });
    }

    updateAsset(lightboxId: number, assetId: number, comment?: string, position?: number): Promise<any> {

        let url = this.path + '/' + lightboxId + '/assets/' + assetId;

        let headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.set('Content-Type', 'application/json');

        let body = {
            'id': assetId,
            'comment': comment,
            'position': position
        };

        return this.http.put(url, JSON.stringify(body), {headers: headers})
            .map(response => {
                return response.json();
            })
            .toPromise();
    }

    deleteAsset(lightboxId: number, assetId: number): Observable<any> {

        let url = this.path + '/' + lightboxId + '/assets/' + assetId;

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.delete(url, {headers: headers})
            .map(response => {
                return response.json();
            });
    }

    downloadPdf(id) {
        let url = this.path + '/' + id + '/pdf?download=true';

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

    downloadZip(id) {
        let url = this.path + '/' + id + '/zip';

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

    sendMail(id, email: string, comment: string) {
        let url = this.path + '/' + id + '/send?email=' + encodeURIComponent( email ) + '&comment=' + encodeURIComponent( comment );

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.post(url, '',{headers: headers})
            .toPromise()
            .then(response => {
                return response.json();
            })
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }



    copyToCart( lightboxId ): Promise<boolean> {
        return this.getLightbox( lightboxId ).toPromise()
            .then( lightbox => {
                let articles: Article[] = [];
                for( let asset of lightbox.assets ) {
                    let article = new Article();
                    article.assetId = String(asset.id);

                    articles.push(article);
                }

                return this.cartDataService.addArticles(articles);
            }
        );
    }

}
