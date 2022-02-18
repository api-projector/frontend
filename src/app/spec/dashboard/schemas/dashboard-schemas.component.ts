import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import sortBy from 'lodash/sortBy';
import { UI } from '@esanum/ui';
import { LocalUI } from 'src/enums/local-ui';
import { Examples } from 'src/utils/examples';
import { Schema } from 'src/models/schema';
import { Spec } from 'src/models/spec';
import { SpecManager } from '../../../../managers/spec.manager';

@Component({
  selector: 'app-dashboard-schemas',
  templateUrl: './dashboard-schemas.component.html',
  styleUrls: ['./dashboard-schemas.component.scss']
})
export class DashboardSchemasComponent implements OnInit {

  ui = UI;
  localUi = LocalUI;

  schemas!: Schema[];

  @Input()
  spec!: Spec;

  constructor(private manager: SpecManager,
              private cd: ChangeDetectorRef,
              public route: ActivatedRoute,
              public router: Router) {
  }

  ngOnInit(): void {
    this.schemas = sortBy(this.spec.schemas, s => s.committed?.at || null).reverse().slice(0, 5);
  }

  addSchema() {
    const {schema, puts} = Examples.createSchema(this.spec);
    schema.linking({spec: this.spec});
    puts.forEach(o => this.manager.put(o));
    this.cd.detectChanges();

    this.router.navigate(['schemas', schema.id, {editor: '1'}], {relativeTo: this.route.parent})
      .then(() => null);
  }
}
