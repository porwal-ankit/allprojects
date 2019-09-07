import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {Cart} from './models/cart';
import {PreferencesService} from './preferences.service';
import {CartService} from './cart.service';
import {UserDataService} from './user-data.service';
import {Article} from './models/article';
import {UserLoginService} from './user-login.service';

@Injectable()
export class CartDataService {

    private _cart: BehaviorSubject<Cart> = new BehaviorSubject( null );
    public cart: Observable<Cart> = this._cart.asObservable().distinctUntilChanged(null, x => JSON.stringify(x));

    constructor(
        private preferenceService: PreferencesService,
        private cartService: CartService,
        private userDataService: UserDataService,
        private userLogin: UserLoginService
    ) {

        this.preferenceService.observe('cart_id').distinctUntilChanged().subscribe(cartId => {
            if( cartId > 0 ) {
                this.cartService.getCart(cartId).subscribe(
                    cart => {
                        this.setCart(cart);
                    },
                    () => {
                        this.loadCart();
                    }
                );

            } else if(this.userDataService.isLoaded()) {
                this.loadCart();

            } else  {
                this.setCart(null);
            }
        });
    }

    public loadCart() {
        if(!this.userDataService.isLoaded()) {
            this.setCart(null);
            return;
        }

        this.cartService.getCarts().subscribe( carts => {
            if( Array.isArray(carts) && carts.length ) {
                this.setCart( carts.shift() );
                return;
            }

            // Create new cart
            this.cartService.addCart({}).subscribe(cart => {
                this.setCart(cart);
            });
        });
    }

    private loadSingleCart() {
        let cartId = Number( this.preferenceService.get('cart_id') );

        if( !(cartId > 0) ) {
            cartId = this.getLoadedCartId();
        }

        if( !(cartId > 0 ) ) {
            return this.loadCart();
        }

        this.cartService.getCart(cartId).subscribe( loadedCart => {
            this.setCart( loadedCart );
        });
    }

    private setCart(cart: Cart) {
        let cartId = (cart && cart.id) ? cart.id : 0;

        if( cart && !Array.isArray(cart.articles) ) {
            cart.articles = [];
        }

        this._cart.next(cart);
        this.setCartId(cartId);
    }

    private setCartId(cartId: number) {
        cartId = (cartId > 0) ? cartId : 0;

        this.preferenceService.set('cart_id', cartId);
    }

    private getLoadedCartId() {
        let cart = this.getCart();
        if( !cart || !cart.id ) {
            return null;
        }

        return cart.id;
    }

    getCart(): Cart {
        return this._cart.getValue();
    }

    addArticle(assetId: string, calculatorOptions?) {
        if ( !this.userDataService.isLoaded() ) {
            this.userLogin.login().skip(1).take(1).subscribe(data => {
                if ( data != 'login') {
                    return;
                }

                this.cart.takeWhile( cart => {
                    if ( !cart || !(cart.id > 0)) {
                        return true;
                    }

                    this.addArticle(assetId, calculatorOptions);

                    return false;
                }).subscribe();
            });

            return;
        }


        let cartId = this.getLoadedCartId();

        return this.cartService.addArticle( cartId, assetId, calculatorOptions ).toPromise()
            .then( article => {
                this.loadSingleCart();
            });
    }

    addArticles(articles: Article[]): Promise<any> {
        let cartId = this.getLoadedCartId();

        return this.cartService.getCart(cartId).toPromise()
            .then( cart => {
                cart.articles.push(...articles);

                return this.cartService.updateCart(cartId, cart).toPromise()
                    .then(updatedCart => {
                        this.setCart(updatedCart);
                    });
            }
        );
    }

    setArticles(articles: Article[]): Promise<any> {
        let cartId = this.getLoadedCartId();

        return this.cartService.getCart(cartId).toPromise()
            .then( cart => {
                    cart.articles = articles;

                    return this.cartService.updateCart(cartId, cart).toPromise()
                        .then(updatedCart => {
                            this.setCart(updatedCart);
                        });
                }
            );
    }

    updateArticle(article: Article) {
        let cartId = this.getLoadedCartId();

        return this.cartService.updateArticle( cartId, article.id, article ).toPromise()
            .then( newArticle => {
                this.loadSingleCart();
            });
    }

    removeArticle(articleId: number) {
        let cartId = this.getLoadedCartId();

        return this.cartService.deleteArticle( cartId, articleId ).toPromise()
            .then( article => {
                this.loadSingleCart();
            });
    }

    isAssetInCart(assetId: string) {
      let cart = this.getCart();
      if( !cart || !cart.articles || !cart.articles.length ) {
          return false;
      }

      for( let article of cart.articles ) {
          if( article.assetId == assetId ) {
              return true;
          }
      }

      return false;
    }

    checkout( articleIdList: number[] ) {
        let cartId = this.getLoadedCartId();

        return this.cartService.checkoutCart(cartId, articleIdList).toPromise().then(
            data => {
                this.loadCart();

                return data;
            }
        );
    }

}
