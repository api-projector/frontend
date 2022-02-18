import { Pipe, PipeTransform } from '@angular/core';
import { LOCAL_SCHEMAS_LOCATOR } from '../consts';

@Pipe({name: 'stripSchemaRef'})
export class StripSchemaRefPipe implements PipeTransform {

  transform(ref: string): string {
    return ref.startsWith(LOCAL_SCHEMAS_LOCATOR) ? ref.substr(LOCAL_SCHEMAS_LOCATOR.length + 1) : ref;
  }

}
