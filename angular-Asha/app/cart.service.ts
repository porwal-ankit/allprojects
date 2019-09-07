import { Injectable } from '@angular/core';
import {SodaApiService} from './soda-api.service';
import {Observable} from 'rxjs/Observable';
import {Cart} from './models/cart';
import {Headers} from '@angular/http';
import {Article} from 'app/models/article';
import {Order} from './models/order';

@Injectable()
export class CartService {

    private path = 'carts';

    constructor(
        private http: SodaApiService
    ) { }


    getCarts(options: any = {}): Observable< Cart[] > {
        let url = this.path;

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.get(url, {headers: headers})
            .map(response => response.json());
    }

    getCart(id): Observable<Cart> {
        let url = this.path + '/' + id;

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.get(url, {headers: headers})
            .map(response => response.json())
            .map(cart => {
                if( cart && !Array.isArray(cart.articles) ) {
                    cart.articles = [];
                }
                return cart;
            });
        // .map(response => {
        //     let lightbox = response.json();
        //     lightbox.creationDate = new Date(lightbox.creationDate);
        //     lightbox.modificationDate = new Date(lightbox.modificationDate);
        //
        //     return lightbox;
        // });
    }

    addCart( data ) {
        let url = this.path;

        let headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.set('Content-Type', 'application/json');

        return this.http.post(url, data, {headers: headers})
            .map(response => response.json());
            // .map(response => {
            //     let cart = response.json();
            //     lightbox.creationDate = new Date(lightbox.creationDate);
            //     lightbox.modificationDate = new Date(lightbox.modificationDate);
            //
            //     return lightbox;
            // });
    }

    updateCart( id, data ) {
        let url = this.path + '/' + id;

        let headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.set('Content-Type', 'application/json');

        return this.http.patch(url, data, {headers: headers})
            .map(response => response.json());
            // .map(response => {
            //     let lightbox = response.json();
            //     lightbox.creationDate = new Date(lightbox.creationDate);
            //     lightbox.modificationDate = new Date(lightbox.modificationDate);
            //
            //     return lightbox;
            // });
    }

    deleteCart( id ) {
        let url = this.path + '/' + id;

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.delete(url, {headers: headers})
            .map(response => response.json());
    }


    getArticles(cartId: number): Observable< Cart[] > {
        let url = this.path + '/' + cartId + '/articles';

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.get(url, {headers: headers})
            .map(response => response.json());
    }

    getArticle(cartId: number, articleId: number): Observable<any> {
        let url = this.path + '/' + cartId + '/articles/' + articleId;

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.get(url, {headers: headers})
            .map(response => response.json());
        // .map(response => {
        //     let lightbox = response.json();
        //     lightbox.creationDate = new Date(lightbox.creationDate);
        //     lightbox.modificationDate = new Date(lightbox.modificationDate);
        //
        //     return lightbox;
        // });
    }

    addArticle(cartId: number, assetId: string, calculatorOptions?): Observable<any> {
        let url = this.path + '/' + cartId + '/articles';


        let headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.set('Content-Type', 'application/json');

        let body = {
            'assetId': assetId,
            'calculatorArguments': calculatorOptions
        };

        return this.http.post(url, JSON.stringify(body), {headers: headers})
            .map(response => response.json());
    }

    updateArticle(cartId: number, articleId: number, article: Article): Observable<any> {
        let url = this.path + '/' + cartId + '/articles/' + articleId;

        let headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.set('Content-Type', 'application/json');

        return this.http.patch(url, JSON.stringify(article), {headers: headers})
            .map(response => response.json());
    }

    deleteArticle(cartId: number, articleId: number): Observable<any> {
        let url = this.path + '/' + cartId + '/articles/' + articleId;

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.delete(url, {headers: headers})
            .map(response => response.json());
    }

    checkoutCart(cartId: number, articleIdList: number[]): Observable<Order> {
        let url = this.path + '/' + cartId +'/checkout';

        if( articleIdList.length > 0 ) {
            url += '?article_ids='+ encodeURIComponent( articleIdList.join(',') );
        }

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.post(url, {headers: headers})
            .map(response => response.json());
    }
}
