import {AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChildren} from '@angular/core';
import {UserService} from '../user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit, OnInit {

    @Output() close = new EventEmitter<any>();
    @ViewChildren('username') username;

    public form: FormGroup;

    public loginSuccessMessage = '';

    public formErrors = [];

    private validationMessages = {
        'username': {
            'email': 'The email is invalid',
            'required': 'Please enter a email'
        },
        'password': {
            'required': 'Please enter a password'
        }
    };

    constructor(
        private user: UserService,
        private router: Router,
        private fb: FormBuilder,
        private route: ActivatedRoute
    ) {
        this.createForm();
    }

    ngAfterViewInit(): void {
        this.username.first.nativeElement.focus();
    }

    ngOnInit() {
        let params = this.route.snapshot.queryParams;
        if( params['lid'] && params['mds'] && params['uid'] ) {
            this.doDirectLogin( params['lid'], params['mds'], params['uid'] );
        }
    }


    createForm() {
        this.form = this.fb.group({
                username: ['', [Validators.required, Validators.email] ],
                password: ['', [Validators.required]]
            });

    }

    doLogin(): void {
        this.setFormErrors(false);
        if ( !this.form.valid ) {
            return;
        }

        this.loginSuccessMessage = '';

        let formData = this.form.getRawValue();

        this.user.login(formData.username, formData.password)
            .then(
                () => {
                    this.loginSuccessMessage = 'Sign In Successful';
                    this.closeLogin();
                },
                (error) => {
                    this.formErrors.push(error.message);
                }
            )
            .catch(
                (error) => {
                    console.log('CATCHED ERROR:');
                }
            );


    }

    doDirectLogin(lid: number, mds: string, uid: number): void {
        this.loginSuccessMessage = '';

        this.user.directLogin(lid, mds, uid)
            .then(
                () => {
                    this.loginSuccessMessage = 'Sign In Successful';
                    this.closeLogin();
                },
                (error) => {
                    this.formErrors.push(error.message);
                }
            )
            .catch(
                (error) => {
                    console.log('CATCHED ERROR:');
                }
            );


    }

    cancelLogin() {
        this.user.logout();
        this.closeLogin();
    }


    closeLogin(): void {
        this.router.navigate([{outlets: {modal: null}}], {queryParamsHandling: 'merge'});
    }

    setFormErrors(ignorePristine): void {
        if (!this.form) { return; }
        const form = this.form;
        this.formErrors = [];

        for (const field in this.validationMessages) {
            const control = form.get(field);

            if (control && (!ignorePristine || control.dirty) && !control.valid) {
                for (const key in control.errors) {
                    let message = 'Some error happened';
                    if ( this.validationMessages[field] && this.validationMessages[field][key] ) {
                        message = this.validationMessages[field][key];
                    } else if ( key.substr(0,10) === 'serverside' ) {
                        message = control.errors[key];
                    }

                    this.formErrors.push(message);
                }
            }
        }
    }

    resendVerificationEmail() {
        let email = this.form.getRawValue().username;
        if( !email ) {
            return;
        }

        this.user.resendVerificationEmail(email).then(
            success => {
                if( success ) {
                    this.formErrors = [];
                    this.loginSuccessMessage = 'Successfully sent verification email';
                } else {
                    this.loginSuccessMessage = '';
                    this.formErrors = ['Could not send verification email'];
                }

            },
            () => {
                this.loginSuccessMessage = '';
                this.formErrors = ['Could not send verification email'];
            }
        );
    }
}
