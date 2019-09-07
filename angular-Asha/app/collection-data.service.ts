import { Injectable } from '@angular/core';
import {CollectionService} from './collection.service';
import {Collection} from './models/collection';

@Injectable()
export class CollectionDataService {

  private collections: Promise<Collection[]> = null;

  constructor(
      private collectionService: CollectionService
  ) { }


  public getCollections(): Promise<Collection[]> {
      if ( this.collections === null ) {
          this.collections = this.collectionService.getCollections();
      }

      return this.collections;
  }



}
