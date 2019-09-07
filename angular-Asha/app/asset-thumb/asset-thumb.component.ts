import {Component, ElementRef, EventEmitter, HostBinding, Input, OnChanges, OnInit, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {LightboxDataService} from '../lightbox-data.service';
import {LightboxBarComponent} from '../lightbox-bar/lightbox-bar.component';
import {CartDataService} from '../cart-data.service';

@Component({
    providers:[LightboxBarComponent],
    selector: 'app-asset-thumb',
    templateUrl: './asset-thumb.component.html',
    styleUrls: ['./asset-thumb.component.css']
})
export class AssetThumbComponent implements OnInit, OnChanges {
    @Input() asset: any = {};
    @Input() width: any = 'auto';
    @Input() height: any = '100px';
    @Input() marginWidth: any = '0px';
    @Input() lightboxId: number = null;
    @Output() detail = new EventEmitter<any>();

    public backgroundImage: string = '';
    private currentImgHeight: number = 0;
    public thumbWidth = 0;
    public thumbHeight = 0;

    @HostBinding('style.width') styleWidth: any = '100px';
    @HostBinding('style.height') styleHeight: any = '100px';

    constructor(
        private hostElement: ElementRef,
        private sanitizer: DomSanitizer,
        private lightboxDataService: LightboxDataService,
        private LightboxBarComponent: LightboxBarComponent,
        private cartDataService: CartDataService
    ) {
    }

    ngOnInit() {
    }


    ngOnChanges(changes: any) {
        if (changes.asset && changes.asset.currentValue) {
            let asset = changes.asset.currentValue;
            let requiredHeight = parseInt(this.height, 10);

            let assetFile = this.getFittingAssetFile(asset, requiredHeight);

            this.backgroundImage = 'url(' + assetFile.contentUrl + ')';
        }

        if ((changes.width && changes.width.currentValue) || (changes.height && changes.height.currentValue)) {
            let newWidth = changes.width ? changes.width.currentValue : this.styleWidth;
            let newHeight = changes.height ? changes.height.currentValue : this.styleHeight;

            this.setNewSize(newWidth, newHeight);
        }
    }

    setNewSize(width: any, height: any): void {
        if (width === 'auto') {
            let factor = parseInt(this.asset.width, 10) / parseInt(this.asset.height, 10);
            width = factor * parseInt(height, 10);
            width += 'px';

        } else if (height === 'auto') {
            let factor = parseInt(this.asset.height, 10) / parseInt(this.asset.width, 10);
            height = factor * parseInt(width, 10);
            height += 'px';
        }

        let marginWidth = this.marginWidth ? this.marginWidth : '0px';

        this.styleWidth = this.sanitizer.bypassSecurityTrustStyle('calc( ' + width + ' - ' + marginWidth + ' )');
        this.styleHeight = this.sanitizer.bypassSecurityTrustStyle(height);

        let assetFile = this.getFittingAssetFile(this.asset, parseInt(height, 10));

        if ( assetFile.height > this.currentImgHeight ) {
            this.currentImgHeight = assetFile.height;
            this.backgroundImage = 'url(' + assetFile.contentUrl + ')';
        }

        this.setThumbWidthInfo();
    }


    getFittingAssetFile(asset: any, requiredHeight: number): any {
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

        return assetFile;
    }

    showImageDetail(): void {
        this.detail.emit({
            id: this.asset.id,
            element: this.hostElement,
            asset: this.asset
        });
    }

    getCopyright(): string {
        if (this.asset.supplier && this.asset.supplier.copyright) {
            return this.asset.supplier.copyright;
        }

        return 'ImagePoint';
    }

    addToLightbox(event) {
        event.stopPropagation();
        console.log('ocean aya',this.asset.id)
        this.LightboxBarComponent.changeClickVisibility();

        this.LightboxBarComponent.getAssetId(this.asset.id);

        document.getElementById('ocean').classList.add("mystyle");
        var dateSpan = document.createElement('span')
            dateSpan.innerHTML = 'Please Select a Project to add';

            document.getElementById("ocean").appendChild(dateSpan);

         let lightboxId = this.lightboxDataService.getSelectedLightboxId();
        console.log('lightbox id',lightboxId)
        // this.lightboxDataService.addAsset(this.asset.id, '');
    }


    addToCart(event) {
        event.stopPropagation();

        this.cartDataService.addArticle(this.asset.id);
    }

    isInLightbox(): boolean {
        let lightboxId = this.getLightboxId();
        return this.lightboxDataService.isAssetInLightbox(lightboxId, this.asset.id);
    }

    isInCart(): boolean {
        return this.cartDataService.isAssetInCart(this.asset.id);
    }

    deleteFromLightbox(event) {
        event.stopPropagation();

        let lightboxId = this.getLightboxId();
        this.lightboxDataService.deleteAsset(lightboxId, this.asset.id);
    }

    getLightboxId(): number {
        return (this.lightboxId > 0) ? this.lightboxId : this.lightboxDataService.getSelectedLightboxId();
    }

    setThumbWidthInfo() {
        window.setTimeout(() => {
            if( this.hostElement.nativeElement && this.hostElement.nativeElement.offsetWidth ) {
                this.thumbWidth = Number(this.hostElement.nativeElement.offsetWidth);
                this.thumbHeight = Number(this.hostElement.nativeElement.offsetHeight);
            }
        }, 50);
    }
}
