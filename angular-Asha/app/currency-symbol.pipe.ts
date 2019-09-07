import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencySymbol'
})
export class CurrencySymbolPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    value = value ? value.toLowerCase() : '';
    if ( value === 'usd' ) {
      return '$';
    } else if ( value === 'eur' ) {
      return '€';
    }

    return 'CHF';
  }

}
