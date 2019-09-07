import {Component, Input, OnInit} from '@angular/core';
import {Lightbox} from '../models/lightbox';
import {PreferencesService} from 'app/preferences.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {UserLoginService} from '../user-login.service';
import {LightboxDataService} from '../lightbox-data.service';
import {LightboxService} from '../lightbox.service';
import {Router, NavigationEnd} from '@angular/router';

@Component({

    selector: 'app-lightbox-bar',
    templateUrl: './lightbox-bar.component.html',
    styleUrls: ['./lightbox-bar.component.css']
})
export class LightboxBarComponent implements OnInit {
    @Input() lightboxId: number = null;

    public lightboxes: Lightbox[] = [];
    public lightbox: Lightbox;
    public asset_id: any;
    public form: FormGroup;
    public formCreate: FormGroup;
    public formSend: FormGroup;
    public formRename: FormGroup;

    public action: string = '';
    public errorMessage: string = null;

    public sortColumn: string;
    public visible: boolean = false;
    public showLightboxBar: boolean = true;
    public tabOpen: boolean = true;

    constructor(
        private lightboxDataService: LightboxDataService,
        private lightboxService: LightboxService,
        private preferenceService: PreferencesService,
        private fb: FormBuilder,
        public userLogin: UserLoginService,
        private router: Router,
    ) {
        this.createForm();
    }

    ngOnInit() {
        this.preferenceService.observe('lb_visible').subscribe( isVisible => {
            this.visible = !!isVisible;
        });

        this.lightboxDataService.getLightboxListObservable().subscribe(lightboxList => {
            this.lightboxes = this.sortLightboxes(lightboxList, this.getSortColumn());
            if( this.lightbox && this.lightbox.id > 0 ) {
                this.setSelectedLightbox( this.lightbox.id );
            }
        });

        this.lightboxDataService.getSelectedLightboxObservable().subscribe(changedLightbox => {
            this.lightbox = changedLightbox;

            let lightboxId = (changedLightbox && changedLightbox['id'] > 0) ? changedLightbox['id'] : '';
            this.setSelectedLightbox( lightboxId );
        });

        this.router.events.subscribe(event => {
            if ( event instanceof NavigationEnd ) {
                this.showLightboxBar = ( this.router.url.substr(0, 8) != '/gallery' );
            }
        });
    }

    setSelectedLightbox(lightboxId) {
        this.form.patchValue({lightboxSelection: String(lightboxId)}, {emitEvent: false});
    }

    getAssetId(assetId){

        this.asset_id = assetId;
        localStorage.setItem('assetid',this.asset_id);
        console.log('get',this.asset_id)

    }
    lightboxChanged(){
        // console.log('lightboxchangesd')
        let lightboxId = this.lightboxDataService.getSelectedLightboxId();
        // console.log('lightbox id',lightboxId)
        // console.log('change',localStorage.getItem('assetid'));
        let assetId = localStorage.getItem('assetid');
        localStorage.setItem('assetid','');
        this.lightboxDataService.addAsset(assetId, '');
         document.getElementById('ocean').classList.remove("mystyle");


    }


    createForm() {
        console.log('oceancreate')
        this.form = this.fb.group({
            lightboxSelection: '',
            action: ''
        });

        this.form.valueChanges
            .subscribe(data => {
                if (!this.lightbox || data.lightboxSelection != this.lightbox.id) {
                    console.log('oceancreatelightbox')
                    if (data.lightboxSelection.substr(0, 5) == 'sort_') {
                        this.setSortColumn(data.lightboxSelection.substr(5));

                        if (this.lightbox && this.lightbox.id) {
                            this.form.patchValue({lightboxSelection: this.lightbox.id});
                        }

                    } else {
                        this.lightboxDataService.setSelectedLightboxId( data.lightboxSelection );

                        data.action = '';
                        this.resetAction();
                    }
                }

                this.resetErrorMessage();

                if ( data.action == 'create' ) {
                    this.action = 'edit';
                    this.formCreate.setValue({
                        'name': '',
                        'comment': ''
                    });

                } else if ( data.action == 'rename' ) {
                    this.formRename.setValue({
                        'name': this.lightbox.name
                    });
                    this.action = 'rename';

                } else if ( data.action == 'edit' ) {
                    this.router.navigate(['/gallery', this.lightbox.id]);
                    this.resetAction();

                } else if ( data.action == 'delete' ) {
                    this.action = 'delete';

                } else if ( data.action == 'pdf' ) {
                    this.action = 'pdf';
                    this.downloadPdf();

                } else if ( data.action == 'zip' ) {
                    this.action = 'zip';
                    this.downloadZip();

                } else if ( data.action == 'duplicate' ) {
                    this.duplicate();

                } else if ( data.action == 'cart' ) {
                    this.copyToCart();

                } else if ( data.action == 'send' ) {
                    this.action = 'send';
                    this.formSend.setValue({
                        'email': '',
                        'comment': ''
                    });

                } else {
                    this.action = '';
                }

            });



        this.formCreate = this.fb.group({
            name: '',
            comment: ''
        });

        this.formSend = this.fb.group({
            email: '',
            comment: ''
        });

        this.formRename = this.fb.group({
            name: ''
        });



    }

