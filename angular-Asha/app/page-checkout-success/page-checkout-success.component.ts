import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {OrderService} from '../order.service';
import {Observable} from 'rxjs/Observable';
import {Order} from '../models/order';
import {Asset} from '../models/asset';
import {Article} from '../models/article';

@Component({
  selector: 'app-page-checkout-success',
  templateUrl: './page-checkout-success.component.html',
  styleUrls: ['./page-checkout-success.component.css']
})
export class PageCheckoutSuccessComponent implements OnInit {

  public orderId: number = null;
  public order: Observable<Order> = Observable.empty();

  public downloadedArticles = {};

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private orderService: OrderService
  ) { }

  ngOnInit() {
    this.route.params.distinctUntilChanged().subscribe( params => {
      this.orderId = +params['orderId'];

      this.loadOrder(this.orderId);
    });
  }

    private loadOrder(orderId: number) {
        if( !(orderId > 0) ) {
          this.order = Observable.empty();
        }

        this.order = this.orderService.getOrder(orderId);
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

    getArticlePrice(article: Article, order: Order) {
        return Number(article.price) + (order.vatPercentage/100 * article.price);
    }

    isModelReleaseAvailable(article: Article) {
        return article.asset && ([2,4,8].indexOf(Number(article.asset.modelReleased)) != -1);
    }

    isPropertyReleaseAvailable(article: Article) {
        return article.asset && ([2,4,8].indexOf(Number(article.asset.propertyReleased)) != -1);
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

    downloadOrderPdf(order: Order) {
        this.orderService.downloadPdf(order.id);
    }

    downloadOrderZip(order: Order) {
        this.orderService.downloadZip(order.id);
    }

    isAssetDownloadable(order: Order, article: Article) {
        return article.asset && (
            (order.type =='final' && !this.isArticleExpired(article))
            || (order.type == 'proposal' && order.proposalDownloadMaxSize != 0)
        );
    }

    downloadAsset(order: Order, article: Article) {
        this.orderService.downloadArticle(order.id, article.id).then(() => {
            this.downloadedArticles[ article.id ] = true;
        });
    }

    isArticleExpired(article: Article) {
        return Date.now() < article.expirationDate.getTime();
    }

    isArticleDownloaded(article: Article) {
        return !!this.downloadedArticles[ article.id ];
    }
}
