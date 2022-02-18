import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { ModalService, UI } from '@esanum/ui';
import { NGXLogger } from 'ngx-logger';
import { distinctUntilChanged } from 'rxjs';
import { Language } from 'src/enums/language';
import { LocalUI } from '../../enums/local-ui';
import { ReplicationState } from '../../enums/replication-state';
import { SpecManager } from '../../managers/spec.manager';

export const I18N_SHARE_PROJECT = $localize`:@@label.share_project:Share project`;

@Component({
  selector: 'app-spec',
  templateUrl: './spec.component.html',
  styleUrls: ['./spec.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpecComponent implements OnInit, OnDestroy {

  ui = UI;
  localUi = LocalUI;
  language = Language;
  replicationState = ReplicationState;

  link!: string;

  online = true;

  @ViewChild('welcomeModal', {static: true})
  welcomeModal!: TemplateRef<any>;

  @ViewChild('offlineModal', {static: true})
  offlineModal!: TemplateRef<any>;

  @ViewChild('shareModal', {static: true})
  shareModal!: TemplateRef<any>;

  constructor(public manager: SpecManager,
              private modal: ModalService,
              private logger: NGXLogger,
              private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.manager.state.remote$.pipe(distinctUntilChanged())
      .subscribe(state => {
        if (state === ReplicationState.error) {
          this.modal.open(this.offlineModal,
            {
              title:
                {
                  icon: UI.icons.warning,
                  text: 'You are offline'
                }
            });
        }
      });
  }

  ngOnDestroy() {
    this.logger.info('destroy');
    window.removeEventListener('offline', this.offlineMode.bind(this));
    this.manager.clear();
  }

  @HostListener('window:online')
  onlineMode() {
    this.online = true;
    this.cd.detectChanges();
  }

  @HostListener('window:offline')
  offlineMode() {
    this.online = false;
    this.cd.detectChanges();
  }

  @HostListener('window:beforeunload')
  confirmClose(): boolean {
    return this.manager.state.dirty <= 0;
  }

  share() {
    this.link = location.href;
    this.modal.open(this.shareModal, {
      title: {
        icon: UI.icons.share,
        text: I18N_SHARE_PROJECT
      },
      width: 'inherit',
    });
  }

  close() {
    this.modal.close();
  }

}
