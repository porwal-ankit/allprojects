import { Injectable } from '@angular/core';
import {LocalStorageService} from 'ngx-webstorage';
import {UserDataService} from './user-data.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class PreferencesService {

  constructor(
      private user: UserDataService,
      private storage: LocalStorageService,
  ) { }

  get(name: string) {
    return this.storage.retrieve( this.getName(name) );
  }

  set(name: string, value) {
    this.storage.store( this.getName(name), value);
  }

  clear(name: string) {
    this.storage.clear( this.getName(name) );
  }

  observe(name: string) {
    return this.user.user.switchMap(() => {

      let subject = new BehaviorSubject( this.get(name) );
      this.storage.observe( this.getName(name) ).subscribe( data => {
        subject.next( data );
      });

      return subject.asObservable();
    });
  }

  getName(name: string) {
    let user = this.user.getUser();
    let userId = user && user['id'] > 0 ? user['id'] : 0;

    return userId + '_' + name;
  }


}
