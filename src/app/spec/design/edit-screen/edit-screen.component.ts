import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {FormComponent, UI, UploadImageData} from '@esanum/ui';
import {CURRENT_LANGUAGE} from '../../../../consts';
import {Language} from '../../../../enums/language';
import {SpecManager} from '../../../../managers/spec.manager';
import {Folder} from '../../../../models/folder';
import {ScreenFile} from '../../../../models/screen-file';
import {UploadImageProjectAssetInput} from "../../../../models/image";
import {processGQL} from "../../../../utils/gql-errors";
import {finalize, map} from "rxjs/operators";
import {deserialize, serialize} from "serialize-ts";
import {UploadImageAssetGQL} from "../design.graphql";
import {Project} from "../../../../models/project";
import {assign} from "lodash";
import {ProjectAsset} from "../../../../models/figma-asset";

@Component({
  selector: 'spec-edit-screen',
  templateUrl: './edit-screen.component.html',
  styleUrls: ['./edit-screen.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class EditScreenComponent {

  ui = UI;
  language = Language;
  consts = {language: CURRENT_LANGUAGE};

  private _screen!: ScreenFile;

  progress = {uploading: false};

  @Input()
  project!: Project;

  @Input()
  folder!: Folder;

  form = this.fb.group({
    name: [null, [Validators.required]],
    thumbnail: [null],
    url: [null]
  });

  @Input()
  set screen(screen: ScreenFile) {
    this._screen = screen;
    this.form.patchValue({
      url: screen?.url || null,
      name: screen?.name || null,
      thumbnail: screen?.thumbnail || null
    });
  }

  get screen() {
    return this._screen;
  }

  @ViewChild('formRef', {read: FormComponent})
  formRef!: FormComponent;

  @Output()
  saved = new EventEmitter<ScreenFile>();

  @Output()
  canceled = new EventEmitter();

  constructor(private uploadImageAssetGQL: UploadImageAssetGQL,
              private manager: SpecManager,
              private fb: FormBuilder,
              private cd: ChangeDetectorRef) {
  }

  uploadThumbnail = (data: UploadImageData) => {
    const request = new UploadImageProjectAssetInput(data);
    assign(request, {project: this.project.id});
    this.progress.uploading = true;
    this.cd.detectChanges();
    return this.uploadImageAssetGQL.mutate({input: serialize(request)},
      {
        context: {
          useMultipart: true
        }
      }).pipe(finalize(() => {
        this.progress.uploading = false;
        this.cd.detectChanges();
      }),
      processGQL(),
      map(({response: {image}}) => deserialize(image, ProjectAsset).file));
  };

  save() {
    !!this.screen ? this.edit() : this.add();
  }

  add() {
    const {url, name} = this.form.getRawValue();
    const screen = new ScreenFile({url, name});
    const links = screen.new();
    links.push(screen);
    links.forEach(o => this.manager.put(o));

    screen.linking({folder: this.folder});

    this.folder.addScreen(screen);
    this.manager.put(this.folder);
    this.cd.detectChanges();

    this.saved.emit(screen);
  }

  submitForm = () => {
    console.log(this.formRef);
    //this.formRef.submit();
  };

  edit() {
    const {url, name, thumbnail} = this.form.getRawValue();
    Object.assign(this.screen, {url, name, thumbnail});
    this.manager.put(this.screen);

    this.saved.emit(this.screen);
    this.cd.detectChanges();
  }

}
