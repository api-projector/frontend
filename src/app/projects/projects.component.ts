import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  Injector,
  OnInit, TemplateRef, ViewChild
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ModalService, PopoverInstance, UI} from '@esanum/ui';
import {delay, finalize, map} from 'rxjs/operators';
import {deserialize} from 'serialize-ts';
import {AnalyticsType} from 'src/enums/analytics-type';
import {PagingProjects, Project, ProjectsFilter} from 'src/models/project';
import {PROD_MODE, UI_DELAY} from '../../consts';
import {LocalUI} from '../../enums/local-ui';
import {MeUser} from '../../models/user';
import {processGQL} from '../../utils/gql-errors';
import {EditProjectComponent} from './edit-project/edit-project.component';
import {AllProjectsGQL, DeleteProjectGQL} from './graphql';
import {PROP_DECORATORS} from "@angular/compiler-cli/ngcc/src/host/esm2015_host";
import {getMock} from "@junte/mocker";
import {of} from "rxjs";

export const I18N_ADD_PROJECT = $localize`:@@label.add_project:Add project`;
export const I18N_EDIT_PROJECT = $localize`:@@label.edit_project:Edit project`;
export const I18N_DELETE_PROJECT = $localize`:@@label.delete_project:Delete project`;

@Component({
  selector: 'spec-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsComponent implements OnInit {

  ui = UI;
  localUi = LocalUI;
  analyticsType = AnalyticsType;

  private filter!: ProjectsFilter;

  progress = { loading: false };
  reference: { popover: PopoverInstance | null } = {popover: null};

  me!: MeUser;
  projects: Project[] = [];

  removing: { project?: Project } = {}

  @ViewChild('removeProjectModal')
  removeProjectModal!: TemplateRef<any>;

  constructor(private deleteProjectGQL: DeleteProjectGQL,
              private allProjectsGQL: AllProjectsGQL,
              public modal: ModalService,
              private injector: Injector,
              private cfr: ComponentFactoryResolver,
              private route: ActivatedRoute,
              private router: Router,
              private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.route.data.subscribe(({me}) => this.me = me);
    this.load();
  }

  load() {
    this.progress.loading = true;
    this.cd.detectChanges();
    const action = PROD_MODE
      ? this.allProjectsGQL.fetch(this.filter)
        .pipe(processGQL(),
          map(({projects}) => deserialize(projects, PagingProjects)))
      : of(getMock(PagingProjects)).pipe(delay(UI_DELAY));
    action.pipe(finalize(() => {
      this.progress.loading = false;
      this.cd.detectChanges();
    })).subscribe(paging => this.projects = paging.results);
  }

  trackProject(index: number, project: Project) {
    return project.id;
  }

  add() {
    const factory = this.cfr.resolveComponentFactory(EditProjectComponent);
    const component = factory.create(this.injector);
    component.instance.saved.subscribe(({project}) => this.goto(project));
    this.modal.open(component, {
      title: {
        icon: LocalUI.icons.project,
        text: I18N_ADD_PROJECT
      }
    });
  }

  edit(project: Project, index: number) {
    const factory = this.cfr.resolveComponentFactory(EditProjectComponent);
    const component = factory.create(this.injector);
    component.instance.project = project;
    component.instance.saved.subscribe(({project: p}) => {
      this.modal.close();
      this.projects[index] = p;
      this.cd.detectChanges();
    });
    this.modal.open(component, {
      title: {
        icon: LocalUI.icons.project,
        text: I18N_EDIT_PROJECT
      }
    });
  }

  goto(project: Project) {
    this.modal.close();
    this.load();
    this.router.navigate([project.id], {relativeTo: this.route});
  }

  confirmRemove(project: Project) {
    this.removing.project = project;
    this.modal.open(this.removeProjectModal, {
      title: {
        text: I18N_DELETE_PROJECT,
        icon: UI.icons.delete
      }
    });
  }

  remove() {
    if (this.removing.project) {
      this.modal.close();
      const id = this.removing.project.id;
      this.deleteProjectGQL.mutate({id})
        .subscribe(() => this.load());
    }
  }

  close() {
    this.modal.close();
  }
}
