import {Component, Input, OnInit} from '@angular/core';
import {OrderService} from '../order.service';
import {Order} from '../models/order';
import {Observable} from 'rxjs/Observable';
import {Router} from '@angular/router';
import {Asset} from '../models/asset';
import {Article} from '../models/article';
import {UserLoginService} from '../user-login.service';
import {CartDataService} from '../cart-data.service';
import {WindowRefService} from '../window-ref.service';
import {OrderDataService} from '../order-data.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {

  public orders: Observable<Array<Order>> = Observable.empty();

  @Input() orderType: string = 'final';

  constructor(
      private orderService: OrderService,
      private router: Router,
      private userLogin: UserLoginService,
      private cartDataService: CartDataService,
      private windowRefService: WindowRefService,
      private orderDataService: OrderDataService
  ) { }

  ngOnInit() {
      this.userLogin.status.distinctUntilChanged().subscribe(userStatus => {
          if( userStatus == 'login') {
              this.loadOrders();
          } else {
              this.orders = Observable.empty();
          }
      });
  }

  loadOrders() {
      this.orders = this.orderService.getOrders({
          type: this.orderType,
          paymentStatus: (this.orderType == 'proposal' ? 'none' : null)
      });
  }

  searchPhotographer(photographerId: number): void {
      this.router.navigate(['/search'], {queryParams: {pgid: photographerId}});
  }

  searchCollection(collectionId: number): void {
      this.router.navigate(['/search'], {queryParams: {coll: collectionId}});
  }

  searchCopyright(copyright: string): void {
      this.router.navigate(['/search'], {queryParams: {cop: copyright}});
  }

  getMediaType(asset: Asset) {
    if( !asset) {
        return '';
    }

    if( asset.fileFormat.substr(0,6) == 'image/') {
      return 'Photograph';
    } else if( asset.fileFormat.substr(0,6) == 'video/') {
      return 'Video';
    } else if( asset.fileFormat.substr(0,6) == 'audio/') {
        return 'Audio';
    }

    return 'Other';
  }

  getArticlePrice(article: Article, order: Order) {
    return Number(article.price) + (order.vatPercentage/100 * article.price);
  }

  getFittingAssetFile(asset: any, requiredHeight: number): any {
     if( !asset) {
         return '/assets/img/image-no-longer-avail.png';
     }

     let assetFile = null;
     for (let tmpFile of asset.associatedMedia) {
       if (tmpFile.fileFormat !== 'image/jpeg' || tmpFile.additionalType.indexOf('watermarked') >= 0 || tmpFile.additionalType == 'original') {
           continue;
       }
       if (!assetFile
           || (tmpFile.height >= requiredHeight && assetFile.height > tmpFile.height)
           || (assetFile.height < requiredHeight && assetFile.height < tmpFile.height)
       ) {
           assetFile = tmpFile;
       }
    }

    return assetFile.contentUrl;
  }

    downloadAsset(order: Order, article: Article) {
        this.orderService.downloadArticle(order.id, article.id);
    }




    calculateSize(article: Article) {
        let width = 0;
        let height = 0;

        if( article.asset ) {
            if (article.maxSize > 0) {
                if (article.maxSizeType == 'sideLength') {
                    if (article.asset.width > article.asset.height) {
                        width = Number(article.maxSize);
                        height = (article.asset.height / article.asset.width) * width;
                    } else {
                        height = Number(article.maxSize);
                        width = (article.asset.width / article.asset.height) * height;
                    }
                } else {
                    let tmpSize = this.getDimensionsFromMegapixel(article, Number(article.maxSize));
                    width = tmpSize.width;
                    height = tmpSize.height;
                }

            } else if (article.asset.width > 0) {
                width = article.asset.width;
                height = article.asset.height;
            }
        }

        return {
            width: Math.round( width ),
            height: Math.round( height )
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
        // 9.83" x 3.00" @ 72 DPI
        let imgSize = this.calculateSize(article);
        if ( !imgSize ) {
            return null;
        }

        let dpi = 300;
        if( article.dpiSize > 0 ) {
            dpi = article.dpiSize;
        }
        return (Math.round(imgSize.width / dpi * 100) / 100) + '" x ' + (Math.round(imgSize.height / dpi * 100) / 100) + '" @ ' + dpi + ' DPI';
    }

    getDimensionsFromMegapixel(article: Article, megapixel: number) {
        let width = 0;
        let height = 0;

        if( article.asset && article.asset.width > 0 ) {
            let pixelCount = megapixel * 1024 * 1024;

            width = Math.round( Math.sqrt( pixelCount * (article.asset.width / article.asset.height) ) );
            height = Math.round( Math.sqrt( pixelCount * (article.asset.height / article.asset.width) ) );
        }

        return {
            width: width,
            height: height
        };
    }

    showAssetDetail(asset: Asset): void {
        if( !asset ) {
            return;
        }

        this.router.navigate([{outlets: {modal: ['detail', asset.id]}}], {queryParamsHandling: 'merge'});
    }

    isArticleExpired(article: Article) {
        return Date.now() < article.expirationDate.getTime();
    }

    articleHasExpirationDate(article: Article) {
        return article.expirationDate.getTime() > 0;
    }

    downloadOrderPdf(order: Order) {
        this.orderService.downloadPdf(order.id);
    }

    moveOrderToCart(order: Order) {
        this.orderDataService.changeOrderToCart(order.id).then( () => {
            this.loadOrders();
        });
    }

    isAssetDownloadable(order: Order, article: Article) {
        return article.asset && (
               (order.type =='final' && !this.isArticleExpired(article))
            || (order.type == 'proposal' && order.proposalDownloadMaxSize != 0)
        );
    }

    isModelReleaseAvailable(article: Article) {
        return article.asset && ([2,4,8].indexOf(Number(article.asset.modelReleased)) != -1);
    }

    isPropertyReleaseAvailable(article: Article) {
        return article.asset && ([2,4,8].indexOf(Number(article.asset.propertyReleased)) != -1);
    }

    moveToCart(order: Order, article: Article) {
        let cart = this.cartDataService.getCart();
        if( !cart || !cart.id ) {
            return;
        }

        this.orderDataService.moveOrderArticleToCart(order.id, article.id, cart.id).then(success => {
            if( !success ) {
                return;
            }

            this.loadOrders();
        });
    }

    deleteArticle(order: Order, article: Article) {
        this.orderService.deleteArticle(order.id, article.id).then(success => {
            if( !success ) {
                return;
            }

            this.loadOrders();
        });
    }

    showTerms() {
        let window = this.windowRefService.nativeWindow;
        if( window && window.open ) {
            window.open('/terms?mode=compact', 'terms', 'width=800,height=700,location=no,menubar=no,toolbar=no,status=no,scrollbars=yes');
        }
    }
}
