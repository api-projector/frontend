import { Pipe, PipeTransform } from '@angular/core';
import { filter } from 'lodash';
import { Path } from 'src/models/path';

@Pipe({name: 'filterPaths'})
export class FilterPathsPipe implements PipeTransform {

  transform(paths: Path[], query: string): Path[] {
    return filter(paths, ({url}) => url.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }

}
