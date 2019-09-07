import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserDataService} from '../user-data.service';
import {UserLoginService} from '../user-login.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CartDataService} from '../cart-data.service';
import {Observable} from "rxjs/Observable";
import {SuggestService} from "../suggest.service";
import {Subject} from 'rxjs/Subject';


@Component({
    selector: 'app-page-header',
    templateUrl: './page-header.component.html',
    styleUrls: ['./page-header.component.css']
})
export class PageHeaderComponent implements OnInit {

    public basketCount = 0;
    public form: FormGroup;
    private dontNavigate: boolean = false;

    public optionsBase: Subject<any> = new Subject<any>();
    public options: Observable<any> = null;

    public showSearchFieldCentered = false;

    private lastKeywordChange = 0;

    constructor(
        private router: Router,
        public user: UserDataService,
        public userLogin: UserLoginService,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private cartDataService: CartDataService,
        private suggestionService: SuggestService
    ) {
    }

    ngOnInit() {
        this.form = this.fb.group({
            search: ''
        });

        let stream = this.form.valueChanges
            .map( data => {
                this.lastKeywordChange = (new Date("now")).getTime();
                return data;
            });


        let suggestOptions = stream
            .debounceTime(200)
            .distinctUntilChanged()
            .switchMap( data => {
                let keyword = String(data.search).trim();

                if( keyword.length < 2 ) {
                    return Observable.of(null);
                }

                if( keyword == '' ) {
                    return Observable.empty();
                }

                return this.suggestionService
                    .getSuggestions(keyword)
                    .map(result => result.map(str => {
                        str = str.toLowerCase();
                        return {
                            text: str.replace(keyword,'<strong>'+keyword+'</strong>'),
                            value: str
                        };
                    }));
            });

        this.options = Observable.merge( this.optionsBase, suggestOptions );


        stream.debounceTime(600)
            .distinctUntilChanged()
            .filter( () => {
                return (this.dontNavigate) ? (this.dontNavigate = false) : true;
            })
            .subscribe(data => {
                this.goToSearch( data.search );
            })
        // .catch(error => {
        //     // TODO: add real error handling
        //     console.log(error);
        //     return Observable.of<Hero[]>([]);
        // })
        ;

        this.router.events.subscribe( data => {
            let before = this.showSearchFieldCentered;
            this.showSearchFieldCentered = data['url'] == '/';

            // emit a window resize event so the auto-suggest div is moved with the input field
            if( before != this.showSearchFieldCentered ) {
                Observable.interval(20).take(35).subscribe(test => {
                    window.dispatchEvent(new Event('resize'));
                });
            }

        });

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
            .subscribe((event) => {
                let q = event['q'] ? event['q'] : '';
                if ( this.form.getRawValue().search == q ) {
                    return;
                } else if( this.router.url.substr(0,8) != '/search?' ) {
                    this.form.patchValue({search: ''});
                    this.dontNavigate = true;
                }

                if( (new Date("now")).getTime() - this.lastKeywordChange > 800 ) {
                    this.form.patchValue({search: q});
                }
            });


        this.cartDataService.cart
            .map( cart => {
                let count = 0;

                if(cart && cart.articles && Array.isArray(cart.articles) ) {
                    count = cart.articles.length;
                }

                return count;
            })
            .distinctUntilChanged()
            .subscribe(basketCount => {
                this.basketCount = basketCount;
            });
    }

    checkSearch(event) {
        if ( event.key == 'Enter' ) {
            this.hideAutocomplete();

            let keywords = this.form.getRawValue().search;
            if( !keywords ) {
                this.goToSearch('');
            }
        } else if ( event.key == 'Escape' ) {
            this.hideAutocomplete();
        }
    }

    goToSearch(keyword) {
        this.router.navigate(['/search'], {queryParams: {q: keyword}, queryParamsHandling: 'merge'});
    }

    hideAutocomplete() {
        this.optionsBase.next(null);
    }

    getHideSearch() {
        if (this.router.url === '/(modal:login)' || this.router.url === '/') return false;
        return true;
    }

}
