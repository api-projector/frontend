import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UI } from '@esanum/ui';
import { CURRENT_LANGUAGE } from '../../../../consts';
import { Language } from '../../../../enums/language';
import { SpecManager } from '../../../../managers/spec.manager';
import { Folder } from '../../../../models/folder';
import { Spec } from '../../../../models/spec';

@Component({
  selector: 'app-edit-folder',
  templateUrl: './edit-folder.component.html',
  styleUrls: ['./edit-folder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditFolderComponent {

  ui = UI;
  language = Language;
  consts = {language: CURRENT_LANGUAGE};

  private _folder!: Folder;

  form = this.fb.group({
    name: [null, [Validators.required]]
  });

  @Input()
  spec!: Spec;

  @Input()
  set folder(folder: Folder) {
    this._folder = folder;
    this.form.patchValue({
      name: folder?.name
    });
  }

  get folder() {
    return this._folder;
  }

  @Output()
  saved = new EventEmitter<Folder>();

  @Output()
  canceled = new EventEmitter();

  constructor(private manager: SpecManager,
              private fb: FormBuilder,
              private cd: ChangeDetectorRef) {
  }

  save() {
    !!this.folder ? this.edit() : this.add();
  }

  add() {
    const {name} = this.form.getRawValue();
    const f = new Folder({name});
    const links = f.new();
    links.push(f);
    links.forEach(o => this.manager.put(o));

    f.linking({spec: this.spec});

    this.spec.addFolder(f);
    this.manager.put(this.spec);

    this.saved.emit(f);
  }

  edit() {
    const {name} = this.form.getRawValue();
    Object.assign(this.folder, {name});
    this.manager.put(this.folder);

    this.saved.emit(this.folder);
    this.cd.detectChanges();
  }

  cancel() {
    this.canceled.emit();
  }
}
