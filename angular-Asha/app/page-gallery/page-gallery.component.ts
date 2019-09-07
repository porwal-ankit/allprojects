import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Lightbox} from '../models/lightbox';
import {FormBuilder} from '@angular/forms';
import {LightboxDataService} from '../lightbox-data.service';
import {LightboxService} from '../lightbox.service';
import {PreferencesService} from '../preferences.service';
import {UserLoginService} from '../user-login.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-page-gallery',
  templateUrl: './page-gallery.component.html',
  styleUrls: ['./page-gallery.component.css']
})
export class PageGalleryComponent implements OnInit {

    public lightboxes: Lightbox[] = [];
    public lightboxForms = {};
    public sortForm;
    private activeLightboxes = [];
    private initialLoad: boolean = true;

    constructor(
        private lightboxDataService: LightboxDataService,
        private lightboxService: LightboxService,
        private preferenceService: PreferencesService,
        private fb: FormBuilder,
        public userLogin: UserLoginService,
        private route: ActivatedRoute,
        private changeDetector: ChangeDetectorRef
      ) { }

    ngOnInit() {

        // this.route.params
        //     .distinctUntilChanged(null, data => data['galleryId'])
        //     .subscribe(() => {
        //         this.loadLightboxes();
        //     });



        this.setSortColumn(this.getSortColumn());

        let galleryId = this.getRouteGalleryId();
        if (galleryId && galleryId.length == 40) {
            this.lightboxService.getLightbox(galleryId).subscribe((result) => {
                this.lightboxes = [ result ];
                this.createLightboxForms();
            });

        } else {

            this.lightboxDataService.getLightboxListObservable().subscribe(lightboxList => {
                this.lightboxes = this.sortLightboxes(lightboxList, this.getSortColumn());
                this.createLightboxForms();

                this.changeDetector.markForCheck();

                if( this.initialLoad ) {
                    this.setGalleryActive( this.lightboxDataService.getSelectedLightboxId(), true);
                    this.initialLoad = false;
                }
            });
        }


        this.sortForm = this.fb.group({
            sort: this.getSortColumn()
        });

        this.sortForm.valueChanges
            .subscribe(data => {
                switch (data.sort) {
                    case 'all':
                        for ( let lightbox of this.lightboxes ) {
                            this.setGalleryActive( lightbox.id, true );
                        }
                        this.resetSortField();
                        break;

                    case 'none':
                        for ( let lightbox of this.lightboxes ) {
                            this.setGalleryActive( lightbox.id, false );
                        }
                        this.resetSortField();
                        break;

                    default:
                        this.setSortColumn(data.sort);
                }
            }
        );

    }

    getRouteGalleryId() {
        return this.route.snapshot.params['galleryId'];
    }

    resetSortField() {
        this.sortForm.patchValue({sort: this.getSortColumn()});
    }

    switchReverseSort() {
        this.setReverseSort( !this.getReverseSort() );
    }

    getReverseSort(): boolean {
        let sortAsc = this.preferenceService.get('lightbox_sort_asc');

        return sortAsc === null ? true : !!sortAsc;
    }

    setReverseSort(sortAsc: boolean) {
        this.preferenceService.set('lightbox_sort_asc', sortAsc);
        this.lightboxes = this.sortLightboxes(this.lightboxes, this.getSortColumn());
    }

