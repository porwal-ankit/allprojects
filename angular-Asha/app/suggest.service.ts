import { Injectable } from '@angular/core';
import {SodaApiService} from "./soda-api.service";
import {Headers} from "@angular/http";
import {Observable} from "rxjs/Observable";

@Injectable()
export class SuggestService {

    private path = 'suggestions';

    constructor(private http: SodaApiService) {
    }


    public getSuggestions(keyword: string): Observable<string[]>{
        let url = this.path + '?';
        url += 'keyword=' + encodeURIComponent(keyword);

        let headers = new Headers();
        headers.set('Accept', 'application/json');

        return this.http.get(url, {headers: headers})
            .map(response => response.json());
    }


}
