import { Component, OnInit } from '@angular/core';
import {UserService} from '../user.service';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-page-reset-password',
  templateUrl: './page-reset-password.component.html',
  styleUrls: ['./page-reset-password.component.css']
})
export class PageResetPasswordComponent implements OnInit {

  private token: string = null;
  private email: string = null;

  public form: FormGroup = null;
  public formErrors = {};
  public success: boolean = false;


  constructor(
      private route: ActivatedRoute,
      private userService: UserService,
      private fb: FormBuilder
  ) {
      this.form = fb.group({
          password: new FormControl(''),
          passwordConfirm: new FormControl('')
      });
  }

  ngOnInit() {
      this.token = this.route.snapshot.params['token'];
      this.email = this.route.snapshot.params['email'];
  }


    public resetPassword() {
        let password = this.form.getRawValue().password;
        let passwordConfirm = this.form.getRawValue().passwordConfirm;

        if( !this.arePasswordsValid(password, passwordConfirm) ) {
          return;
        }

        this.userService.resetPasswordWithToken(this.email, this.token, password).then(
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

    private arePasswordsValid(password: string, passwordConfirm: string) {
        this.formErrors = {};

        if( !password ) {
            this.formErrors['password'] = ['Please enter a password'];
            return false;
        }

        if( password != passwordConfirm ) {
            this.formErrors['passwordConfirm'] = ['The passwords do not match'];
            return false;
        }

        return true;
    }

}
