import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {PreferencesService} from 'app/preferences.service';
import {LightboxService} from './lightbox.service';
import {Lightbox} from './models/lightbox';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {LightboxAsset} from './models/lightbox_asset';
import {UserDataService} from './user-data.service';
import {UserLoginService} from './user-login.service';


@Injectable()
export class LightboxDataService {

    private lightboxesSubject: BehaviorSubject<{}> = new BehaviorSubject( this.getEmptyLightboxes() );
    private lightboxes: Observable<{}> = this.lightboxesSubject.asObservable();

    private defaultInitInProgress: boolean = false;

    constructor(
        private preferenceService: PreferencesService,
        private lightboxService: LightboxService,
        private userDataService: UserDataService,
        private userLogin: UserLoginService
    ) {

        this.userDataService.user.subscribe((user) => {
            if (user && user.id) {
                this.load();
            } else {
                this.setLightboxes(this.getEmptyLightboxes());
            }
        });
    }

    getEmptyLightboxes() {
        return {
            list: [],
            data: {},
            selectedId: null
        };
    }

    getSelectedLightboxObservable(): Observable<Lightbox> {
        return this.lightboxes
            .switchMap( lightboxes => {
                let lightboxId = this.getSelectedLightboxIdFromData( lightboxes );
                if( !(lightboxId > 0) ) {
                    Observable.empty();
                }

                if( lightboxes['selectedId'] != lightboxId ) {
                    this.setSelectedLightboxId(lightboxId);
                }

                return this.getLightboxObservable(lightboxId);
            })
            .distinctUntilChanged(null, x => JSON.stringify(x));
    }

    getLightboxObservable(lightboxId: number): Observable<Lightbox> {
        return this.lightboxes
            .map( lightboxes => {
                let lightbox = lightboxes['data'][ lightboxId ];
                if( !lightbox ) {
                    return null;
                }

                return lightbox;
            })
            .distinctUntilChanged(null, x => JSON.stringify(x));
    }

    getLightboxListObservable(): Observable<Lightbox[]> {
        return this.lightboxes
            .map( lightboxes => {
                let lightboxList = [];

                for( let lightboxId of lightboxes['list'] ) {
                    if( lightboxes['data'][ lightboxId ] ) {
                        lightboxList.push( lightboxes['data'][ lightboxId ] );
                    }
                }

                return lightboxList;
            })
            .distinctUntilChanged(null, x => JSON.stringify(x));
    }

    load() {
        this.lightboxService.getLightboxes().subscribe(
            result => {
                let newLightboxes = this.getEmptyLightboxes();

                if( result.result && Array.isArray(result.result) ) {
                    for (let lightbox of result.result) {
                        newLightboxes.data[ Number(lightbox.id) ] = lightbox;
                        newLightboxes.list.push( lightbox.id );
                    }
                }

                newLightboxes.selectedId = this.getSelectedLightboxIdFromData(newLightboxes);

                this.setLightboxes( newLightboxes );
            },
            () => {
                console.error('Could not load lightboxes');
            }
        );
    }

    private setLightboxes(lightboxes) {
        if( this.userLogin.isLoggedIn() && (!lightboxes || !lightboxes.list || !lightboxes.list.length) ) {
            if( !this.defaultInitInProgress ) {
                this.defaultInitInProgress = true;

                let lightbox = new Lightbox();
                lightbox.name = 'My First Gallery';
                this.createLightbox( lightbox );
            }

            return;
        }

        this.lightboxesSubject.next( lightboxes );
    }

    private getLightboxes() {
        return this.lightboxesSubject.value;
    }

    setLightbox( lightbox: Lightbox ) {
        if( !(lightbox.id > 0 )) {
            return;
        }

        let lightboxId = Number(lightbox.id);
        let lightboxes = this.getLightboxes();
        lightboxes['data'][ lightboxId ] = lightbox;

        if( lightboxes['list'].indexOf(lightboxId) == -1 ) {
            lightboxes['list'].unshift(lightboxId);
        }

        this.setLightboxes(lightboxes);
    }

    removeLightbox( lightboxId: number ) {
        if( !(lightboxId > 0 )) {
            return;
        }

        let lightboxes = this.getLightboxes();
        lightboxes[ lightboxId ] = null;

        let pos = lightboxes['list'].indexOf(lightboxId);
        if( pos != -1 ) {
            lightboxes['list'].splice(pos, 1);
        }

        if( this.getSelectedLightboxId() == lightboxId ) {
            this.setSelectedLightboxId( lightboxes['list'][0] );
        }

        this.setLightboxes(lightboxes);
    }


    getLightbox( lightboxId: number ): Lightbox {
        return this.getLightboxes()['data'][ lightboxId ];
    }

    getAssets( lightboxId: number ): LightboxAsset[] {
        let lightbox = this.getLightbox(lightboxId);
        if( !lightbox ) {
            return [];
        }

        let assets = lightbox.assets;

        if ( !(assets instanceof Array) ) {
            assets = [];
        }

        return assets;
    }

