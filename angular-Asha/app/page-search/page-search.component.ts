import {Component, HostListener, Inject, OnInit, ViewChild} from '@angular/core';
import {AssetService} from '../asset.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AssetListComponent} from '../asset-list/asset-list.component';
import {DOCUMENT} from '@angular/common';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import 'rxjs/add/operator/distinctUntilChanged';
import {Observable} from 'rxjs/Observable';
import {AssetSearchBreadcrumb} from '../models/asset_search_breadcrumb';
import {SupplierDataService} from '../supplier-data.service';
import {CollectionDataService} from '../collection-data.service';
import {Collection} from '../models/collection';
import {PreferencesService} from '../preferences.service';

@Component({
    selector: 'app-page-search',
    templateUrl: './page-search.component.html',
    styleUrls: ['./page-search.component.css']
})
export class PageSearchComponent implements OnInit {

    @ViewChild('assetListContainer') assetList: AssetListComponent;

    public filterForm: FormGroup;

    private filters: any = {};
    public dataLoading: boolean = true;
    private nextPage: number = 1;
    private itemsPerPage: number = 100;
    public totalItems: any = false;
    public faceted: any = {};
    public showSearchFilters = false;
    public collections: Collection[] = [];
    private ignoreFormChanges: boolean = false;

    public searchFilterBredcrumbs: AssetSearchBreadcrumb[] = [];

    private filterMappings = {
        'license': {
            'rm': 'RM',
            'rf': 'RF'
        },
        'orientation': {
            'h': 'Horizontal',
            'v': 'Vertical'
        },
        'format': {
            'r': 'Rectangular',
            'p': 'Panoramic'
        },
        'color': {
            'c': 'Color',
            'bw': 'Black & White',
            'mch': 'Monochrome'
        },
        'size': {
            '5': '> 5 MP (14.5 MB)',
            '12': '> 12 MP (34.3 MB)',
            '25': '> 25 MP (71.5 MB)',
            '35': '> 35 MP (101 MB)',
            '70': '> 70 MP (210 MB)',
            '150': '> 150 MP (450 MB)'
        }
    };

    @HostListener('window:scroll', []) onWindowScroll() {
        let listSize = this.assetList.getBoundingClientRect();

        let clientHeight = this.document.body.clientHeight;
        let fromBottom = listSize.bottom - (clientHeight * 2);

        if (fromBottom < 0) {
            this.loadNextPage();
        }
    }


    constructor(
        private assetService: AssetService,
        private route: ActivatedRoute,
        @Inject(DOCUMENT) private document: any,
        private fb: FormBuilder,
        private router: Router,
        private supplierDataService: SupplierDataService,
        private collectionDataService: CollectionDataService,
        private preferencesService: PreferencesService
    ) {
        this.createForm();
    }

    ngOnInit() {
        if( !(typeof window !== 'undefined' && window.document) ) {
            return;
        }

        this.route.queryParams
            .map((data) => {
                let newData = {};
                for ( let k in data ) {
                    if ( data[k] !== '' ) {
                        newData[k] = data[k];
                    }
                }

                return newData;
            })
            .distinctUntilChanged(null, data => JSON.stringify(data))
            .switchMap((data) => {
                this.setBreadcrumbs(data);
                this.filters = data;
                this.setRouteParams();
                this.resetResults();

                return this.getAssets();
            })
            .subscribe((data) => this.setAssets(data));

        this.collectionDataService.getCollections().then( collections => {
            this.ignoreFormChanges = true;
            for ( let collection of collections ) {
                let fieldName = 'collection_' + collection.id;
                if( !this.filterForm.contains(fieldName) ) {
                    this.filterForm.addControl( fieldName, new FormControl( this.hasFilterValue('coll', collection.id) ) );
                }
            }
            this.ignoreFormChanges = false;

           this.collections = collections;
        });


        this.preferencesService.observe('showSearchFilters').subscribe( status => {
            this.showSearchFilters = status;
        });
    }

    createForm() {
        let group = {
            license: '',
            orientation: '',
            color: '',
            size: '',
            sizeCustom: '',
            format: '',
            collection_0: false
        };

        this.filterForm = this.fb.group(group);

        this.filterForm.valueChanges
            .debounceTime(600)
            .distinctUntilChanged(null, data => JSON.stringify(data))
            .subscribe(data => this.filterChanged(data));
    }

