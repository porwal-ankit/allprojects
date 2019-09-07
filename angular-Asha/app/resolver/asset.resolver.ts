import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Asset} from '../models/asset';
import {AssetService} from '../asset.service';
import {StateTransferService} from '@ngx-universal/state-transfer';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';

@Injectable()
export class AssetResolver implements Resolve<Asset> {
    constructor(
        private assetService: AssetService,
        private stateTransfer: StateTransferService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {}

    resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Promise<Asset> {
        let asset = null;
        if( isPlatformBrowser(this.platformId) ) {
            asset = this.stateTransfer.get('asset');
            if( asset ) {
                return new Promise<Asset>((resolve, reject) => {
                    resolve(asset);
                });
            }
        }

        asset = this.assetService.getAsset(route.params.assetId);
        if( isPlatformServer(this.platformId) ) {
            return asset.then(assetData => {
                this.stateTransfer.set('asset', assetData);
                this.stateTransfer.inject();

                return assetData;
            });
        }

        return asset;
    }
}