    setAssets( lightboxId: number, assets: LightboxAsset[] ) {
        if ( !assets ) {
            assets = [];
        }

        let lightbox = this.getLightbox(lightboxId);
        lightbox.assets = assets;
        lightbox.modificationDate = new Date();

        this.setLightbox( lightbox );
    }

    addAsset(assetId, comment) {
        if ( !this.userLogin.isLoggedIn() ) {
            this.userLogin.login().skip(1).take(1).subscribe(data => {
                if ( data != 'login') {
                    return;
                }

                this.userDataService.user.takeWhile( user => {
                    if ( !user || !(user.id > 0)) {
                        return true;
                    }

                    this.addAsset(assetId, comment);

                    return false;
                }).subscribe();
            });

            return;
        }

        let lightboxId = this.getSelectedLightboxId();
        if ( !lightboxId ) {
            return null;
        }

        return this.lightboxService.addAsset(lightboxId, assetId, '').map(
            data => {
                let assets = this.getAssets(lightboxId);
                assets.unshift(data);
                this.setAssets(lightboxId, assets);

                return data;
            }
        ).toPromise();
    }

    deleteAsset(lightboxId: number, assetId) {
        if( !(lightboxId > 0) ) {
            lightboxId = this.getSelectedLightboxId();
            if (!lightboxId) {
                return null;
            }
        }

        return this.lightboxService.deleteAsset(lightboxId, assetId)
            .toPromise()
            .then( () => {
                let assets = this.getAssets(lightboxId);

                let newAssets = [];
                for (let asset of assets) {
                    if (asset.id != assetId) {
                        newAssets.push(asset);
                    }
                }

                this.setAssets(lightboxId, newAssets);
            });
    }

    updateAsset(lightboxId: number, assetId: number, comment?: string, position?: number): Promise<any> {
        return this.lightboxService.updateAsset(lightboxId, assetId, comment, position)
            .then(data => {
                let assets = this.getAssets(lightboxId);

                let newAssets = [];
                let updateAsset = null;
                for( let asset of assets ) {
                    if( asset.id == assetId ) {
                        updateAsset = asset;
                    } else {
                        newAssets.push(asset);
                    }
                }

                if( updateAsset ) {
                    newAssets.splice(position-1, 0, updateAsset);
                }

                this.setAssets(lightboxId, newAssets);

                return data;
            });
    }

    setSelectedLightboxId(lightboxId: number) {
        let currentLightboxId = this.getSelectedLightboxId();
        if ( currentLightboxId == lightboxId ) {
            return true;
        }

        let lightboxes = this.getLightboxes();
        if( !lightboxes['data'][ lightboxId ] ) {
            return false;
        }

        lightboxes['selectedId'] = lightboxId;
        this.preferenceService.set('lightbox_id', lightboxId );
        this.setLightboxes(lightboxes);

        return true;
    }

    getSelectedLightboxId(): number {
        let lightboxes = this.getLightboxes();
        return this.getSelectedLightboxIdFromData( lightboxes );
    }

    private getSelectedLightboxIdFromData(lightboxes): number {
        let lightboxId = Number(lightboxes['selectedId']);
        if( lightboxId > 0 ) {
            return lightboxId;
        }

        lightboxId = Number( this.preferenceService.get('lightbox_id') );
        if( lightboxId > 0 ) {
            return lightboxId;
        }

        if( lightboxes['list'] && Array.isArray(lightboxes['list']) && lightboxes['list'].length > 0 ) {
            lightboxId = Number( lightboxes['list'][0] );
            if( lightboxes['data'] && lightboxes['data'][ lightboxId ] ) {
                return lightboxId;
            }
        }

        return null;
    }

    updateLightbox(lightbox: Lightbox) {
        lightbox['creationDate'] = null;
        lightbox['modificationDate'] = null;

        return this.lightboxService.updateLightbox(lightbox.id, lightbox).map(
            data => {
                this.setLightbox(data);
                return data;
            }
        ).toPromise();
    }

    createLightbox(lightbox: Lightbox) {
        return this.lightboxService.createLightbox(lightbox).map(
            data => {
                this.setLightbox(data);
                this.setSelectedLightboxId( data.id );
                this.defaultInitInProgress = false;
                return data;
            }
        ).toPromise();
    }

    deleteLightbox(lightboxId: number) {
        return this.lightboxService.deleteLightbox(lightboxId)
            .toPromise()
            .then( () => {
                this.removeLightbox(lightboxId);
            } );
    }

    isAssetInLightbox(lightboxId: number, assetId): boolean {
        let assets = this.getAssets(lightboxId);
        for( let asset of assets ) {
            if( asset.id == assetId ) {
                return true;
            }
        }

        return false;
    }

}
