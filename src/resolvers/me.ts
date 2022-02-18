import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { deserialize } from 'serialize-ts';
import { MeUser } from 'src/models/user';
import { AppConfig } from '../app/config';
import { MeGQL } from './graphql';
import { PROD_MODE } from '../consts';
import { getMock } from '@junte/mocker';
import { processGQL } from '../utils/gql-errors';

@Injectable({providedIn: 'root'})
export class MeUserResolver implements Resolve<Observable<MeUser | null>> {

  constructor(private config: AppConfig,
              private meGQL: MeGQL) {
  }

  resolve(route: ActivatedRouteSnapshot,
          state: RouterStateSnapshot): Observable<MeUser | null> {
    if (!this.config.token) {
      return of(null);
    }

    return PROD_MODE
      ? this.meGQL.fetch()
        .pipe(processGQL(),
          map(({me}) => !!me ? deserialize(me, MeUser) : null))
      : of(getMock(MeUser));
  }
}
