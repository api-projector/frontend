import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UI } from '@esanum/ui';
import { of } from 'rxjs';
import { LocalUI } from 'src/enums/local-ui';
import { Project } from 'src/models/project';
import { Spec } from 'src/models/spec';

const WELCOME_KEY = 'welcome';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  ui = UI;
  localUi = LocalUI;

  project!: Project;
  spec!: Spec;

  widgets = {welcome: localStorage[WELCOME_KEY] !== undefined};

  constructor(
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.data.subscribe(({project, spec}) => {
      [this.project, this.spec] = [project, spec];
      this.cd.detectChanges();
    });
  }

  hello() {
    localStorage.setItem(WELCOME_KEY, 'yes');
    this.widgets.welcome = true;
    this.cd.detectChanges();
  }
}
