import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeFileExtension'
})
export class RemoveFileExtensionPipe implements PipeTransform {

  transform(value: string): string {
    let pos = value.lastIndexOf('.');
    if ( pos !== -1 ) {
      value = value.substr(0, pos);
    }
    return value;
  }

}
