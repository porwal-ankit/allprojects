import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {

  transform(value: Date, args?: any): any {

    if ( !value || !value.getTime ) {
      return null;
    }

    let created = Math.round(value.getTime() / 1000);
    let current = Math.round(Date.now() / 1000);

    let elapsed = current - created;

    if ( elapsed < 60 ) {
      return elapsed + ' seconds';
    } else if ( elapsed < 60 * 60 ) {
      return Math.floor(elapsed / 60) + ' minutes';
    } else if ( elapsed < 60 * 60 * 24 ) {
      return Math.floor(elapsed / 60 / 60) + ' hours';
    } else if ( elapsed < 60 * 60 * 24 * 365 ) {
      return Math.floor(elapsed / 60 / 60 / 24) + ' days';
    }

    return Math.floor(elapsed / 60 / 60 / 24 / 365) + ' years';
  }

}
