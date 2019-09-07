import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SodaApiService} from '../soda-api.service';
import {UserService} from '../user.service';

@Component({
  selector: 'app-page-verify',
  templateUrl: './page-verify.component.html',
  styleUrls: ['./page-verify.component.css']
})
export class PageVerifyComponent implements OnInit {

  public status: string = '';

  constructor(
      private route: ActivatedRoute,
      private userService: UserService,
      private router: Router
  ) { }

  ngOnInit() {
    this.route.params
        .distinctUntilChanged()
        .subscribe(data => {
            this.verify(data);
        });
  }

  verify(data) {
    this.userService.verify( data['userId'], data['token'] )
        .then( success => {
              this.status = success ? 'success' : 'fail';

              if( success && window && window.setTimeout ) {
                  window.setTimeout(() => {
                      this.router.navigate(['/']);
                  }, 5000);
              }
            },
            error => {
                this.status = 'fail';
            }
        );
  }



}
