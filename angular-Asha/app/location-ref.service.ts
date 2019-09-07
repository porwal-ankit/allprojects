import { Injectable } from '@angular/core';

@Injectable()
export class LocationRefService {

  constructor() { }

  get nativeLocation (): any {
      if( typeof window !== 'undefined' && window.location ) {
          return window.location;
      }

      return {
          hash: '',
          host: '',
          hostname: '',
          href: '',
          origin: '',
          pathname: '',
          port: '',
          protocol: 'https'
      };
  }

}
