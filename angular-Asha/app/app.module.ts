import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import { HttpModule } from '@angular/http';
import { Ng2Webstorage } from 'ngx-webstorage';

import { RoutingModule } from './routing/routing.module';

import { AppComponent } from './app.component';
import { PageHeaderComponent } from './page-header/page-header.component';
import { PageFooterComponent } from './page-footer/page-footer.component';
import { PageHomepageComponent } from './page-homepage/page-homepage.component';
import { PageSearchComponent } from './page-search/page-search.component';
import { AssetListComponent } from './asset-list/asset-list.component';
import { AssetThumbComponent } from './asset-thumb/asset-thumb.component';
import { AssetDetailComponent } from './asset-detail/asset-detail.component';
import { RemoveFileExtensionPipe } from './remove-file-extension.pipe';
import { LoginComponent } from './login/login.component';
import { PageRegistrationComponent } from './page-registration/page-registration.component';

import { AssetService } from './asset.service';
import { UserService } from './user.service';
import { CountryService } from './country.service';
import { UserLoginService } from './user-login.service';

import { SodaApiServiceProvider } from './soda-api.service.provider';
import { HypeDirective } from './hype.directive';
import { AssetCalculatorComponent } from './asset-calculator/asset-calculator.component';
import {CalculatorService} from './calculator.service';
import { LightboxBarComponent } from './lightbox-bar/lightbox-bar.component';
import {LightboxService} from './lightbox.service';
import {PreferencesService} from './preferences.service';
import { DurationPipe } from './duration.pipe';
import {UserDataService} from './user-data.service';
import {LightboxDataService} from './lightbox-data.service';
import {SupplierService} from './supplier.service';
import {SupplierDataService} from './supplier-data.service';
import { ModalDetailComponent } from './modal-detail/modal-detail.component';
import {CollectionDataService} from './collection-data.service';
import {CollectionService} from 'app/collection.service';
import { PageGalleryComponent } from './page-gallery/page-gallery.component';
import {DragulaModule} from 'ng2-dragula';
import {CartService} from './cart.service';
import {CartDataService} from './cart-data.service';
import { PageVerifyComponent } from './page-verify/page-verify.component';
import { PageDetailComponent } from './page-detail/page-detail.component';
import {WindowRefService} from './window-ref.service';
import {LocationRefService} from './location-ref.service';
import {AssetResolver} from './resolver/asset.resolver';
import {HttpTransferModule} from '@ngx-universal/state-transfer';
import {MatAutocompleteModule} from '@angular/material';
import {SuggestService} from './suggest.service';
import {ShareButtonsModule} from 'ngx-sharebuttons';
import {ClipboardModule} from 'ngx-clipboard';
import {BasketOverviewComponent} from './basket-overview/basket-overview.component';
import {BasketCheckoutComponent} from './basket-checkout/basket-checkout.component';
import {CurrencySymbolPipe} from './currency-symbol.pipe';
import {PageAccountComponent} from './page-account/page-account.component';
import {OrderListComponent} from './order-list/order-list.component';
import {OrderService} from 'app/order.service';
import {PageCheckoutSuccessComponent} from './page-checkout-success/page-checkout-success.component';
import {PageContactComponent } from './page-contact/page-contact.component';
import {PageTeamComponent } from './page-team/page-team.component';
import { PagePrivacyComponent } from './page-privacy/page-privacy.component';
import { PageTermsComponent } from './page-terms/page-terms.component';
import { PageSubmissionComponent } from './page-submission/page-submission.component';
import { PopupComponent } from './popup/popup.component';
import { PagePaymentErrorComponent } from './page-payment-error/page-payment-error.component';
import { PagePaymentDeferredComponent } from './page-payment-deferred/page-payment-deferred.component';
import { PageContributorComponent } from './page-contributor/page-contributor.component';
import { CurrentTimeComponent } from './current-time/current-time.component';
import { ProfileComponent } from './profile/profile.component';
import { PageRmvsrfComponent } from './page-rmvsrf/page-rmvsrf.component';
import { UserGuardService } from './user-guard.service';
import { PageResetPasswordComponent } from './page-reset-password/page-reset-password.component';
import { PageRequestPasswordResetTokenComponent } from './page-request-password-reset-token/page-request-password-reset-token.component';
import {OrderDataService} from './order-data.service';
import {WebseriesService} from './webseries.service';


@NgModule({
  declarations: [
    AppComponent,
    PageHeaderComponent,
    PageFooterComponent,
    PageHomepageComponent,
    PageSearchComponent,
    AssetListComponent,
    AssetThumbComponent,
    AssetDetailComponent,
    RemoveFileExtensionPipe,
    LoginComponent,
    PageRegistrationComponent,
    HypeDirective,
    AssetCalculatorComponent,
    LightboxBarComponent,
    DurationPipe,
    ModalDetailComponent,
    PageGalleryComponent,
    PageVerifyComponent,
    PageDetailComponent,
    BasketOverviewComponent,
    BasketCheckoutComponent,
    CurrencySymbolPipe,
    PageAccountComponent,
    OrderListComponent,
    PageCheckoutSuccessComponent,
    PageContactComponent,
    PageTeamComponent,
    PagePrivacyComponent,
    PageTermsComponent,
    PageSubmissionComponent,
    PopupComponent,
    PagePaymentErrorComponent,
    PagePaymentDeferredComponent,
    PageContributorComponent,
    CurrentTimeComponent,
    ProfileComponent,
    PageRmvsrfComponent,
    PageResetPasswordComponent,
    PageRequestPasswordResetTokenComponent
  ],
  imports: [
    BrowserModule.withServerTransition({appId: 'panoramic-images-app'}),
    ReactiveFormsModule,
    FormsModule,
    HttpModule,
    RoutingModule,
    Ng2Webstorage,
    DragulaModule,
    HttpTransferModule.forRoot(),
    MatAutocompleteModule,
    ShareButtonsModule.forRoot(),
    ClipboardModule
  ],
  providers: [
    AssetService,
    AssetResolver,
    UserLoginService,
    SodaApiServiceProvider,
    UserService,
    CountryService,
    CalculatorService,
    LightboxService,
    PreferencesService,
    UserDataService,
    LightboxDataService,
    SupplierService,
    SupplierDataService,
    CollectionService,
    CollectionDataService,
    CartService,
    CartDataService,
    WindowRefService,
    LocationRefService,
    SuggestService,
    OrderService,
    UserGuardService,
    OrderDataService,
    WebseriesService
  ],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA // needed to run the hype.directive
  ]
})
export class AppModule { }
