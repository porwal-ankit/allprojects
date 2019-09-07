import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Asset} from '../models/asset';

@Component({
  selector: 'app-page-detail',
  templateUrl: './page-detail.component.html',
  styleUrls: ['./page-detail.component.css']
})
export class PageDetailComponent {

  public asset: Asset = null;

  constructor(
      private route: ActivatedRoute
  ) {
      this.route.data.subscribe(params => {
          this.asset = params['asset'];
      });
  }

}
