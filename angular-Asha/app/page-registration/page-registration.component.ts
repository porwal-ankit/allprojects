import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';

import { User } from '../models/user';
import {UserAddress} from '../models/user-address';
import {CountryService} from '../country.service';
import {UserService} from '../user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-page-registration',
  templateUrl: './page-registration.component.html',
  styleUrls: ['./page-registration.component.css']
})
export class PageRegistrationComponent implements OnInit {

  public form: FormGroup;
  public countries;

  public formErrors = {
    email: [],
    password: [],
    passwordConfirm: [],
    familyName: [],
    givenName: [],
    company: [],
    postalCode: [],
    streetAddress: [],
    streetAddress2: [],
    addressLocality: [],
    addressRegion: [],
    addressCountry: []
  };

  public success: boolean = false;
  public errorMessages: string[] = [];

  private validationMessages = {
    'email': {
      'email': 'This is not a valid email address'
    },
    'general': {
      'required': 'This field is required.',
      'email': 'This is not a valid email address',
      'validatePasswordConfirmation': 'The passwords do not match'
    }
  };


  constructor(
      private countryService: CountryService,
      private userService: UserService,
      private fb: FormBuilder,
      private router: Router
  ) {
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email] ],
      password: ['', [Validators.required]],
      passwordConfirm: ['', [Validators.required]],
      familyName: ['', [Validators.required]],
      givenName: ['', [Validators.required]],
      company: '',
      postalCode: ['', [Validators.required]],
      streetAddress: ['', [Validators.required]],
      streetAddress2: '',
      addressLocality: ['', [Validators.required]],
      addressRegion: '',
      addressCountry: ['US', [Validators.required]],
    },
    {
      validator: this.validatePasswordConfirmation
    });

    this.form.valueChanges
        .subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); // (re)set validation messages now

  }

  ngOnInit() {
    this.getCountries();
  }

  getCountries(): void {
    this.countryService.getCountries().then(countries => this.countries = countries);
  }

  onSubmit() {
    this.setFormErrors(false);
    this.errorMessages = [];
    this.success = false;

    if ( !this.form.valid ) {
      return;
    }
    let user = this.prepareSaveUser();

    this.userService.register(user).then(
        successData => {
            this.success = true;

            if( window && window.setTimeout ) {
                window.setTimeout(() => {
                    this.router.navigate(['/']);
                }, 5000);
            }
        },
        errorData => {
          let errorContent = errorData.json();

          if ( errorContent.violations && errorContent.violations ) {
            for (let propertyPath in errorContent.violations) {
              this.form.get(propertyPath).setErrors(errorContent.violations[propertyPath]);
            }

            this.setFormErrors(false);

          } else if( errorContent.code == 409 ) {
              this.form.get('email').setErrors(['This email is already taken']);
              this.setFormErrors(false);
          }
        }
    );
  }

  prepareSaveUser(): User {
    const formModel = this.form.value;

    const user = new User();
    user.email = formModel.email;
    user.password = formModel.password;
    user.familyName = formModel.familyName;
    user.givenName = formModel.givenName;
    user.company = formModel.company;

    const address = new UserAddress();
    address.contactType = 'main';
    address.familyName = formModel.familyName;
    address.givenName = formModel.givenName;
    address.postalCode = formModel.postalCode;
    address.streetAddress = formModel.streetAddress;
    address.streetAddress2 = formModel.streetAddress2;
    address.addressLocality = formModel.addressLocality;
    address.addressRegion = formModel.addressRegion;
    address.addressCountry = formModel.addressCountry;

    user.address = [ address ];

    return user;
  }

  onValueChanged(data?: any) {
    this.setFormErrors(true);
  }

  setFormErrors(ignorePristine): void {
    if (!this.form) { return; }
    const form = this.form;

    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = [];

      const control = form.get(field);

      if (control && (!ignorePristine || control.dirty) && !control.valid) {
        for (const key in control.errors) {
          let message = 'Some error happened';
          if ( this.validationMessages[field] && this.validationMessages[field][key] ) {
            message = this.validationMessages[field][key];
          } else if ( this.validationMessages['general'] && this.validationMessages['general'][key] ) {
            message = this.validationMessages['general'][key];
          } else {
            message = control.errors[key];
          }

          this.formErrors[field].push(message);
        }
      }
    }
  }

  validatePasswordConfirmation(group: FormGroup) {
    let pw = group.controls['password'];
    let pw2 = group.controls['passwordConfirm'];

    if (pw.value !== pw2.value) {
      pw2.setErrors({validatePasswordConfirmation: true});
    } else if (pw2.hasError('validatePasswordConfirmation')) {
      pw2.setErrors(null);
    }

    return null;
  }
}
