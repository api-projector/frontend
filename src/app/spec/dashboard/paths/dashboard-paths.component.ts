import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import sortBy from 'lodash/sortBy';
import { UI } from '@esanum/ui';
import { LocalUI } from 'src/enums/local-ui';
import { Examples } from 'src/utils/examples';
import { Path } from 'src/models/path';
import { Spec } from 'src/models/spec';
import { SpecManager } from '../../../../managers/spec.manager';

@Component({
  selector: 'app-dashboard-paths',
  templateUrl: './dashboard-paths.component.html',
  styleUrls: ['./dashboard-paths.component.scss']
})
export class DashboardPathsComponent implements OnInit {

  ui = UI;
  localUi = LocalUI;

  paths!: Path[];

  @Input()
  spec!: Spec;

  constructor(private manager: SpecManager,
              private cd: ChangeDetectorRef,
              public route: ActivatedRoute,
              public router: Router) {

  }

  ngOnInit(): void {
    this.paths = sortBy(this.spec.paths, p => p.committed?.at || null).reverse().slice(0, 5);
  }

  addPath() {
    const {path, puts} = Examples.createPath(this.spec);
    path.linking({spec: this.spec});
    puts.forEach(o => this.manager.put(o));
    this.cd.detectChanges();

    this.router.navigate(['paths', path.id, {editor: '1'}], {relativeTo: this.route.parent})
      .then(() => null);
  }
}
