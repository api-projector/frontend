import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import orderBy from 'lodash/orderBy'
import { UI } from '@esanum/ui';
import { LocalUI } from 'src/enums/local-ui';
import { ScreenFile } from 'src/models/screen-file';
import { Spec } from 'src/models/spec';

class Summary {
  screens!: number;
}

@Component({
  selector: 'app-dashboard-designs',
  templateUrl: './dashboard-designs.component.html',
  styleUrls: ['./dashboard-designs.component.scss']
})
export class DashboardDesignsComponent implements OnInit {

  ui = UI;
  localUi = LocalUI;

  screens: ScreenFile[] = [];
  summary = new Summary();

  @Input()
  spec!: Spec;

  constructor(
    public route: ActivatedRoute,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.screens = this.spec.folders.reduce((screens, f) =>
      screens.concat(f.screens), this.spec.root.screens);

    this.summary.screens = this.screens.length;
    this.screens = orderBy(this.screens, s => s.committed?.at, ['desc']).slice(0, 4);
  }

  gotoScreen(screen: ScreenFile) {
    this.router.navigate(
      ['../design', !!screen.folder.name ? screen.folder.id : '~', screen.id],
      {relativeTo: this.route})
      .then(() => null);
  }
}
