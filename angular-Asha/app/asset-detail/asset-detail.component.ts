import {
    Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnInit, Output
} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import 'rxjs/add/operator/switchMap';
import {AssetService} from '../asset.service';
import {LightboxDataService} from '../lightbox-data.service';
import {DOCUMENT} from '@angular/common';

import {Asset} from '../models/asset';
import {Article} from '../models/article';
import {CartDataService} from '../cart-data.service';
import {AssociatedMedia} from '../models/associated_media';
import {WindowRefService} from '../window-ref.service';
import {LocationRefService} from '../location-ref.service';
import {Meta, Title} from '@angular/platform-browser';

@Component({
    selector: 'app-asset-detail',
    templateUrl: './asset-detail.component.html',
    styleUrls: ['./asset-detail.component.css']
})
export class AssetDetailComponent implements OnInit {
    @Input() assetId: any;

    @Input('asset')
    set setAssetInput(asset: Asset) {
        this.setAsset(asset);
    }

    public asset: Asset = null;

    @Input('article')
    set setArticle(value: Article) {
        if( !value ) {
            return;
        }

        this.article = value;
        this.setAsset(value.asset);
    }

    @Input() showPrevious: any = false;
    @Input() showNext: any = false;
    @Input() scrollToTop: boolean = true;
    @Input() lightboxId: number = null;

    @Output() close = new EventEmitter<any>();
    @Output() previous = new EventEmitter<any>();
    @Output() next = new EventEmitter<any>();

    public article: Article;
    public similarAssets: any[] = [];
    public showAllKeywords: boolean = false;

    public showShareMenu: boolean = false;
    public showSupportMenu: boolean = false;

    @HostListener('window:keyup', ['$event']) windowKeyUp(event) {
        if ( event.code === 'ArrowLeft') {
            this.goToPrevious();
        } else if ( event.code === 'ArrowRight') {
            this.goToNext();
        } else if ( event.code === 'Escape') {
            this.clickClose();
        }
    }

    @HostListener('window:click', ['$event']) windowClick(event) {
        if( !this.showShareMenu && !this.showSupportMenu ) {
            return;
        }

        let toggle = {
            support: true,
            share: true
        };

        let obj = event.target;
        while( obj ) {
            if(obj.id == 'shareButtonDiv') {
                toggle['share'] = false;
                break;
            } else if(obj.id == 'supportButtonDiv') {
                toggle['support'] = false;
                break;
            }

            obj = obj.parentNode ? obj.parentNode : null;
        }

        if( toggle['share'] ) {
            this.toggleShareMenu(false);
        }
        if( toggle['support'] ) {
            this.toggleSupportMenu(false);
        }

    }

    constructor(
        private assetService: AssetService,
        private route: ActivatedRoute,
        public element: ElementRef,
        private router: Router,
        private lightboxDataService: LightboxDataService,
        private cartDataService: CartDataService,
        @Inject(DOCUMENT) private document: any,
        private window: WindowRefService,
        private location: LocationRefService,
        private titleService: Title,
        private metaService: Meta
    ) {
    }

    ngOnInit() {
        if ( this.asset ) {
            // nothing

        } else if (this.assetId) {
            this.assetService.getAsset(this.assetId).then(asset => {
                this.setAsset(asset);
            });
        } else {
            this.route.params
                .switchMap((params: Params) => this.assetService.getAsset(+params['id']))
                .subscribe(asset => this.setAsset(asset));
        }
    }

    setAsset(asset: Asset) {
        this.asset = asset;
        this.setMetadata();
        this.loadSimilarAssets();
        this.scrollToDetail();
    }

    loadSimilarAssets(): void {
        this.assetService.getSimilarAssets(this.assetId, {}).then(assets => {
            this.similarAssets = assets.assets;
        });
    }

    clickClose(): void {
        this.close.emit({
            id: this.asset.id
        });
    }

    addToCart() {
        this.cartDataService.addArticle(String(this.asset.id));
    }

    isInCart(): boolean {
        return this.cartDataService.isAssetInCart(String(this.asset.id));
    }

    alert(message: string): void {
        console.log('ALERT: ' + message);
    }

    sendMail(mailToContent: string): void {
        this.location.nativeLocation.href = 'mailto:' + mailToContent;
    }

    getImageSrc(type: string): string {
        let image = this.getImageOfType(type);
        if( !image ) {
            return null;
        }

        return image.contentUrl;
    }

    getImageOfType(type: string): AssociatedMedia {
        for (let assetFile of this.asset.associatedMedia) {
            if (assetFile.additionalType === type) {
                return assetFile;
            }
        }

        return null;
    }

