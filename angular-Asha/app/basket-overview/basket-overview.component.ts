import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {PreferencesService} from '../preferences.service';
import {Cart} from '../models/cart';
import {CartDataService} from '../cart-data.service';
import {Article} from '../models/article';
import {CartService} from '../cart.service';
import {UserLoginService} from '../user-login.service';
import {Router} from '@angular/router';
import {WindowRefService} from '../window-ref.service';
import {OrderService} from '../order.service';
import {Order} from '../models/order';
import {OrderDataService} from '../order-data.service';

@Component({
  selector: 'app-basket-overview',
  templateUrl: './basket-overview.component.html',
  styleUrls: ['./basket-overview.component.css']
})
export class BasketOverviewComponent implements OnInit {

    public sortForm: FormGroup;
    public articleForm: FormGroup = new FormGroup({});

    public cart: Cart = null;

    public detailArticle: Article = null;
    public paymentOrder: Order = null;

    @Output() checkout = new EventEmitter<any>();

    constructor(
        private fb: FormBuilder,
        private preferenceService: PreferencesService,
        private cartDataService: CartDataService,
        private cartService: CartService,
        private router: Router,
        private userLogin: UserLoginService,
        private windowRefService: WindowRefService,
        private orderService: OrderService,
        private orderDataService: OrderDataService
    ) {
        this.orderDataService.loadOrder();

        this.orderDataService.order.subscribe( order => {
            this.paymentOrder = order;
        });
    }

    ngOnInit() {
        this.articleForm.addControl('acceptAgb', new FormControl(false));


        // this.articleForm.valueChanges.subscribe(data => {
        //     this.changeDetectorRef.detectChanges();
        // });

        this.cartDataService.cart.subscribe( cart => {
            // if( cart && cart.articles && Array.isArray(cart.articles) ) {
            //     cart.articles = this.sortArticles(cart.articles, this.getSortColumn());
            // }

            for( let controlName in this.articleForm.controls ) {
                if( controlName.substr(0,8) != 'article_' ) {
                    continue;
                }

                let articleId = Number(controlName.substr(8));
                if( !cart || !cart.articles.find(value => value.id == articleId) ) {
                    this.articleForm.removeControl(controlName);
                }
            }

            if( cart && cart.articles.length > 0 ) {
                for (let article of cart.articles) {
                    let controlName = 'article_' + article.id;
                    if (!this.articleForm.contains(controlName)) {
                        this.articleForm.addControl(controlName, new FormControl(true));
                    }
                }
            }


            this.cart = cart;
        });

        this.sortForm = this.fb.group({
            sort: this.getSortColumn()
        });

        this.sortForm.valueChanges
            .subscribe(data => {
                    this.setSortColumn(data.sort);
                }
            );
    }

    getSortColumn(): string {
        let sort = this.preferenceService.get('cart_article_sort');

        return this.isValidSort(sort) ? sort : 'dateAdded';
    }

    setSortColumn(column: string) {

        if( !this.isValidSort(column) ) {
            return;
        }

        this.preferenceService.set('cart_article_sort', column);
        // if( this.cart && this.cart.articles && Array.isArray(this.cart.articles) ) {
        //     this.cart.articles = this.sortArticles(this.cart.articles, this.getSortColumn());
        // }
    }

    resetSortField() {
        this.sortForm.patchValue({sort: this.getSortColumn()});
    }

    isValidSort(sort) {
        return ['dateAdded'].indexOf(sort) > -1;
    }

    getReverseSort(): boolean {
        let sortAsc = this.preferenceService.get('cart_article_sort_asc');

        return sortAsc === null ? true : !!sortAsc;
    }

    sortArticles(articles: Article[], sortBy) {
        let sortAsc = this.getReverseSort();

        articles.sort(function (a, b) {
            let valA;
            let valB;

            if ( sortAsc ) {
                valA = a[sortBy];
                valB = b[sortBy];
            } else {
                valA = b[sortBy];
                valB = a[sortBy];
            }

            if (valA && valA.getTime) {
                valA = valA.getTime();
                valB = valB.getTime();

                return valB - valA;

            } else if (Array.isArray(valA) && Array.isArray(valB)) {
                return valA.length - valB.length;
            }

            valA = valA && valA.toUpperCase ? valA.toUpperCase() : '';
            valB = valB && valB.toUpperCase ? valB.toUpperCase() : '';

            if (valA < valB) {
                return -1;
            }
            if (valA > valB) {
                return 1;
            }

            return 0;
        });

        return articles;
    }

    getThumbnailUrl( article: Article ) {
        if( !article || !article.asset || !article.asset.id || !article.asset.associatedMedia || !Array.isArray(article.asset.associatedMedia) ) {
            return '';
        }

        for( let media of article.asset.associatedMedia ) {
            if( media.additionalType == 'preview') {  // 'preview'
                return media.contentUrl;
            }
        }

        return '';
    }

    removeArticle( article: Article ) {
        this.cartDataService.removeArticle(article.id);
    }

    modifyArticle( article: Article ) {
        if( !article || !article.asset || !(article.asset.id > 0) ) {
            return;
        }

        this.detailArticle = article;
    }

    closeArticleDetail() {
        this.detailArticle = null;
    }

    duplicateArticle( article: Article ) {
        this.cartDataService.addArticle(article.assetId, article.calculatorArguments);
    }

    switchReverseSort() {
        this.setReverseSort( !this.getReverseSort() );
    }

