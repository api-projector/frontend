import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UI } from '@esanum/ui';
import { finalize, map } from 'rxjs/operators';
import { deserialize, serialize } from 'serialize-ts';
import { AnalyticsType } from 'src/enums/analytics-type';
import { CURRENT_LANGUAGE } from '../../../../consts';
import { Language } from '../../../../enums/language';
import { Project, ProjectUpdate } from '../../../../models/project';
import { BackendError } from '../../../../types/gql-errors';
import { processGQL } from '../../../../utils/gql-errors';
import { SetFigmaTokenGQL } from './graphql';

@Component({
  selector: 'app-set-figma-token',
  templateUrl: './set-figma-token.component.html',
  styleUrls: ['./set-figma-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetFigmaTokenComponent {

  ui = UI;
  language = Language;
  consts = {language: CURRENT_LANGUAGE};
  analyticsType = AnalyticsType;

  progress = {saving: false};
  errors: BackendError[] = [];

  @Input()
  project!: Project;

  @Output()
  updated = new EventEmitter<Project>();

  form = this.fb.group({
    figmaIntegration: this.fb.group({
      token: [null, Validators.required]
    })
  });

  constructor(private setFigmaTokenGQL: SetFigmaTokenGQL,
              private fb: FormBuilder,
              private cd: ChangeDetectorRef) {
  }

  save() {
    const request = new ProjectUpdate(this.form.getRawValue());
    this.progress.saving = true;
    this.cd.detectChanges();
    this.setFigmaTokenGQL.mutate({id: this.project?.id, input: serialize(request)})
      .pipe(processGQL(), finalize(() => {
          this.progress.saving = false;
          this.cd.detectChanges();
        }),
        map(({response: {project}}) => deserialize(project, Project)))
      .subscribe(project => this.updated.emit(project),
        errors => this.errors = errors);
  }

}
