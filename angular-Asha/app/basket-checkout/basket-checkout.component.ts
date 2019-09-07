import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {CartDataService} from '../cart-data.service';
import {PreferencesService} from '../preferences.service';
import {OrderService} from '../order.service';
import {Order} from '../models/order';
import {OrderDataService} from '../order-data.service';

@Component({
  selector: 'app-basket-checkout',
  templateUrl: './basket-checkout.component.html',
  styleUrls: ['./basket-checkout.component.css']
})
export class BasketCheckoutComponent implements OnInit {

  public errorMsg: string = '';
  public order: Order;
  public paymentOptions = [];
  public formData = null;

  private tokenPaymentType = 'payment_type';

  @ViewChild('paymentFormTag') paymentFormTag;

  paymentForm: FormGroup = this.fb.group({
      type: new FormControl(''),
      note: new FormControl(''),
      purchaseOrderNum: new FormControl('')
  });

  constructor(
      private fb: FormBuilder,
      private cartDataService: CartDataService,
      private orderService: OrderService,
      private preferenceService: PreferencesService,
      private orderDataService: OrderDataService
    ) {
      this.orderDataService.loadOrder();
  }

  ngOnInit() {
      this.orderDataService.order.subscribe( order => {
          if( !order ) {
              this.order = null;
              return;
          }

          this.order = order;

          this.orderService.getOptions(this.order.id).subscribe( options => {
              let paymentOptions = [];
              for( let option of options ) {
                  paymentOptions.push(option.type);
              }

              this.paymentOptions = paymentOptions;

              this.setDefaultPaymentType();
          });

      });

  }

  setDefaultPaymentType() {
      let type = 'authorizenet';
      let storedType = this.preferenceService.get(this.tokenPaymentType);
      if( storedType && this.isOptionAvailable(storedType) ) {
          type = storedType;
      } else {
          type = this.isOptionAvailable('invoice') ? 'invoice' : 'authorizenet';
      }

      this.preferenceService.set(this.tokenPaymentType, type);
      this.paymentForm.controls['type'].setValue(type);
  }

  continuePayment() {
      let type = this.paymentForm.getRawValue().type;
      if( !type || !(this.paymentOptions.indexOf(type) > -1) ) {
          return;
      }

      this.preferenceService.set(this.tokenPaymentType, type);

      this.orderService.getFormData( this.order.id, type ).subscribe( data => {
          this.formData = data;
          window.setTimeout(() => this.proceedPayment(), 300);
      });
  }

  proceedPayment() {
      this.paymentFormTag.nativeElement.submit();
  }

  isOptionAvailable(type: string) {
      return (this.paymentOptions.indexOf(type) > -1);
  }
}