    createLightboxForms() {
        this.lightboxForms = {};

        for ( let lightbox of this.lightboxes ) {
            if( this.lightboxForms[ lightbox.id ] ) {
                continue;
            }

            this.lightboxForms[ lightbox.id ] = {
                'action': '',
                'errorMessage': null,
                'forms': {
                    'action': this.fb.group({
                        action: ''
                    }),

                    'comment': this.fb.group({
                        comment: ''
                    }),

                    'send': this.fb.group({
                        email: '',
                        comment: ''
                    }),

                    'rename': this.fb.group({
                        name: ''
                    }),
                    'projectName': this.fb.group({
                        projectName: ''
                    }),
                }
            };


            this.lightboxForms[ lightbox.id ].forms.action.valueChanges
                .subscribe(data => {
                    this.resetErrorMessage( lightbox.id );
console.log(data.action);
                    if (data.action == 'comment') {
                        this.lightboxForms[ lightbox.id ].forms.comment.setValue({
                            'comment': lightbox.comment
                        });
                        this.lightboxForms[ lightbox.id ].action = 'comment';

                    } else if (data.action == 'rename') {
                        this.lightboxForms[ lightbox.id ].forms.rename.setValue({
                            'name': lightbox.name
                        });
                        this.lightboxForms[ lightbox.id ].action = 'rename';

                    } else if (data.action == 'delete') {
                        this.lightboxForms[ lightbox.id ].action = 'delete';

                    } else if (data.action == 'pdf') {
                        this.lightboxForms[ lightbox.id ].action = 'pdf';
                        this.downloadPdf( lightbox.id );

                    } else if (data.action == 'zip') {
                        this.lightboxForms[ lightbox.id ].action = 'zip';
                        this.downloadZip( lightbox.id );

                    } else if (data.action == 'duplicate') {
                        this.lightboxForms[ lightbox.id ].action = 'duplicate';
                        this.duplicate( lightbox.id );

                    } else if (data.action == 'cart') {
                        this.lightboxForms[ lightbox.id ].action = 'cart';
                        this.copyToCart( lightbox.id );

                    } else if (data.action == 'send') {
                        this.lightboxForms[ lightbox.id ].forms.send.setValue({
                            'email': '',
                            'comment': ''
                        });
                        this.lightboxForms[ lightbox.id ].action = 'send';

                    }else if (data.action == 'create') {

                        this.lightboxForms[ lightbox.id ].forms.projectName.setValue({
                            'projectName': ''
                        });
                        this.lightboxForms[ lightbox.id ].action = 'create';

                    } else {
                        this.lightboxForms[ lightbox.id ].action = '';
                    }

                });
        }
    }

    downloadPdf( lightboxId ) {
        this.lightboxService.downloadPdf( lightboxId ).then( () => {
            this.cancelAction(lightboxId);
        });
    }

    downloadZip( lightboxId ) {
        this.lightboxService.downloadZip( lightboxId ).then( () => {
            this.cancelAction(lightboxId);
        });
    }

    duplicate( lightboxId ) {
        this.lightboxService.getLightbox( lightboxId ).subscribe( data => {
            let lightbox = this.cleanLightboxForDuplicate( data );
console.log('lightboxdata',lightbox)
            this.lightboxDataService.createLightbox(lightbox).then(() => {
                this.cancelAction( lightboxId );
            });
        });
    }

    copyToCart( lightboxId ) {
        this.lightboxService.copyToCart(lightboxId).then(() => {
            this.cancelAction(lightboxId);
        });
    }

    cleanLightboxForDuplicate( lightbox: Lightbox ): Lightbox {
        lightbox.id = null;
        lightbox.creationDate = null;
        lightbox.modificationDate = null;
        lightbox.name = lightbox.name + ' - Duplicate';

        if ( lightbox.assets && lightbox.assets.length > 0 ) {
            let newAssets = [];
            for ( let asset of lightbox.assets ) {
                asset.asset = null;
                asset.creationTime = null;
                asset.modificationTime = null;
                newAssets.push( asset );
            }
            lightbox.assets = newAssets;
        }

        return lightbox;
    }


    resetErrorMessage( lightboxId ) {
        this.setErrorMessage( lightboxId, null );
    }

    setErrorMessage( lightboxId, message ) {
        this.lightboxForms[ lightboxId ].errorMessage = message;
    }

