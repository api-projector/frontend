import { Pipe, PipeTransform } from '@angular/core';
import { HttpMethods } from '../enums/http-methods';
import { LocalUI } from '../enums/local-ui';
import { Spec } from '../models/spec';
import { uniq } from 'lodash';

@Pipe({name: 'methodColor'})
export class MethodColorPipe implements PipeTransform {

  transform(method: HttpMethods): string {
    switch (method) {
      case HttpMethods.post:
        return LocalUI.colors.methods.post;
      case HttpMethods.put:
        return LocalUI.colors.methods.put;
      case HttpMethods.patch:
        return LocalUI.colors.methods.patch;
      case HttpMethods.delete:
        return LocalUI.colors.methods.delete;
      case HttpMethods.options:
        return LocalUI.colors.methods.options;
      case HttpMethods.head:
        return LocalUI.colors.methods.head;
      case HttpMethods.trace:
        return LocalUI.colors.methods.trace;
      case HttpMethods.get:
      default:
        return LocalUI.colors.methods.get;
    }
  }

}