    filterChanged(data) {
        if( this.ignoreFormChanges ) {
            return;
        }

        let params = {};

        params['q'] = this.filters['q'];
        params['pgid'] = this.filters['pgid'];
        params['cop'] = this.filters['cop'];
        params['lic'] = data['license'];
        params['ori'] = data['orientation'];
        params['for'] = data['format'];
        params['col'] = data['color'];
        
        if( data['size'] == 'custom' ) {
            params['siz'] = Number(data['sizeCustom']) / 3;
        } else {
            params['siz'] = data['size'];
        }

        let coll = [];
        if ( data['collection_0'] ) {
            coll.push('p');
        }

        for ( let collection of this.collections ) {
            let tmpId = 'collection_' + collection.id;
            if ( data[ tmpId ] ) {
                coll.push(collection.id);
            }
        }

        params['coll'] = coll;

        for ( let k in params ) {
            if ( params[k] === '' || (Array.isArray(params[k]) && !params[k].length) ) {
                params[k] = null;
            }
        }

        this.router.navigate(['/search'], {queryParams: params} );
    }

    setBreadcrumbs(data) {
        this.searchFilterBredcrumbs = [];

        this.addBreadcrumbFilter( 'Keywords: ' + data['q'], 'q', data['q'] );
        this.setPhotographerBreadcrumb(data['pgid']);
        this.addBreadcrumbFilter('Photographer: ' + data['cop'], 'copyright', data['cop']);
        this.addBreadcrumbFilter( 'License: ' + this.filterMappings['license'][ data['lic'] ], 'license', data['lic'] );
        this.addBreadcrumbFilter( 'Orientation: ' + this.filterMappings['orientation'][ data['ori'] ], 'orientation', data['ori'] );
        this.addBreadcrumbFilter( 'Format: ' + this.filterMappings['format'][ data['for'] ], 'format', data['for'] );
        this.addBreadcrumbFilter( 'Color: ' + this.filterMappings['color'][ data['col'] ], 'color', data['col'] );


        if( !this.filterMappings['size'][ data['siz'] ] ) {
            this.addBreadcrumbFilter( 'Size: >' + (Number(data['siz']) * 3) + ' MB', 'size', data['siz'] );
        } else {
            this.addBreadcrumbFilter( 'Size: ' + this.filterMappings['size'][ data['siz'] ], 'size', data['siz'] );
        }

        if ( data['coll'] && Array.isArray(data['coll']) && data['coll'].indexOf('p') > -1 ) {
            this.addBreadcrumbFilter( 'Collection: ImagePoint', 'collection_0', true );
        }

        for (let collection of this.collections) {
            let tmpId = 'collection_' + collection.id;
            if (data['coll'] && Array.isArray(data['coll']) && data['coll'].indexOf(collection.id) > -1) {
                this.addBreadcrumbFilter('Collection: ' + collection.name, tmpId, true);
            }
        }

    }

    setPhotographerBreadcrumb( photographerId: number ) {
        if ( !(photographerId > 0 )) {
            return;
        }

        if ( this.filterMappings['photographer'] ) {
            this.addBreadcrumbFilter('Photographer: ' + this.filterMappings['photographer'][this.filters['pgid']], 'photographer', this.filters['pgid']);
            return;
        }

        this.supplierDataService.getSuppliers().then( suppliers => {
            let supplierList = {};
            for ( let supplier of suppliers ) {
                supplierList[ supplier.id ] = supplier.name;
            }

            this.filterMappings['photographer'] = supplierList;

            this.addBreadcrumbFilter('Photographer: ' + this.filterMappings['photographer'][this.filters['pgid']], 'photographer', this.filters['pgid']);
        });
    }


    setRouteParams() {
        let patchData = {};

        patchData['collection_0'] = this.hasFilterValue('coll', 'p');

        for ( let collection of this.collections ) {
            patchData['collection_' + collection.id ] = this.hasFilterValue('coll', collection.id);
        }

        patchData['license'] = this.filters['lic'] ? this.filters['lic'] : '';
        patchData['orientation'] = this.filters['ori'] ? this.filters['ori'] : '';
        patchData['format'] = this.filters['for'] ? this.filters['for'] : '';
        patchData['color'] = this.filters['col'] ? this.filters['col'] : '';

        if( !this.filters['siz'] || [0,5,12,25,35,70,150].indexOf(Number(this.filters['siz'])) > -1 ) {
            patchData['size'] = this.filters['siz'] ? this.filters['siz'] : '';
        } else {
            patchData['size'] = 'custom';
        }

        patchData['sizeCustom'] = patchData['size'] == 'custom' ? Number(this.filters['siz']) * 3 : '';

        this.filterForm.patchValue(patchData, {emitEvent: false});
    }

    hasFilterValue(name: string, value) {
        if( !this.filters[ name ] ) {
            return false;
        }

        if( !this.filters[ name ].length ) {
            return this.filters[ name ] == value;
        }

        for( let val of this.filters[ name ] ) {
            if( val == value ) {
                return true;
            }
        }

        return false;
    }

