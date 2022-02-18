import {Pipe, PipeTransform} from '@angular/core';
import {Spec} from '../../models/spec';
import {uniq} from 'lodash';

@Pipe({name: 'allTags'})
export class AllTagsPipe implements PipeTransform {

  transform(spec: Spec): string[] {
    const all = spec.paths.reduce((r, p) =>
      r.concat(p.tags), [] as string[]);
    return uniq(all);
  }

}
