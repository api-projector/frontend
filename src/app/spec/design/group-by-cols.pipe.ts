import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'groupByCols'})
export class GroupByColsPipe implements PipeTransform {
  transform(arr: Screen[]): Screen[][] {
    return arr.map((value, i, arr) =>
      arr.slice(i * 3, i * 3 + 3)).filter((sub) => sub.length);
  }
}
