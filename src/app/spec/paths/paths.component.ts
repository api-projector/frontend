import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TableComponent, UI } from '@esanum/ui';
import { of, Subject, takeUntil } from 'rxjs';
import { filter, finalize } from 'rxjs/operators';
import { Language } from 'src/enums/language';
import { HttpMethods } from '../../../enums/http-methods';
import { LocalUI } from '../../../enums/local-ui';
import { SpecManager } from '../../../managers/spec.manager';
import { Path } from '../../../models/path';
import { Project } from '../../../models/project';
import { Spec } from '../../../models/spec';
import { Examples } from '../../../utils/examples';

@Component({
  selector: 'app-paths',
  templateUrl: './paths.component.html',
  styleUrls: ['./paths.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PathsComponent implements OnInit, OnDestroy {

  ui = UI;
  localUi = LocalUI;
  language = Language;
  httpMethods = HttpMethods;

  destroyed$ = new Subject();

  project!: Project;
  spec!: Spec;
  paths: Path[] = [];

  form = this.fb.group({
    table: {
      q: null,
      first: 10,
      offset: 0
    }
  });

  @ViewChild('table', {static: true})
  table!: TableComponent;

  constructor(private manager: SpecManager,
              private cd: ChangeDetectorRef,
              private fb: FormBuilder,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.route.data.subscribe(({project, spec}) => {
      [this.project, this.spec] = [project, spec];
      this.cd.detectChanges();
      this.table.load();
    });

    this.form.valueChanges.subscribe(() => this.table.load());

    this.manager.replicated$
      .pipe(takeUntil(this.destroyed$),
        filter(entities => entities.some(e => e instanceof Spec
          || this.paths.map(p => p.id).includes(e.id))))
      .subscribe(() => {
        this.table.load();
        this.cd.detectChanges();
      });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  fetchPaths({q, offset, first}: { q: string, offset: number, first: number }) {
    const {paths} = this.spec;
    const filtered = !!q
      ? paths.filter(e => e.url.toLowerCase().indexOf(q.toLowerCase()) !== -1)
      : paths;
    this.paths = filtered.slice(offset, offset + first)
    return of({
      results: this.paths,
      count: filtered.length
      // TODO: why should I do it?
    }).pipe(finalize(() => this.cd.markForCheck()));
  }

  addPath() {
    const {path, puts} = Examples.createPath(this.spec);
    path.linking({spec: this.spec});
    puts.forEach(o => this.manager.put(o));
    this.cd.detectChanges();

    this.router.navigate([path.id, {editor: '1'}], {relativeTo: this.route})
      .then(() => null);
  }

  removePath(path: Path) {
    this.manager.patch(path.delete());
    this.table.load();
  }

  gotoScheme(id: string) {
    this.router.navigate(['projects', this.project.id, 'schemas', id]);
  }

}
