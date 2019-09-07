import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UserLoginService} from '../user-login.service';

@Component({
  selector: 'app-page-account',
  templateUrl: './page-account.component.html',
  styleUrls: ['./page-account.component.css']
})
export class PageAccountComponent implements OnInit {

  public pageType = null;

  constructor(
      private route: ActivatedRoute,
      public userLogin: UserLoginService
  ) {
      this.route.params
          .distinctUntilChanged()
          .subscribe(data => {
              this.pageType = data['type'];
          });
  }

  ngOnInit() {

  }

}
