import { Injectable } from '@angular/core';

@Injectable()
export class WindowRefService {

  constructor() { }

    get nativeWindow (): any {
        if( typeof window !== 'undefined' && window.document ) {
            return window;
        }

        return {
            scrollTo: function() {}
        };
    }

}