    sortLightboxes(lightboxes: Lightbox[], sortBy) {
        let sortAsc = this.getReverseSort();
        let galleryId = this.getRouteGalleryId();

        lightboxes.sort(function (a, b) {

            if( galleryId > 0 ) {
                if( a.id == galleryId ) {
                    return -1;
                } else if( b.id == galleryId ) {
                    return 1;
                }
            }

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

        return lightboxes;
    }

    isValidSort(sort) {
        return ['name','modificationDate','creationDate','assets'].indexOf(sort) > -1;
    }

    getSortColumn(): string {
        let sort = this.preferenceService.get('lightbox_sort');

        return this.isValidSort(sort) ? sort : 'modificationDate';
    }

    setSortColumn(column: string) {
        if( !this.isValidSort(column) ) {
            return;
        }

        this.preferenceService.set('lightbox_sort', column);
        this.lightboxes = this.sortLightboxes(this.lightboxes, this.getSortColumn());
    }

    getAssets(lightboxId: number) {
        let assets = [];
        let lightbox = this.getLightboxData( lightboxId );
        if ( !lightbox || !lightbox.assets || !lightbox.assets.length ) {
            return assets;
        }

        for ( let lightboxAsset of lightbox.assets ) {
            if( lightboxAsset && lightboxAsset.asset) {
                assets.push(lightboxAsset.asset);
            }
        }

        return assets;
    }

    isGalleryActive( lightboxId ) {
        return !!this.activeLightboxes[ lightboxId ];
    }

    setGalleryActive( lightboxId, status ) {
        this.activeLightboxes[ lightboxId ] = !!status;
    }

    switchGalleryActive( lightboxId ) {
        this.setGalleryActive(lightboxId, !this.isGalleryActive( lightboxId ) );
    }

    saveSorting(lightboxId: number, assetData: any) {
        this.lightboxDataService.updateAsset( lightboxId, assetData['assetId'], null, assetData['to'] + 1 ).then(
            () => {}
        );
    }

    cancelAction( lightboxId ) {
        this.lightboxForms[ lightboxId ].action = '';
        this.lightboxForms[ lightboxId ].forms.action.patchValue({action: ''});
    }

    getLightboxData( lightboxId ) {
        for ( let lightbox of this.lightboxes ) {
            if ( lightbox.id == lightboxId ) {
                return lightbox;
            }
        }

        return null;
    }

    setLightboxData( lightboxId, data ) {
        let pos = this.getLightboxPos( lightboxId );
        if ( pos < 0 ) {
            return false;
        }

        this.lightboxes[pos] = data;

        return true;
    }

    getLightboxPos( lightboxId ): number {
        for ( let pos in this.lightboxes ) {
            if ( this.lightboxes[pos].id == lightboxId ) {
                return Number(pos);
            }
        }

        return -1;
    }

    deleteLightbox( lightboxId ) {
        this.lightboxDataService.deleteLightbox( lightboxId )
            .then( () => {
                let pos = this.getLightboxPos( lightboxId );
                if ( pos < 0 ) {
                    return false;
                }

                this.lightboxes.splice(pos, 1);
                // this.createLightboxForms();
            } );
    }

    updateComment( lightboxId ) {
        let lightbox = this.getLightboxData( lightboxId );
        let formData = this.lightboxForms[ lightboxId ].forms.comment.getRawValue();

        formData.id = lightbox.id;
        formData.name = lightbox.name;

        this.lightboxDataService.updateLightbox( formData ).then(
            data => {
                this.setLightboxData( data.id, data );
                this.cancelAction( lightboxId );
            },
            data => {
                if ( data.status == 409 ) {
                    this.setErrorMessage( lightboxId, 'A gallery with that name already exists.');
                }
            }
        );
    }

    CreateProject(lightboxId){
        let lightbox = this.getLightboxData( lightboxId );
         
        let formData = this.lightboxForms[ lightboxId ].forms.projectName.getRawValue();
        formData.name = formData.projectName;
        
        this.lightboxDataService.createLightbox(formData).then(() => {
                this.cancelAction( lightboxId );
            });
    }

    renameLightbox( lightboxId ) {
        let lightbox = this.getLightboxData( lightboxId );
        let formData = this.lightboxForms[ lightboxId ].forms.rename.getRawValue();

        formData.id = lightbox.id;
        formData.comment = lightbox.comment;

        this.lightboxDataService.updateLightbox( formData ).then(
            data => {
                this.setLightboxData( data.id, data );
                this.cancelAction( lightboxId );
            },
            data => {
                if ( data.status == 409 ) {
                    this.setErrorMessage( lightboxId, 'A gallery with that name already exists.');
                }
            }
        );
    }

    sendMail( lightboxId ) {
        let formData = this.lightboxForms[ lightboxId ].forms.send.getRawValue();

        this.lightboxService.sendMail( lightboxId, formData.email, formData.comment ).then(
            () => {
                this.cancelAction( lightboxId );
            },
            data => {
                this.setErrorMessage( lightboxId, 'Could not send mail');
            }
        );
    }

    isEmpty(lightbox): boolean {
        return (!lightbox || !lightbox.assets || !lightbox.assets.length);
    }
}
