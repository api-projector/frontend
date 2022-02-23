import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UI} from '@esanum/ui';
import {Language} from 'src/enums/language';
import {AppConfig} from '../../app/config';
import {CURRENT_LANGUAGE} from '../../consts';
import {LocalUI} from '../../enums/local-ui';
import {MeUser} from '../../models/user';

@Component({
  selector: 'spec-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent {

  ui = UI;
  localUi = LocalUI;
  language = Language;
  consts = {language: CURRENT_LANGUAGE};

  me!: MeUser;

  @ViewChild('layout', {read: ElementRef, static: true})
  backdrop!: ElementRef<HTMLElement>;

  constructor(public config: AppConfig,
              private route: ActivatedRoute,
              private router: Router,
              private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.route.data.subscribe(({me}) => {
      this.me = me;
      this.cd.detectChanges();
    });
  }

  logout() {
    this.config.token = null;
    this.cd.detectChanges();
    this.router.navigate(['/login']);
  }

  createIssue() {
    open('https://github.com/api-projector/api-projector/issues');
  }

}