    resetAction() {
        this.action = '';
        this.form.patchValue({action: ''}, {emitEvent: false});
    }

    sortLightboxes(lightboxes: Lightbox[], sortBy) {

        lightboxes.sort(function (a, b) {
            let valA = a[sortBy];
            let valB = b[sortBy];

            if (valA && valA.getTime) {
                valA = valA.getTime();
                valB = valB.getTime();

                return valB - valA;
            }

            valA = valA.toUpperCase();
            valB = valB.toUpperCase();

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
        let sort = this.preferenceService.get('lightbox_bar_sort');

        return this.isValidSort(sort) ? sort : 'name';
    }

    setSortColumn(column: string) {
        if( !this.isValidSort(column) ) {
            return;
        }

        this.preferenceService.set('lightbox_bar_sort', column);
        this.lightboxes = this.sortLightboxes(this.lightboxes, this.getSortColumn());
        this.sortColumn = column;
    }

    changeVisibility() {
        console.log('ocean change')
        this.visible = !this.visible;
        this.preferenceService.set('lb_visible', this.visible);

        if ( !this.visible ) {
            this.tabOpen = false;
            window.setTimeout(() => this.tabOpen = true, 3000);
        }
    }

    changeClickVisibility(){
        this.visible = true;
        this.preferenceService.set('lb_visible', this.visible);

        if ( this.visible ) {
            this.tabOpen = true;
            window.setTimeout(() => this.tabOpen = true, 3000);
        }
    }

    isVisible() {
        return this.visible;
    }

    deleteLightbox() {
        if ( !this.lightbox || !(this.lightbox.id > 0) ) {
            return;
        }

        let lightboxId = this.lightbox.id;

        this.lightboxDataService.deleteLightbox( this.lightbox.id ).then( () => {
            this.resetAction();
        });
    }

    downloadPdf() {
        this.lightboxService.downloadPdf( this.lightbox.id ).then( () => {
            this.resetAction();
        });
    }

    downloadZip() {
        this.lightboxService.downloadZip( this.lightbox.id ).then( () => {
            this.resetAction();
        });
    }

    sendMail() {
        let email = this.formSend.get('email').value;
        let comment = this.formSend.get('comment').value;

        this.lightboxService.sendMail( this.lightbox.id, email, comment ).then( () => {
            this.resetAction();
        });
    }

    duplicate() {
        this.lightboxService.getLightbox( this.lightbox.id ).subscribe( data => {
            let lightbox = this.cleanLightboxForDuplicate( data );

            this.lightboxDataService.createLightbox(lightbox).then(() => {
                this.resetAction();
            });
        });
    }

    copyToCart() {
        this.lightboxService.copyToCart( this.lightbox.id ).then(() => {
            this.resetAction();
        });
    }

    createLightbox() {
        let formData = this.formCreate.getRawValue();
        this.lightboxDataService.createLightbox( formData ).then(
            () => {
                this.resetAction();
            },
            data => {
                if ( data.status == 409 ) {
                    let body = data.json();
                    if( body.message == 'Name is empty' ) {
                        this.setErrorMessage('Please enter a name');
                    } else {
                        this.setErrorMessage('A gallery with that name already exists.');
                    }
                }
            }
        );
    }

    renameLightbox() {
        let formData = this.formRename.getRawValue();
        formData['id'] = this.lightbox.id;
        formData['comment'] = this.lightbox.comment;

        this.lightboxDataService.updateLightbox( formData ).then(
            () => {
                this.resetAction();
            },
            data => {
                if ( data.status == 409 ) {
                    this.setErrorMessage('A gallery with that name already exists.');
                }
            }
        );
    }

    setErrorMessage( msg ) {
        this.errorMessage = msg;
    }

    resetErrorMessage() {
        this.errorMessage = null;
    }



    cleanLightboxForDuplicate( lightbox: Lightbox ): Lightbox {
        lightbox.id = null;
        lightbox.creationDate = null;
        lightbox.modificationDate = null;
        lightbox.name = lightbox.name + ' - Duplicate';

        if( lightbox.assets && lightbox.assets.length > 0 ) {
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


    showAssetDetail(event: any): void {
        this.router.navigate([{outlets: {modal: ['detail', event.id]}}], {queryParamsHandling: 'merge'});
    }

    isEmpty() {
        return (!this.lightbox || !this.lightbox.assets || !this.lightbox.assets.length);
    }
}
