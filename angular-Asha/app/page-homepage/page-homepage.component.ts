import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {WebseriesService} from '../webseries.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {Subject} from 'rxjs/Subject';
import {SuggestService} from "../suggest.service";

@Component({
  selector: 'app-page-homepage',
  templateUrl: './page-homepage.component.html',
  styleUrls: ['./page-homepage.component.css']
})
export class PageHomepageComponent implements OnInit {

  public mainImage = '';
  public fadeImage = '';
  public fadeOpacity = 1;
  public form: FormGroup;
  public options: Observable<any> = null;
  public optionsBase: Subject<any> = new Subject<any>();
  private dontNavigate: boolean = false;
  private lastKeywordChange = 0;

  private list = [];
  private pos = 0;

  constructor(
      private webseriesService: WebseriesService,
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private suggestionService: SuggestService,
  ) { }

    ngOnInit() {
        this.form = this.fb.group({
            search: ''
        }); 

        if( !(typeof window !== 'undefined' && window.document) ) {
            return;
        }

        this.webseriesService.getWebseries(1).then( data => {
            let list = [];
            for( let webseriesAsset of data.assets ) {
                let coverUrl = null;
                if( !webseriesAsset.asset ) {
                    continue;
                }

                for( let associatedMedia of webseriesAsset.asset.associatedMedia ) {
                    if( associatedMedia.additionalType == 'preview') {
                      // console.log(associatedMedia.contentUrl);
                        coverUrl = associatedMedia.contentUrl;
                        break;
                    }
                }

                if( coverUrl ) {
                    list.push(coverUrl);
                }
            }

            this.list = list;

            this.setInitialImage();
            this.showNextImage();
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
    }

  setInitialImage() {
    //console.log(this.list);
      this.mainImage =  this.list[ this.pos ];
  }

  showNextImage() {
      if( !this.list || !this.list.length ) {
          return;
      }

      this.pos++;
      let pos = this.pos % this.list.length;

      let loaded = false;

      let image = new Image();
      image.src = this.list[pos];
      image.onload = () => {
          loaded = true;
        };

      let loadedFunction = () => {
          this.changeImage(image.src);
          this.showNextImage();
      };

      Observable.interval(5000).take(1).subscribe(() => {
          if( loaded ) {
              loadedFunction();
          } else {
              image.onload = loadedFunction;
          }
      });
  }

  changeImage(newUrl: string) {
      this.fadeImage = this.mainImage;
      this.mainImage = newUrl;

      this.fadeOpacity = 0;

      Observable.interval(1000).take(1).subscribe(() => {
          this.fadeImage = '';
          this.fadeOpacity = 1;
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


}