    searchKeyword(keyword: string): void {
        this.router.navigate(['/search'], {queryParams: {q: keyword}});
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

    showSimilarAssetDetail(event: any): void {
        // this.similarAssets = [];
        this.assetId = event.id;
        this.asset = event.asset;
        // this.loadSimilarAssets();
    }

    goToPrevious() {
        this.previous.emit({
            id: this.asset.id
        });
    }

    goToNext() {
        this.next.emit({
            id: this.asset.id
        });
    }

    downloadPreview() {
        this.assetService.download( this.asset.id, 'layout');
    }

    getLightboxId(): number {
        return (this.lightboxId > 0) ? this.lightboxId : this.lightboxDataService.getSelectedLightboxId();
    }

    addToLightbox() {
        this.lightboxDataService.addAsset(this.asset.id, '');
    }

    isInLightbox(): boolean {
        let lightboxId = this.getLightboxId();
        return this.lightboxDataService.isAssetInLightbox(lightboxId, this.asset.id);
    }

    deleteFromLightbox() {
        let lightboxId = this.getLightboxId();
        this.lightboxDataService.deleteAsset(lightboxId, this.asset.id);
    }

    scrollToDetail() {
        if ( !this.scrollToTop || !this.element.nativeElement.getBoundingClientRect ) {
            return;
        }
        let elementTop = this.element.nativeElement.getBoundingClientRect().top;
        elementTop += (this.window.nativeWindow.pageYOffset !== undefined) ? this.window.nativeWindow.pageYOffset : (this.document.documentElement || this.document.body).scrollTop;
        elementTop -= 50;

        if ( this.document.scrollingElement ) {
            this.document.scrollingElement.scrollTop = elementTop;
        } else {
            this.window.nativeWindow.scrollTo(0, elementTop );
        }
    }

    isMac() {
        if( !this.window.nativeWindow.navigator || !this.window.nativeWindow.navigator.userAgent ) {
            return false;
        }
        return ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K', 'iPhone', 'iPad', 'iPod'].reduce( (acc, val) => acc || (this.window.nativeWindow.navigator.userAgent.indexOf(val) != -1), false );
    }


    calculateSize() {
        return {
            width: this.asset.width,
            height: this.asset.height
        };

    }

    calculateRawFileSize(): string {
        let imgSize = this.calculateSize( );
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

    calculateMegapixel(): string {
        let imgSize = this.calculateSize();
        if ( !imgSize ) {
            return null;
        }

        return (Math.round((imgSize.width * imgSize.height) / (1024 * 1024) * 10) / 10) + ' MP';
    }

    calculatePrintSize(): string {
        // 9.83" x 3.00" @ 72 DPI
        let imgSize = this.calculateSize();
        if ( !imgSize ) {
            return null;
        }

        let dpi = 300;
        return (Math.round(imgSize.width / dpi * 100) / 100) + '" x ' + (Math.round(imgSize.height / dpi * 100) / 100) + '" @ ' + dpi + ' DPI';
    }


    calculateOptionalSize() {
        if( !this.asset || !(this.asset.optionalFilesize) ) {
            return null;
        }

        let imgSize = this.calculateSize( );
        if ( !imgSize ) {
            return null;
        }

        let rawSize = imgSize.width * imgSize.height;
        if( rawSize * 1.1 < this.asset.optionalFilesize ) {
            return null;
        }

        let pixelCount = this.asset.optionalFilesize * 1024 * 1024;

        let hFactor = imgSize.width / imgSize.height;
        let vFactor = imgSize.height / imgSize.width;

        let newWidth = Math.sqrt( pixelCount * hFactor );
        let newHeight = Math.sqrt( pixelCount * vFactor );

        return {
            width: Math.round(newWidth),
            height: Math.round(newHeight)
        };

    }

    getOptionalSize() {
        if( !this.asset || !(this.asset.optionalFilesize) ) {
            return 0;
        }

        let imgSize = this.calculateSize( );
        if ( imgSize ) {
            let rawSize = imgSize.width * imgSize.height;
            if( rawSize * 1.1 < this.asset.optionalFilesize ) {
                return 0;
            }
        }

        return this.asset.optionalFilesize * 3;
    }

    getOptionalDimensions() {
        let size = this.calculateOptionalSize();
        if( !this.asset || !(this.asset.optionalFilesize) ) {
            return '0 x 0';
        }

        return size.width +' x '+ size.height;
    }

    getOptionalMegapixel(): string {
        if( !this.asset || !(this.asset.optionalFilesize) ) {
            return '0';
        }

        return (Math.round(this.asset.optionalFilesize * 10) / 10) + ' MP';
    }

    getOptionalPrintSize(): string {
        // 9.83" x 3.00" @ 72 DPI
        let imgSize = this.calculateOptionalSize();
        if ( !imgSize ) {
            return null;
        }

        let dpi = 300;
        return (Math.round(imgSize.width / dpi * 100) / 100) + '" x ' + (Math.round(imgSize.height / dpi * 100) / 100) + '" @ ' + dpi + ' DPI';
    }

    requestOptionalFilesize() {
        let address = 'research@imagepoint.biz';
        let subject = 'Request image size';
        let message = 'Image Id: '+ this.asset.name +'\n' +
                      'Tell us the size you think you need. We’ll get back to you with a quote. And it always helps to provide the formula you used to determine the file size. That way we can confirm you’re getting exactly what you need. If you want help figuring out the right size, we’ll be glad to assist. Please include your phone number if you’d like us to call you.';
        this.location.nativeLocation.href = 'mailto:'+ encodeURIComponent(address) +'?subject='+ encodeURIComponent(subject) +'&body='+ encodeURIComponent(message);
    }

    isModelReleaseAvailable() {
        return [2,4,8].indexOf(Number(this.asset.modelReleased)) != -1;
    }

    isPropertyReleaseAvailable() {
        return [2,4,8].indexOf(Number(this.asset.propertyReleased)) != -1;
    }

    removeFileExtension(value: string): string {
        let pos = value.lastIndexOf('.');
        if ( pos !== -1 ) {
            value = value.substr(0, pos);
        }
        return value;
    }

    private setMetadata() {
        if( !this.asset ) {
            return;
        }

        this.titleService.setTitle('PanoramicImagePoint - ' + this.removeFileExtension( this.asset.name ) );

        let metaTags = [
            {name: 'og:url', content: this.getBaseUrl() + '/asset/' + this.asset.id},
            {name: 'og:type', content: 'website'},
            {name: 'og:site_name', content: 'ImagePoint'},
            {name: 'og:locale', content: 'en_US'},
            {name: 'twitter:card', content: 'summary_large_image'},
            {name: 'twitter:site', content: '@ImagePoint'},
            {name: 'description', content: 'How to use Angular 4 meta service'},
        ];

        // Image
        let image = this.getImageOfType('preview_watermarked');
        if(!image) {
            image = this.getImageOfType('preview');
        }
        if( image ) {
            metaTags.push({name: 'og:image', content: image.contentUrl});
            metaTags.push({name: 'twitter:image', content: image.contentUrl});


            if( image.width > 0 && image.height > 0 ) {
                metaTags.push({name: 'og:image:width', content: String(image.width)});
                metaTags.push({name: 'og:image:height', content: String(image.height)});
            }
        }

        // Description
        let description = null;
        if( this.asset.caption ) {
            description = this.asset.caption;
        } else if( this.asset.headline ) {
            description = this.asset.headline;
        }

        // Title
        let title = null;
        if( this.asset.headline ) {
            title = this.asset.headline;
        } else if( this.asset.caption ) {
            title = this.asset.caption;
            description = '';
        } else if( this.asset.objectName ) {
            title = this.asset.objectName;
            description = '';
        }

        if( title ) {
            metaTags.push({name: 'og:title', content: title});
            metaTags.push({name: 'twitter:title', content: title});
        }

        if( description ) {
            metaTags.push({name: 'og:description', content: description});
            metaTags.push({name: 'twitter:description', content: description});
        }

        // Author
        let author = null;
        if( this.asset.copyright ) {
            author = this.asset.copyright;
        } else if( this.asset.supplier && this.asset.supplier.copyright ) {
            author = this.asset.supplier.copyright;
        } else if( this.asset.copyrightHolder ) {
            author = this.asset.copyrightHolder;
        }

        if( author ) {
            metaTags.push({name: 'author', content: this.asset.copyright});
        }

        // Remove possible old meta tags
        for( let tag of metaTags ) {
            this.metaService.removeTag('name="'+ tag.name +'"');
        }

        // Add new meta tags
        this.metaService.addTags(metaTags);

    }

    getBaseUrl(): string {
        return this.location.nativeLocation.protocol +'//'+ this.location.nativeLocation.host;
    }

    toggleShareMenu(status) {
        if( typeof status != 'boolean') {
            status = !this.showShareMenu;
        }

        this.showShareMenu = status;
    }

    toggleSupportMenu(status) {
        if( typeof status != 'boolean') {
            status = !this.showSupportMenu;
        }

        this.showSupportMenu = status;
    }

    getAssetUrl() {
        return 'https://www.imagepoint.sodatech.com/asset/' + this.asset.id;
    }

    afterCopy() {
        alert('The image\'s URL has been copied to the clipboard.');
        this.toggleShareMenu(false);
    }

    showRfVersusRm() {
        this.router.navigate([{outlets: {modal: 'rmrf'}}], {queryParamsHandling: 'merge'});
        this.toggleSupportMenu(false);
    }

    getPreviewImgDimensions() {
        if( !this.asset || !this.asset.height ) {
            return {
                width: 0,
                height: 0
            };
        }

        let width = this.asset.width;
        let height = this.asset.height;

        while( width > 1500 || height > 500 ) {
            if( width > 1500 ) {
                let factor = (height / width);
                width = 1500;
                height = width * factor;
            }
            if( height > 500 ) {
                let factor = (width / height);
                height = 500;
                width = height * factor;
            }
        }

        return {
            width: Math.round(width),
            height: Math.round(height)
        };
    }
}
