import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { AppConfig } from '../app/config';
import { CreateProjectGQL } from '../app/projects/graphql';
import { serialize } from 'serialize-ts';
import { Project, ProjectUpdate } from '../models/project';
import { Spec } from '../models/spec';
import { processGQL } from '../utils/gql-errors';

@Injectable({providedIn: 'root'})
export class MakeDemoGuard implements CanActivate {

  constructor(private config: AppConfig,
              private createProjectGQL: CreateProjectGQL,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<UrlTree> {
    const {demo} = route.params;
    if (demo) {
      const request = new ProjectUpdate({title: 'Demo project'});
      return this.createProjectGQL.mutate({input: serialize(request)})
        .pipe(processGQL(), switchMap(({response: {project}}) =>
          of(this.router.createUrlTree(['/projects', project.id, {demo: 1}]))));
    }

    return true;
  }

}

