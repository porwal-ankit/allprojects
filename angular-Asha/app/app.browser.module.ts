import {NgModule} from '@angular/core';

import {AppModule} from './app.module';
import {AppComponent} from './app.component';
import {BrowserStateTransferModule} from '@ngx-universal/state-transfer';

@NgModule({
    imports: [
        AppModule,
        BrowserStateTransferModule.forRoot(),
    ],
    bootstrap: [AppComponent],
})
export class AppBrowserModule {}
