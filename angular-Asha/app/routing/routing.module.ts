import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';

import {PageHomepageComponent} from '../page-homepage/page-homepage.component';
import {PageSearchComponent} from '../page-search/page-search.component';
import {LoginComponent} from '../login/login.component';
import {PageRegistrationComponent} from '../page-registration/page-registration.component';
import {ModalDetailComponent} from '../modal-detail/modal-detail.component';
import {PageGalleryComponent} from '../page-gallery/page-gallery.component';
import {PageVerifyComponent} from '../page-verify/page-verify.component';
import {PageContactComponent} from '../page-contact/page-contact.component';
import {PageContributorComponent} from '../page-contributor/page-contributor.component';
import {PagePrivacyComponent} from '../page-privacy/page-privacy.component';
import {PageSubmissionComponent} from '../page-submission/page-submission.component';
import {PageTeamComponent} from '../page-team/page-team.component';
import {PageTermsComponent} from '../page-terms/page-terms.component';
import {PageDetailComponent} from '../page-detail/page-detail.component';
import {AssetResolver} from '../resolver/asset.resolver';
import {PageAccountComponent} from '../page-account/page-account.component';
import {PageCheckoutSuccessComponent} from '../page-checkout-success/page-checkout-success.component';
import {BasketOverviewComponent} from '../basket-overview/basket-overview.component';
import {BasketCheckoutComponent} from '../basket-checkout/basket-checkout.component';
import {PagePaymentErrorComponent} from '../page-payment-error/page-payment-error.component';
import {PagePaymentDeferredComponent} from '../page-payment-deferred/page-payment-deferred.component';
import {PageRmvsrfComponent} from '../page-rmvsrf/page-rmvsrf.component';
import {UserGuardService} from '../user-guard.service';
import {PageResetPasswordComponent} from '../page-reset-password/page-reset-password.component';
import {PageRequestPasswordResetTokenComponent} from '../page-request-password-reset-token/page-request-password-reset-token.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot([
        { path: '', component: PageHomepageComponent, data: { title: 'ImagePoint' } },
        { path: 'search',  component: PageSearchComponent },
        { path: 'detail/:assetId',  component: ModalDetailComponent, outlet: 'modal' },
        { path: 'asset/:assetId', component: PageDetailComponent, resolve: { asset: AssetResolver } },

        { path: 'login',  component: LoginComponent, outlet: 'modal' },
        { path: 'login/direct',  component: LoginComponent },
        { path: 'register',  component: PageRegistrationComponent },
        { path: 'verify/:userId/:token',  component: PageVerifyComponent },
        { path: 'account/reset',  component: PageRequestPasswordResetTokenComponent },
        { path: 'account/reset/:email/:token',  component: PageResetPasswordComponent },
        { path: 'account/:type',  component: PageAccountComponent, canActivate: [UserGuardService] },

        { path: 'cart/download/:orderId',  component: PageCheckoutSuccessComponent, canActivate: [UserGuardService] },
        { path: 'cart',  component: BasketOverviewComponent, canActivate: [UserGuardService] },
        { path: 'cart/checkout',  component: BasketCheckoutComponent, canActivate: [UserGuardService] },
        { path: 'cart/deferred',  component: PagePaymentDeferredComponent, canActivate: [UserGuardService] },
        { path: 'cart/error',  component: PagePaymentErrorComponent, canActivate: [UserGuardService] },
        { path: 'cart/error/:cartId',  component: PagePaymentErrorComponent, canActivate: [UserGuardService] },
        { path: 'gallery',  component: PageGalleryComponent, canActivate: [UserGuardService] },
        { path: 'gallery/:galleryId',  component: PageGalleryComponent },

        { path: 'contributor',  component: PageContributorComponent, data: {
                title: 'The contributor page',
                meta: [
                    { name: 'og:title', content: 'test contributor og title'},
                    { name: 'og:description', content: 'the description for the page'},
                ]
            }
        },

        { path: 'contact',  component: PageContactComponent, data: { title: 'Contact us!' } },
        { path: 'privacy',  component: PagePrivacyComponent, data: { title: 'Privacy page' } },
        { path: 'submission',  component: PageSubmissionComponent },
        { path: 'terms',  component: PageTermsComponent },
        { path: 'team',  component: PageTeamComponent },
        { path: 'rmrf',  component: PageRmvsrfComponent, outlet: 'modal' }
    ])

  ],
  declarations: [],
  exports: [ RouterModule ]
})
export class RoutingModule { }
