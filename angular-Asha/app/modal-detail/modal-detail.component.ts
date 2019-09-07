import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Asset} from '../models/asset';
import {Article} from '../models/article';

@Component({
  selector: 'app-modal-detail',
  templateUrl: './modal-detail.component.html',
  styleUrls: ['./modal-detail.component.css']
})
export class ModalDetailComponent implements OnInit {

  @Input() asset: Asset;
  @Input() article: Article;
  @Output() close = new EventEmitter<any>();

  public assetId = null;

  constructor(
      private router: Router,
      private route: ActivatedRoute
  ) { }

  ngOnInit() {
      if( !this.asset && !this.article ) {
          this.route.params.subscribe(params => {
              this.assetId = params['assetId'];
          });
      }
  }

  closeDetail() {
      if( !this.asset && !this.article ) {
          this.router.navigate([{outlets: {modal: null}}], {queryParamsHandling: 'merge'});
      } else {
          let assetId = this.asset && this.asset.id > 0 ? this.asset.id : this.article.asset.id;

          this.close.emit({
              id: assetId
          });
      }
  }

}
