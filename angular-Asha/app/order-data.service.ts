import { Injectable } from '@angular/core';
import {OrderService} from './order.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Order} from './models/order';
import {Observable} from 'rxjs/Observable';
import {CartDataService} from './cart-data.service';
import {UserDataService} from './user-data.service';

@Injectable()
export class OrderDataService {

    private _order: BehaviorSubject<Order> = new BehaviorSubject( null );
    public order: Observable<Order> = this._order.asObservable().distinctUntilChanged(null, x => JSON.stringify(x));

    constructor(
      private orderService: OrderService,
      private cartDataService: CartDataService,
      private userDataService: UserDataService
    ) { }

    public loadOrder() {
        if(!this.userDataService.isLoaded()) {
          this.setOrder(null);
          return;
        }

        this.orderService.getOrders({
          type: 'proposal',
          paymentStatus: 'requested'
        }).subscribe( orders => {
          if( !Array.isArray(orders) || !orders.length ) {
              this.setOrder(null);
              return;
          }

          this.setOrder( orders.shift() );
        });
    }

    getOrder(): Order {
        return this._order.getValue();
    }

    private setOrder(order: Order) {
        this._order.next(order);
    }

    changeOrderToCart(orderId?: number) {
        if( !orderId ) {
            let order = this.getOrder();
            if (!order || !order.id) {
                return;
            }

            orderId = order.id;
        }

        return this.orderService.changeOrderToCart(orderId).then( data => {
            this.loadOrder();
            this.cartDataService.loadCart();
        });
    }

    moveOrderArticleToCart(orderId: number, articleId: number, cartId: number) {
        return this.orderService.moveToCart(orderId, articleId, cartId).then(response => {
            if( response ) {
                this.loadOrder();
                this.cartDataService.loadCart();
            }

            return response;
        });
    }



}
