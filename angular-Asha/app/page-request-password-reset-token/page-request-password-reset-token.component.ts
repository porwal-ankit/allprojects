import { Component, OnInit } from '@angular/core';
import {UserService} from '../user.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-page-request-password-reset-token',
  templateUrl: './page-request-password-reset-token.component.html',
  styleUrls: ['./page-request-password-reset-token.component.css']
})
export class PageRequestPasswordResetTokenComponent implements OnInit {

  public form: FormGroup = null;
  public formErrors = {};
  public success: boolean = false;


  constructor(
      private userService: UserService,
      private fb: FormBuilder
  ) {
      this.form = fb.group({
          email: new FormControl('')
      });
  }

  ngOnInit() {
  }

  public sendToken() {
      let email = this.form.getRawValue().email;
      if( !email ) {
          return;
      }

      this.userService.requestPasswordResetToken(email).then(
          (data) => {
              console.log('SUCCESS!!!');
              this.success = true;
          },
          (data) => {
            console.log('RECEIVED ERROR :-(');
            data = data.json();
            if( data.violations ) {
                this.formErrors = data.violations;
            }
          }
      );
  }

}