    getAssets(): Observable<any> {
        this.dataLoading = true;

        return this.assetService.getAssets( this.getSearchFilters() );
    }

    setAssets(data) {
        this.totalItems = data.total > 0 ? data.total : 0;
        this.assetList.addAssets(data.assets ? data.assets : []);
        this.faceted = data.faceted ? data.faceted : [];

        this.dataLoading = false;
    }

    resetResults() {
        this.nextPage = 1;
        this.totalItems = false;

        this.assetList.reset();
    }

    getSearchFilters() {
        let searchFilters = {
            'page': this.nextPage,
            'itemsPerPage': this.itemsPerPage
        };

        if (this.filters['q']) {
            searchFilters['searchKey'] = this.filters['q'];
        }

        if (this.filters['cop']) {
            searchFilters['copyright'] = this.filters['cop'];
        }

        if (this.filters['pgid']) {
            searchFilters['supplierId'] = this.filters['pgid'];
        }

        if (this.filters['lic']) {
            searchFilters['license'] = this.filters['lic'];
        }

        let orientation = '';
        if ( this.filters['for'] === 'p' ) {
            if ( this.filters['ori'] === 'h' ) {
                orientation = 'p';
            } else if ( this.filters['ori'] === 'v' ) {
                orientation = 'pv';
            } else {
                orientation = 'p,pv';
            }
        } else if ( this.filters['for'] === 'r' ) {
            if ( this.filters['ori'] === 'h' ) {
                orientation = 'h,q';
            } else if ( this.filters['ori'] === 'v' ) {
                orientation = 'v';
            } else {
                orientation = 'h,q,v';
            }
        } else {
            if ( this.filters['ori'] === 'h' ) {
                orientation = 'h,p,q';
            } else if ( this.filters['ori'] === 'v' ) {
                orientation = 'v,pv';
            }
        }
        searchFilters['orientation'] = orientation;




        if ( this.filters['siz'] ) {
            searchFilters['resolution_min'] = this.filters['siz'] * (1024 * 1024);
        }

        if (this.filters['col']) {
            searchFilters['color'] = this.filters['col'];
        }

        if (this.filters['coll']) {
            let collections = [];
            if ( this.hasFilterValue('coll', 'p') ) {
                collections.push(-1);
            }

            for ( let collection of this.collections ) {
                if ( this.hasFilterValue('coll', collection.id) ) {
                    collections.push(collection.id);
                }
            }

            if ( collections.length ) {
                searchFilters['collection'] = collections.join(',');
            }
        }

        return searchFilters;
    }

    loadNextPage(): void {
        if (this.dataLoading) {
            return;
        }

        if ( this.nextPage * this.itemsPerPage >= this.totalItems ) {
            return;
        }

        this.nextPage++;

        this.getAssets()
            .subscribe((data) => this.setAssets(data));
    }

    toggleSearchFilters() {
        this.showSearchFilters = !this.showSearchFilters;
        this.preferencesService.set('showSearchFilters', this.showSearchFilters);
    }

    public getFacetKeys(facetName: string) {
        if ( !this.faceted[ facetName ] ) {
            return [];
        }

        return Object.keys( this.faceted[ facetName ] ).slice(0, 15);
    }

    searchKeyword(keyword: string): void {
        this.router.navigate(['/search'], {queryParams: {'q': keyword}, queryParamsHandling: 'merge'} );
    }

    removeBreadcrumbFilter(index: number) {
        let breadcrumb = this.searchFilterBredcrumbs[index];

        this.searchFilterBredcrumbs.splice( index, 1 );

        if ( breadcrumb.name == 'q' ) {
            this.searchKeyword('');
        } else if ( breadcrumb.name == 'photographer' ) {
            this.router.navigate(['/search'], {queryParams: {pgid: ''}, queryParamsHandling: 'merge'} );
        } else if ( breadcrumb.name == 'copyright' ) {
            this.router.navigate(['/search'], {queryParams: {cop: ''}, queryParamsHandling: 'merge'} );
        } else {
            let changes = {};
            changes[breadcrumb.name] = '';

            this.filterForm.patchValue(changes);
        }
    }

    addBreadcrumbFilter(text: string, name: string, value: any) {
        if( !value || !name ) {
            return;
        }

        let breadcrumb = new AssetSearchBreadcrumb();
        breadcrumb.text = text;
        breadcrumb.name = name;
        breadcrumb.value = value;

        this.searchFilterBredcrumbs.push( breadcrumb );
    }

    getCollectionName(id) {
        for ( let collection of this.collections ) {
            if ( collection.id == id ) {
                return collection.name;
            }
        }

        return null;
    }

    selectCustomSize() {
        this.filterForm.patchValue({'size': 'custom'});
    }

}