    setReverseSort(sortAsc: boolean) {
        this.preferenceService.set('cart_article_sort_asc', sortAsc);
        // this.cart.articles = this.sortArticles(this.cart.articles, this.getSortColumn());
    }


    calculateSize(article: Article) {
        let width = article.asset.width;
        let height = article.asset.height;

        if( article.maxSize > 0 ) {
            if( article.maxSizeType == 'megaPixel' ) {

                let factor = width / height;
                height = Math.sqrt( (article.maxSize * 1024*1024) / factor );
                width = height * factor;

            } else {
                if( width > height ) {
                    let factor = height / width;
                    width = article.maxSize;
                    height = width * factor;
                } else {
                    let factor = width / height;
                    height = article.maxSize;
                    width = height * factor;
                }
            }
        }

        if( width > article.asset.width || height > article.asset.height ) {
            width = article.asset.width;
            height = article.asset.height;
        }

        return {
            width: Math.round(width),
            height: Math.round(height)
        };

    }

    calculateRawFileSize(article: Article): string {
        let imgSize = this.calculateSize(article);
        if ( !imgSize ) {
            return null;
        }

        let rawSize = imgSize.width * imgSize.height * 3;

        if ( rawSize < 1024 ) {
            return rawSize + ' B';
        } else if ( rawSize < 1024 * 1024 ) {
            return Math.round(rawSize / 1024) + ' KB';
        } else {
            return Math.round(rawSize / 1024 / 1024 * 10) / 10 + ' MB';
        }
    }

    calculateMegapixel(article: Article): string {
        let imgSize = this.calculateSize(article);
        if ( !imgSize ) {
            return null;
        }

        return (Math.round((imgSize.width * imgSize.height) / (1024 * 1024) * 10) / 10) + ' MP';
    }

    calculatePrintSize(article: Article): string {
        let imgSize = this.calculateSize(article);
        if ( !imgSize ) {
            return null;
        }

        let dpi = article.dpiSize > 0 ? article.dpiSize : 300;
        return (Math.round(imgSize.width / dpi * 100) / 100) + '" x ' + (Math.round(imgSize.height / dpi * 100) / 100) + '" @ ' + dpi + ' DPI';
    }

    attentionItems() {
        if( !this.cart || !this.cart.articles ) {
            return false;
        }

        for( let controlName in this.articleForm.controls ) {
            if( controlName.substr(0,8) != 'article_' || !this.articleForm.controls[controlName].value) {
                continue;
            }

            let articleId = Number(controlName.substr(8));
            let article = this.cart.articles.find(value => value.id == articleId);
            if( article && !(article.price > 0) ) {
                return true;
            }
        }

        return false;
    }

    articlesSelected() {
        let data = this.articleForm.getRawValue();

        let count = 0;
        for( let controlName in data ) {
            if( controlName.substr(0,8) != 'article_' || !data[controlName]) {
                continue;
            }

            count++;
        }

        return count;
    }

    totalArticles() {
        if( !this.cart || !this.cart.articles ) {
            return 0;
        }

        return this.cart.articles.length;
    }

    getTotalPrice() {
        if( !this.cart || !this.cart.articles ) {
            return 0;
        }

        let totalPrice = this.cart.totalPrice;

        let data = this.articleForm.getRawValue();

        for (let article of this.cart.articles) {
            let controlName = 'article_' + article.id;
            if (!data[controlName]) {
                totalPrice -= Number(article.price) * (1 + this.cart.vatPercentage/100);
            }
        }

        return totalPrice;
    }

    isCheckoutActive() {
        if( this.attentionItems() ) {
            return false;
        }

        if( !(this.articlesSelected() > 0)) {
            return false;
        }

        if( !this.articleForm.controls['acceptAgb'].value ) {
            return false;
        }

        return true;
    }

    doCheckout() {
        if( !this.isCheckoutActive() ) {
            return;
        }

        this.cartDataService.checkout( this.getSelectedArticleIds() ).then( () => {
            this.router.navigate(['/cart/checkout']);
        });
    }

    cancelPaymentProcess() {
        this.orderDataService.changeOrderToCart();
    }

    getSelectedArticleIds() {
        let articleIdList = [];

        let data = this.articleForm.getRawValue();
        for (let article of this.cart.articles) {
            if (data['article_' + article.id]) {
                articleIdList.push(article.id);
            }
        }

        return articleIdList;
    }

    isArticleUnselected() {
        let data = this.articleForm.getRawValue();
        for (let article of this.cart.articles) {
            if (!data['article_' + article.id]) {
                return true;
            }
        }
        return false;
    }

    isModelReleaseAvailable(article: Article) {
        return article.asset && ([2,4,8].indexOf(Number(article.asset.modelReleased)) != -1);
    }

    isPropertyReleaseAvailable(article: Article) {
        return article.asset && ([2,4,8].indexOf(Number(article.asset.propertyReleased)) != -1);
    }

    showTerms() {
        let window = this.windowRefService.nativeWindow;
        if( window && window.open ) {
            window.open('/terms?mode=compact', 'terms', 'width=800,height=700,location=no,menubar=no,toolbar=no,status=no,scrollbars=yes');
        }
    }

    isArticleRestricted(article: Article) {
        if( !article.asset.categories.length ) {
            return false;
        }

        for( let category of article.asset.categories ) {
            if( category.id == 1 ) {
                return true;
            }
        }

        return false;
    }
}
