import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { delay, finalize, map } from 'rxjs/operators';
import { deserialize } from 'serialize-ts';
import { SpecManager } from '../../managers/spec.manager';
import { Path } from '../../models/path';
import { Folder } from '../../models/folder';
import { Project } from '../../models/project';
import { Schema } from '../../models/schema';
import { ScreenFile } from '../../models/screen-file';
import { Spec } from '../../models/spec';
import { SchemeInvalidError } from '../../types/errors';
import { processGQL } from '../../utils/gql-errors';
import { ProjectGQL } from './spec.graphql';
import { UI_DELAY, USE_MOCKS } from "../../consts";
import { getMock } from "@junte/mocker";
import { NotFoundError } from "../../types/gql-errors";

@Injectable({providedIn: 'root'})
export class ProjectResolver implements Resolve<Observable<Project>> {

  constructor(private projectGQL: ProjectGQL) {
  }

  resolve(route: ActivatedRouteSnapshot,
          state: RouterStateSnapshot): Observable<Project> {
    const {project} = route.params;
    return USE_MOCKS
      ? of(getMock(Project)).pipe(delay(UI_DELAY))
      : this.projectGQL.fetch({id: project})
        .pipe(processGQL(),
          map(({project}) => deserialize(project, Project)));
  }
}

@Injectable({providedIn: 'root'})
export class SpecResolver implements Resolve<Spec> {

  constructor(private projectGQL: ProjectGQL,
              private manager: SpecManager,
              private router: Router) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Spec> {
    const {project, demo} = route.params;
    return new Observable(o => {
      const action = USE_MOCKS
        ? of(getMock(Project)).pipe(delay(UI_DELAY))
        : this.projectGQL.fetch({id: project})
          .pipe(processGQL(), map(({project: p}) => deserialize(p, Project)));
      action.pipe(switchMap(p => this.manager.get(p.dbName, demo)),
        finalize(() => o.complete()))
        .subscribe(s => o.next(s), err => {
          if (err instanceof SchemeInvalidError) {
            this.router.navigate(['projects', project, 'updating'])
              .then(() => null);
          } else if (err instanceof NotFoundError) {
            this.router.navigate(['projects', {error: 'not_found'}])
              .then(() => null);
          } else {
            o.error(err);
          }
        });
    });
  }
}

@Injectable({providedIn: 'root'})
export class FolderResolver implements Resolve<Observable<Folder | null>> {

  constructor(private router: Router) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Folder | null> {
    const {project, folder} = route.params;
    const {spec} = route.parent?.data as { spec: Spec };
    return new Observable(o => {
      const f = spec.folders.find(f => f.id === folder);
      if (!!f) {
        o.next(f);
      } else {
        this.router.navigate(['projects', project, 'design'])
          .then(() => null);
      }
      o.complete();
    });
  }
}

@Injectable({providedIn: 'root'})
export class ScreenResolver implements Resolve<Observable<ScreenFile | null>> {

  constructor(private router: Router) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ScreenFile | null> {
    const {project, screen} = route.params;
    const {folder, spec} = route.parent?.data as { folder: Folder, spec: Spec };
    return new Observable(o => {
      const s = (folder || spec.root).screens.find(f => f.id === screen);
      if (!!s) {
        o.next(s);
      } else {
        this.router.navigate(['projects', project, 'design'])
          .then(() => null);
      }
      o.complete();
    });
  }
}

@Injectable({providedIn: 'root'})
export class PathResolver implements Resolve<Observable<Path | null>> {

  constructor(private router: Router) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Path | null> {
    const {project, path} = route.params;
    const {spec} = route.parent?.data as { spec: Spec };
    return new Observable(o => {
      const p = spec.paths.find(f => f.id === path);
      if (!!p) {
        o.next(p);
      } else {
        this.router.navigate(['projects', project, 'paths'])
          .then(() => null);
      }
      o.complete();
    });
  }
}

@Injectable({providedIn: 'root'})
export class SchemaResolver implements Resolve<Observable<Schema | null>> {

  constructor(private router: Router) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Schema | null> {
    const {project, schema} = route.params;
    const {spec} = route.parent?.data as { spec: Spec };
    return new Observable(o => {
      const s = spec.schemas.find(f => f.id === schema);
      if (!!s) {
        o.next(s);
      } else {
        this.router.navigate(['projects', project, 'schemas'])
          .then(() => null);
      }
      o.complete();
    });
  }
}

