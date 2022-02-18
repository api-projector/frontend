import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService, UI } from '@esanum/ui';
import { merge } from 'rxjs';
import { filter, finalize, map } from 'rxjs/operators';
import { deserialize, serialize } from 'serialize-ts';
import { Language } from 'src/enums/language';
import { LocalUI } from '../../../enums/local-ui';
import { SpecManager } from '../../../managers/spec.manager';
import { ProjectAsset, UploadFigmaAssetRequest } from '../../../models/figma-asset';
import { Folder } from '../../../models/folder';
import { Project } from '../../../models/project';
import { ScreenFile } from '../../../models/screen-file';
import { Spec } from '../../../models/spec';
import { processGQL } from '../../../utils/gql-errors';
import { UploadFigmaAssetGQL } from './design.graphql';
import { EditScreenComponent } from './edit-screen/edit-screen.component';
import { EditFolderComponent } from './edit-folder/edit-folder.component';

@Component({
  selector: 'app-spec',
  templateUrl: './design.component.html',
  styleUrls: ['./design.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesignComponent implements OnInit {

  ui = UI;
  localUi = LocalUI;
  language = Language;

  project!: Project;
  spec!: Spec;
  folder!: Folder;

  progress: { screens: { [key: string]: boolean } } = {screens: {}};

  removing: {
    folder?: Folder,
    screen?: ScreenFile
  } = {};

  @ViewChild('addFolderModal')
  addFolderModal!: TemplateRef<any>;

  @ViewChild('removeFolderModal')
  removeFolderModal!: TemplateRef<any>;

  @ViewChild('removeScreenModal')
  removeScreenModal!: TemplateRef<any>;

  get current() {
    return this.folder || this.spec.root;
  }

  constructor(private uploadFigmaAssetGQL: UploadFigmaAssetGQL,
              private manager: SpecManager,
              private cd: ChangeDetectorRef,
              private modal: ModalService,
              private injector: Injector,
              private cfr: ComponentFactoryResolver,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.route.data.subscribe(({project, spec, folder}) => {
      [this.project, this.spec, this.folder] = [project, spec, folder];
      this.cd.detectChanges();
    });

    this.manager.replicated$
      .pipe(filter(entities => entities.some(e => e instanceof Spec
        || e.id == this.folder?.id)))
      .subscribe(() => this.cd.detectChanges());
  }

  open(folder: Folder) {
    this.router.navigate([folder.id], {relativeTo: this.route})
      .then(() => null);
  }

  editFolder(folder: Folder | null = null) {
    const component = this.cfr.resolveComponentFactory(EditFolderComponent)
      .create(this.injector);
    const {instance} = component;
    instance.spec = this.spec;
    if (!!folder) {
      instance.folder = folder;
    }
    merge(instance.saved, instance.canceled).subscribe(() => this.modal.close());
    instance.saved.subscribe(() => this.cd.detectChanges());
    this.modal.open(component, {
      title:
        {
          text: !!folder ? $localize`:@@label.edit_folder:Edit folder` : $localize`:@@label.add_folder:Add folder`,
          icon: LocalUI.icons.folder
        },
      width: '300px'
    });
  }

  confirmRemoveFolder(folder: Folder) {
    this.removing.folder = folder;
    this.modal.open(this.removeFolderModal, {
      title: {
        text: $localize`:@@label.delete_folder:Delete folder`,
        icon: UI.icons.delete
      }
    });
  }

  removeFolder() {
    if (!!this.removing.folder) {
      this.modal.close();
      this.manager.patch(this.removing.folder.delete());
      this.cd.detectChanges();
    }
  }

  editScreen(screen: ScreenFile | null = null) {
    const component = this.cfr.resolveComponentFactory(EditScreenComponent)
      .create(this.injector);
    const {instance} = component;
    [instance.project, instance.folder] = [this.project, this.current];
    if (!!screen) {
      instance.screen = screen;
    }
    merge(instance.saved, instance.canceled).subscribe(() => this.modal.close());
    instance.saved.subscribe(s => {
      if (!!s.url && !s.thumbnail) {
        this.loadScreen(s);
      }
      this.cd.detectChanges();
    });
    this.modal.open(component, {
      title:
        {
          text: !!screen ? $localize`:@@label.edit_screen:Edit screen` : $localize`:@@label.add_screen:Add screen`,
          icon: !!screen ? UI.icons.edit : LocalUI.icons.folder
        }
    });
  }

  confirmRemoveScreen(screen: ScreenFile) {
    this.removing.screen = screen;
    this.modal.open(this.removeScreenModal, {
      title: {
        text: $localize`:@@label.delete_screen:Delete screen`,
        icon: UI.icons.delete
      }
    });
  }

  removeScreen() {
    if (this.removing.screen) {
      this.modal.close();
      this.manager.patch(this.removing.screen.delete());
      this.cd.detectChanges();
    }
  }

  loadScreen(screen: ScreenFile) {
    const request = new UploadFigmaAssetRequest({
      project: this.project.id,
      url: screen.url
    });
    this.progress.screens[screen.id] = true;
    this.cd.detectChanges();
    this.uploadFigmaAssetGQL.mutate({input: serialize(request)})
      .pipe(processGQL(), finalize(() => {
        this.progress.screens[screen.id] = false;
        this.manager.put(screen);
        this.cd.detectChanges();
      }), map(({response: {frame}}) => deserialize(frame, ProjectAsset)))
      .subscribe(asset => Object.assign(screen, {thumbnail: asset.file.url, error: null}),
        err => screen.error = err.toString());
  }

  gotoScreen(screen: ScreenFile) {
    this.router.navigate(!!this.folder ? [screen.id] : ['~', screen.id],
      {relativeTo: this.route})
      .then(() => null);
  }

  projectUpdated(project: Project) {
    this.project = project;
    this.cd.detectChanges();
  }

  close() {
    this.modal.close();
  }
}
