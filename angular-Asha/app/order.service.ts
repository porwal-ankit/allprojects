import { Injectable } from '@angular/core';
import {SodaApiService} from './soda-api.service';
import {Headers} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Order} from './models/order';
import {PaymentOption} from './models/payment_option';


@Injectable()
export class OrderService {
    private path = 'orders';

    constructor(
        private http: SodaApiService
    ) { }


    getOrders(options: any = {}): Observable< Order[] > {
        let url = this.path +'?';

        if( options['type'] ) {
            url += '&type=' + encodeURIComponent(options['type']);
        }
        if( options['paymentStatus'] ) {
            url += '&paymentStatus=' + encodeURIComponent(options['paymentStatus']);
        }

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.get(url, {headers: headers})
            .map(response => response.json() as Order[])
            .map(response => {
                response.forEach(order => {
                    if( order && !Array.isArray(order.articles) ) {
                        order.articles = [];
                    }

                    order.createdOn = new Date(order.createdOn);
                    order.modifiedOn = new Date(order.modifiedOn);

                    order.articles.forEach(article => {
                        article.expirationDate = new Date(article.expirationDate);
                    });
                });

                return response;
            });
    }

    getOrder(id): Observable<Order> {
        let url = this.path + '/' + id;

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.get(url, {headers: headers})
            .map(response => response.json() as Order)
            .map(order => {
                if( order && !Array.isArray(order.articles) ) {
                    order.articles = [];
                }

                order.createdOn = new Date(order.createdOn);
                order.modifiedOn = new Date(order.modifiedOn);

                order.articles.forEach(article => {
                    article.expirationDate = new Date(article.expirationDate);
                });

                return order;
            });
    }



    public moveToCart(orderId: number, articleId: number, cartId: number) {
        let url = this.path + '/' + orderId + '/articles/' + articleId + '/move-to-cart?cartId='+ cartId;

        let headers = new Headers();
        headers.set('Accept', 'application/json');
//        headers.set('Content-Type', 'application/json');

        return this.http.post(url, '', {headers: headers})
            .toPromise()
            .then(response => {
                if( response.status != 204 ) {
                    return false;
                }

                return true;
            });
    }

    public deleteArticle(orderId: number, articleId: number) {
        let url = this.path + '/' + orderId + '/articles/' + articleId;

        let headers = new Headers();
        // headers.set('Accept', 'application/json');

        return this.http.delete(url, {headers: headers})
            .toPromise()
            .then(response => {
                if( response.status != 204 ) {
                    return false;
                }

                return true;
            })
            .catch(this.handleError);
    }


    public downloadArticle(orderId: number, articleId: number) {
        let url = this.path + '/' + orderId + '/articles/' + articleId + '/download';

        let headers = new Headers();
        // headers.set('Accept', 'application/json');

        return this.http.get(url, {headers: headers})
            .toPromise()
            .then(response => {
                let data = response.json();
                this.http.download(data.downloadUrl);
            })
            .catch(this.handleError);
    }

    public downloadPdf(orderId: number) {
        let url = this.path + '/' + orderId + '/pdf';

        let headers = new Headers();
        // headers.set('Accept', 'application/json');

        return this.http.get(url, {headers: headers})
            .toPromise()
            .then(response => {
                let data = response.json();
                this.http.download(data.downloadUrl);
            })
            .catch(this.handleError);
    }

    public downloadZip(orderId: number) {
        let url = this.path + '/' + orderId + '/zip';

        let headers = new Headers();
        // headers.set('Accept', 'application/json');

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


    getOptions(orderId: number): Observable< PaymentOption[] > {
        let url = this.path +'/'+ orderId +'/payment/options';

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.get(url, {headers: headers})
            .map(response => response.json() as PaymentOption[]);
    }

    getFormData(orderId: number, paymentType: string) {
        let url = this.path +'/'+ orderId +'/payment/form/'+ encodeURIComponent(paymentType);

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.get(url, {headers: headers})
            .map(response => response.json());
    }



    public changeOrderToCart(orderId: number) {
        let url = this.path + '/' + orderId + '/change-to-cart';

        let headers = new Headers();
        headers.set('Accept', 'application/json');
//        headers.set('Content-Type', 'application/json');

        return this.http.post(url, '', {headers: headers})
            .toPromise();
    }
}
