import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { InputComponent, UI } from '@esanum/ui';
import { delay, finalize, map } from 'rxjs/operators';
import { deserialize, serialize } from 'serialize-ts';
import { UI_DELAY } from 'src/consts';
import { AnalyticsType } from 'src/enums/analytics-type';
import { Project, ProjectUpdate } from 'src/models/project';
import { BackendError } from 'src/types/gql-errors';
import { processGQL } from 'src/utils/gql-errors';
import { CreateProjectGQL, UpdateProjectGQL } from '../graphql';

@Component({
  selector: 'spec-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.scss']
})
export class EditProjectComponent implements AfterViewInit {

  ui = UI;
  analyticsType = AnalyticsType;

  private _project!: Project;

  progress = {saving: false, uploading: false};
  errors: BackendError[] = [];

  demoControl = this.fb.control(false);
  form = this.fb.group(
    {
      title: [null, Validators.required],
      description: [null],
      figmaIntegration: this.fb.group({
        token: [null]
      })
    }
  );

  @Input()
  set project(project: Project) {
    this._project = project;
    this.form.patchValue({
      title: project.title,
      description: project.description,
      figmaIntegration: {
        token: project.figmaIntegration?.token || null
      }
    });
  }

  get project() {
    return this._project;
  }

  @Output()
  saved = new EventEmitter<{ project: Project, demo?: boolean }>();

  @ViewChild('titleInput')
  titleInput!: InputComponent;

  @ViewChild('content', {read: ElementRef})
  backdrop!: ElementRef<HTMLElement>;

  constructor(private createProjectGQL: CreateProjectGQL,
              private updateProjectGQL: UpdateProjectGQL,
              private cd: ChangeDetectorRef,
              private fb: FormBuilder) {
  }

  ngAfterViewInit() {
    setTimeout(() => this.titleInput.focus(), 100);
  }

  save() {
    const mutation = !!this.project ? this.updateProjectGQL : this.createProjectGQL;
    const data = this.form.getRawValue();
    const request = new ProjectUpdate(data);
    this.progress.saving = true;
    mutation.mutate({id: this.project?.id, input: serialize(request)})
      .pipe(
        delay(UI_DELAY),
        processGQL(),
        finalize(() => {
          this.progress.saving = false;
          this.cd.detectChanges();
        }),
        map(({response: {project}}) => deserialize(project, Project)))
      .subscribe(project => {
          const {demo} = data;
          this.saved.emit({project, demo});
        },
        errors => this.errors = errors);
  }

}
