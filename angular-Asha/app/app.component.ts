import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Meta, Title} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    private metaToKeep = [];

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private titleService: Title,
        private metaService: Meta
    ) { }



    ngOnInit(): void {
        this.initDefaultMetaTags();

        this.router.events
            .filter((event) => event instanceof NavigationEnd)
            .map(() => {
                let route = this.activatedRoute;
                while (route.firstChild) route = route.firstChild;
                return route;
            })
            .filter((route) => route.outlet === 'primary')
            .mergeMap((route) => route.data)
            .subscribe((routeData) => {

                this.removePreviousMetaTags();

                let data = this.getMainRouteData();
                data = {...data, ...routeData};

                this.titleService.setTitle( data['title'] );

                if( data['meta'] && data['meta'].length) {
                    this.metaService.addTags( data['meta'] );
                }
            });
    }

    private getMainRouteData() {
        let data = {
            title: '',
            meta: []
        };

        for( let entry of this.router.config ) {
            if( entry.path == '' ) {
                return {...data, ...entry.data};
            }
        }

        return data;
    }

    private initDefaultMetaTags() {
        this.metaToKeep = [];
        for( let tag of this.metaService.getTags('name') ) {
            let data = {};
            for( let i=0; i<tag.attributes.length; i++ ) {
                let attr = tag.attributes.item(i);
                data[ attr.nodeName ] = attr.nodeValue;
            }

            this.metaToKeep.push(data);
        }
    }

    private removePreviousMetaTags() {
        for( let tag of this.metaService.getTags('name') ) {
            this.metaService.removeTag('name="'+ tag['name'] +'"');
        }

        this.metaService.addTags(this.metaToKeep);
    }


    public showFullPage() {
        if( this.router.url.substr(-12) == 'mode=compact') {
            return false;
        }

        return true;
    }
}
