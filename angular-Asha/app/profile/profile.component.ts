import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CountryService} from '../country.service';
import {UserService} from '../user.service';
import {User} from '../models/user';
import {UserAddress} from '../models/user-address';
import {UserDataService} from '../user-data.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public form: FormGroup;
  public countries;

  public user: User = null;

  public formErrors = {
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
      'general': {
          'required': 'This field is required.',
          'validatePasswordConfirmation': 'The passwords do not match'
      }
  };

  constructor(
      private countryService: CountryService,
      private userService: UserService,
      private fb: FormBuilder,
      private userDataService: UserDataService
  ) {
      this.createForm();
  }

  createForm() {
      this.form = this.fb.group({
              password: '',
              passwordConfirm: '',
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

      this.userService.getUser().then( user => {
        this.user = user;
        let address = user.address.find( data => data.contactType == 'main');

        if( !address ) {
          return;
        }

        this.form.patchValue({
            familyName: user.familyName,
            givenName: user.givenName,
            company: user.company,
            postalCode: address.postalCode,
            streetAddress: address.streetAddress,
            streetAddress2: address.streetAddress2,
            addressLocality: address.addressLocality,
            addressRegion: address.addressRegion,
            addressCountry: address.addressCountry
        });
      });
  }

  getCountries(): void {
      this.countryService.getCountries().then(countries => this.countries = countries);
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

    save() {
        this.setFormErrors(false);
        this.errorMessages = [];
        this.success = false;

        if ( !this.form.valid ) {
            return;
        }
        let user = this.prepareSaveUser();

        this.userService.update(user).then(
            successData => {
                this.userDataService.reload();
                this.success = true;
            },
            errorData => {
                let errorContent = errorData.json();

                if ( errorContent.violations && errorContent.violations ) {
                    for (let propertyPath in errorContent.violations) {
                        this.form.get(propertyPath).setErrors(errorContent.violations[propertyPath]);
                    }

                    this.setFormErrors(false);

                }
            }
        );
    }

    prepareSaveUser(): User {
        let formModel = this.form.value;


        let user = this.user;

        user.password = formModel.password;
        user.familyName = formModel.familyName;
        user.givenName = formModel.givenName;
        user.company = formModel.company;

        let address = null;

        for( let tmp of user.address ) {
            if( tmp.contactType == 'main' ) {
                address = tmp;
                break;
            }
        }

        let newAddress = false;
        if( !address ) {
            address = new UserAddress();
            newAddress = true;
        }

        address.contactType = 'main';
        address.familyName = formModel.familyName;
        address.givenName = formModel.givenName;
        address.postalCode = formModel.postalCode;
        address.streetAddress = formModel.streetAddress;
        address.streetAddress2 = formModel.streetAddress2;
        address.addressLocality = formModel.addressLocality;
        address.addressRegion = formModel.addressRegion;
        address.addressCountry = formModel.addressCountry;

        if( newAddress ) {
            user.address = [ address ];
        }

        return user;
    }


}
