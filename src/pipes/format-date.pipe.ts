import { Pipe, PipeTransform } from '@angular/core';
import {
  format as dfnsFormat,
  formatDistanceToNow as dfnsFormatDistanceToNow,
} from 'date-fns';

import {DFNS_LOCALE} from "../consts";

@Pipe({name: 'formatDate'})
export class FormatDatePipe implements PipeTransform {
  transform(date: Date, pattern: string): string {
    return pattern == 'relative'
      ? dfnsFormatDistanceToNow(date, {locale: DFNS_LOCALE, addSuffix: true})
      : dfnsFormat(date, pattern, {locale: DFNS_LOCALE})
  }
}
