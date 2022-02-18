import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TableComponent, UI } from '@esanum/ui';
import { of, Subject, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Language } from 'src/enums/language';
import { LocalUI } from '../../../enums/local-ui';
import { SpecManager } from '../../../managers/spec.manager';
import { Schema } from '../../../models/schema';
import { Spec } from '../../../models/spec';
import { Examples } from '../../../utils/examples';

@Component({
  selector: 'app-schemas',
  templateUrl: './schemas.component.html',
  styleUrls: ['./schemas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchemasComponent implements OnInit, OnDestroy {

  readonly ui = UI;
  readonly localUi = LocalUI;
  readonly language = Language;
  readonly originalOrder = () => 0;

  destroyed$ = new Subject();

  spec!: Spec;
  schemas: Schema[] = [];

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
    this.route.data.subscribe(({spec}) => {
      this.spec = spec;
      this.cd.detectChanges();
      this.table.load();
    });

    this.form.valueChanges.subscribe(() => this.table.load());

    this.manager.replicated$
      .pipe(takeUntil(this.destroyed$),
        filter(entities => entities.some(e => e instanceof Spec
          || this.schemas.map(p => p.id).includes(e.id))))
      .subscribe(() => {
        this.table.load();
        this.cd.detectChanges();
      });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  fetchSchemas({q, offset, first}: { q: string, offset: number, first: number }) {
    const {schemas} = this.spec;
    const filtered = !!q
      ? schemas.filter(e => e.name.toLowerCase().indexOf(q.toLowerCase()) !== -1)
      : schemas;
    this.schemas = filtered.slice(offset, offset + first);
    return of({
      results: this.schemas,
      count: filtered.length
    });
  }

  addSchema() {
    const {schema, puts} = Examples.createSchema(this.spec);
    schema.linking({spec: this.spec});
    puts.forEach(o => this.manager.put(o));
    this.cd.detectChanges();

    this.router.navigate([schema.id, {editor: '1'}], {relativeTo: this.route})
      .then(() => null);
  }

  removeSchema(schema: Schema) {
    this.manager.patch(schema.delete());
    this.table.load();
  }

}
