import {
    AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, DoCheck, ElementRef, EventEmitter, HostListener,
    Inject, Input, Output, ViewChild
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {AssetDetailComponent} from '../asset-detail/asset-detail.component';
import {Asset} from '../models/asset';
import {WindowRefService} from '../window-ref.service';
import {DragulaService} from 'ng2-dragula';

@Component({
    selector: 'app-asset-list',
    templateUrl: './asset-list.component.html',
    styleUrls: ['./asset-list.component.css']
})
export class AssetListComponent implements AfterViewChecked, DoCheck, AfterViewInit {

    @Input('lightboxId')
    set setDragulaId(id: number) {
        this.dragulaId = 'lb_bag_' + String(id);
        this.lightboxId = id;
    }

    @Input() sortable: boolean = false;

    @Output() orderChange = new EventEmitter<any>();

    @Input('assets')
    set setInputAssets(assets: Asset[]) {
        this.setAssets(assets);
    }

    public assets: any = [];
    public lightboxId: number = null;
    private previousAssetPositions = {};
    private assetsTmp: any = [];
    private defaultHeight: number = 150;
    private showDetailId: number;
    private showDetailAsset: any;
    private detailLoaded: number = null;
    private defaultMarginWidth = 10;
    private currentHostWidth = 0;
    public dragulaId: string = '';

    public dragulaOptions = {
        direction: 'horizontal'
    };

    @ViewChild('assetDetailContainer') assetDetailContainer: AssetDetailComponent;

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.checkHostSizeChange();
    }

    constructor(
                private hostElement: ElementRef,
                private changeDetectorRef: ChangeDetectorRef,
                @Inject(DOCUMENT) private document: any,
                private window: WindowRefService,
                private dragulaService: DragulaService
    ) {
        dragulaService.drop.subscribe((value) => {
            if ( value[0] != this.dragulaId ) {
                return;
            }

            let element = value[4];
            let newPos = null;
            let target = value[2];
            let assetId = value[1].dataset['assetid'];

            if( !element ) {
                newPos = target.children.length - 1;
            } else {
                for( let i=0; i<target.children.length; i++ ) {
                    if( target.children[i].dataset['assetid'] == element.dataset['assetid'] ) {
                        newPos = i - 1;
                        break;
                    }
                }
            }

            let oldPos = this.previousAssetPositions[ assetId ];
            this.previousAssetPositions = this.getPositionList(this.assets);

            this.orderChange.emit({
                assetId: assetId,
                from: oldPos,
                to: newPos
            });
        });
    }


    ngAfterViewInit(): void {
        setTimeout(() => {
            this.checkHostSizeChange();
        }, 1);
    }

    public reset() {
        this.showDetailId = null;
        this.showDetailAsset = null;
        this.detailLoaded = null;
        this.assets = [];
        this.assetsTmp = [];
    }

    private getPositionList( assetList: any[]) {
        let list = {};
        let i = 0;
        for ( let asset of assetList ) {
            list[ asset.id ] = i;
            i++;
        }

        return list;
    }

    public setAssets(assets) {
        if( !Array.isArray(assets) ) {
            assets = [];
        }

        if ( JSON.stringify(assets) == JSON.stringify(this.assets) ) {
            return;
        }

        this.assets = assets;
        this.previousAssetPositions = this.getPositionList(assets);

        this.refreshSize();
    }

    public addAssets(assets) {
        this.setAssets( this.assets.concat(assets) );
    }

    public getBoundingClientRect(): ClientRect {
        if( !this.hostElement.nativeElement.getBoundingClientRect ) {
            let rect = {
                bottom: 0,
                height: 0,
                left: 0,
                right: 0,
                top: 0,
                width: 0,
            };

            return rect as ClientRect;
        }
        return this.hostElement.nativeElement.getBoundingClientRect();
    }




    public refreshSize() {
        if ( !this.assets || !this.assets.length ) {
            return;
        }

        let combinedWidth = 0;
        let assetRow = [];
        this.assetsTmp = [];

        for (let asset of this.assets) {
            if (!asset.sizeFactor) {
                asset.sizeFactor = asset.width / asset.height;
            }

            let newWidth = this.defaultHeight * asset.sizeFactor;

            if (combinedWidth + newWidth + this.defaultMarginWidth > this.currentHostWidth) {

                this.addAssetsTmp(assetRow, combinedWidth);

                combinedWidth = 0;
                assetRow = [];
            }

            combinedWidth += newWidth;
            assetRow.push(asset);
        }

        if (assetRow.length > 0) {
            for (let asset2 of assetRow) {
                asset2.displayHeight = this.defaultHeight + 'px';
                asset2.displayWidth = (this.defaultHeight * asset2.sizeFactor) / this.currentHostWidth * 100 + '%';
                this.assetsTmp.push(asset2);
            }
        }

        this.assets = this.assetsTmp;

        this.changeDetectorRef.detectChanges();
    }

    private addAssetsTmp(assetRow: any, combinedWidth: number): void {
        let newHeight = this.defaultHeight * (this.currentHostWidth / combinedWidth);

        for (let asset2 of assetRow) {
            asset2.displayHeight = Math.floor(newHeight) + 'px';
            asset2.displayWidth = (newHeight * asset2.sizeFactor) / this.currentHostWidth * 100 + '%';
            asset2.marginWidth = this.defaultMarginWidth + 'px';
            this.assetsTmp.push(asset2);
        }
    }





    showAssetDetail(event: any): void {
        this.showDetailId = event.id;
        this.showDetailAsset = event.asset;
    }

    closeAssetDetail(event: any): void {
        this.scrollToAsset( this.showDetailId );
        this.showDetailId = null;
    }

    ngDoCheck() {
        this.checkHostSizeChange();
    }

    checkHostSizeChange() {
        if( !(typeof window !== 'undefined' && window.document) ) {
            return;
        }

        let style = getComputedStyle(this.hostElement.nativeElement);
        let paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);

        let rect = this.getBoundingClientRect();
        let newWidth = rect.width - paddingX;

        if ( this.currentHostWidth == newWidth ) {
            return;
        }

        this.currentHostWidth = newWidth;

        this.refreshSize();
    }

    ngAfterViewChecked() {
        if ( this.assetDetailContainer && this.detailLoaded !== this.showDetailId ) {
            this.detailLoaded = this.showDetailId;

        } else if ( !this.assetDetailContainer && this.detailLoaded ) {
            this.detailLoaded = null;
        }
    }

    previousAsset(event: any): void {
        let previousAsset = null;
        for ( let asset of this.assets ) {
            if (asset.id == this.showDetailId ) {
                if ( !previousAsset ) {
                    return;
                }

                this.showDetailAsset = previousAsset;
                this.showDetailId = previousAsset.id;

                return;
            }

            previousAsset = asset;
        }

    }

    nextAsset(event: any): void {
        let assetMatched = false;
        for ( let asset of this.assets ) {
            if ( assetMatched ) {
                this.showDetailAsset = asset;
                this.showDetailId = asset.id;

                return;
            } else if (asset.id == this.showDetailId ) {
                assetMatched = true;
            }
        }

    }

    scrollToAsset( assetId ) {
        let assetThumb = this.hostElement.nativeElement.querySelector('[data-assetid="' + assetId + '"]');

        if( !assetThumb.getBoundingClientRect ) {
            return;
        }

        let elementTop = assetThumb.getBoundingClientRect().top;
        elementTop += (this.window.nativeWindow.pageYOffset !== undefined) ? this.window.nativeWindow.pageYOffset : (this.document.documentElement || this.document.body).scrollTop;
        elementTop -= 55;

        if ( this.document.scrollingElement ) {
            this.document.scrollingElement.scrollTop = elementTop;
        } else {
            this.window.nativeWindow.scrollTo(0, elementTop );
        }
    }
}
