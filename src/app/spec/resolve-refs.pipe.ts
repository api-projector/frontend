import { Pipe, PipeTransform } from '@angular/core';
import { Resolver } from '@stoplight/json-ref-resolver';
import * as merge from 'deepmerge';
import { Observable } from 'rxjs';
import { LOCAL_SCHEMAS_LOCATOR } from '../../consts';
import { Spec } from '../../models/spec';
import { KeyValue } from '../../types/key-value';
import { resolveHttp } from '@stoplight/json-ref-readers/http';

@Pipe({name: 'resolveRefs'})
export class ResolveRefsPipe implements PipeTransform {

  transform(json: KeyValue, spec: Spec): Observable<KeyValue> {
    const resolver = new Resolver({
      resolvers: {
        https: {resolve: resolveHttp},
        http: {resolve: resolveHttp}
      },
    });
    const schemas = {};
    spec.schemas.forEach(schema => schemas[schema.name] = merge(schema.json, {
      id: schema.id,
      ref$: `${LOCAL_SCHEMAS_LOCATOR}/${schema.name}`
    }));
    const obj = merge(json, {components: {schemas}});
    return new Observable<KeyValue>(o => {
      resolver.resolve(obj)
        .then(({result}) => {
          o.next(result);
          o.complete();
        });
    });
  }

}
