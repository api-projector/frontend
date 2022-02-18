import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverInstance, UI } from '@esanum/ui';
import * as  merge from 'deepmerge';
import * as YAML from 'js-yaml';
import { clone } from 'lodash';
import { filter } from 'rxjs/operators';
import { CURRENT_LANGUAGE, LOCAL_SCHEMAS_LOCATOR, YAML_OPTIONS } from '../../../../consts';
import { SCHEMA_SCHEMA_V3_0 } from '../../../../consts/open-api';
import { EditMode } from '../../../../enums/edit-mode';
import { Language } from '../../../../enums/language';
import { SpecManager } from '../../../../managers/spec.manager';
import { Schema } from '../../../../models/schema';
import { MeUser } from '../../../../models/user';

export function nameWithSpacesValidator(control: AbstractControl) {
  return /\s+/.test(control.value) ? {nameWithSpaces: true} : {};
}

@Component({
  selector: 'app-edit-schema',
  templateUrl: './edit-schema.component.html',
  styleUrls: ['./edit-schema.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditSchemaComponent implements OnInit {

  ui = UI;
  language = Language;
  consts = {
    language: CURRENT_LANGUAGE,
    schema: SCHEMA_SCHEMA_V3_0
  };
  editMode = EditMode;
  originalOrder = () => 0;

  instance: { popover?: PopoverInstance } = {};
  private _schema!: Schema;

  mode: EditMode = EditMode.view;
  me!: MeUser;

  set schema(schema: Schema) {
    this._schema = schema;
    this.updateForm();
  }

  get schema() {
    return this._schema;
  }

  form = this.fb.group({
    name: [null, [Validators.required, nameWithSpacesValidator]],
    editor: [null]
  });

  constructor(private manager: SpecManager,
              private cd: ChangeDetectorRef,
              private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    const {editor} = this.route.snapshot.params;
    this.mode = !!editor ? EditMode.edit : EditMode.view;

    this.route.data.subscribe(({me, schema}) => {
      [this.me, this.schema] = [me, schema];
      this.cd.detectChanges();
    });

    this.form.valueChanges.subscribe(({name, editor: {yaml, json}}) => {
      if (this.form.valid) {
        Object.assign(this.schema, {name, yaml, json});
        this.manager.put(this.schema, this.me);
        this.cd.detectChanges();
      }
    });

    this.manager.replicated$
      .pipe(filter(entities => entities.some(e => e === this.schema)))
      .subscribe(() => {
        this.updateForm();
        this.cd.detectChanges();
      });
  }

  updateForm() {
    const {name, yaml, json} = this.schema;
    this.form.patchValue({
      name: name,
      editor: {
        yaml: yaml,
        json: json
      }
    }, {emitEvent: false});
  }

  addStringField() {
    this.addData({
      type: 'object',
      properties: {
        property: {
          type: 'string',
          nullable: false,
          example: 'Example data'
        }
      }
    });
  }

  addNumberField() {
    this.addData({
      type: 'object',
      properties: {
        property: {
          type: 'integer',
          format: 'int64',
          nullable: false,
          example: 1
        }
      }
    });
  }

  addBooleanField() {
    this.addData({
      type: 'object',
      properties: {
        property: {
          type: 'boolean',
          nullable: false,
          example: true
        }
      }
    });
  }

  addEnumField() {
    this.addData({
      type: 'object',
      properties: {
        property: {
          type: 'string',
          nullable: false,
          example: 'first',
          enum: ['first', 'second', 'third']
        }
      }
    });
  }

  addSchemaField(schema: Schema) {
    this.addData({
      type: 'object',
      properties: {
        [schema.name.toLowerCase()]: {
          type: 'object',
          $ref: `${LOCAL_SCHEMAS_LOCATOR}/${schema.name}`
        }
      }
    });
  }

  addArrayField(schema: Schema) {
    this.addData({
      type: 'object',
      properties: {
        [schema.name.toLowerCase()]: {
          type: 'array',
          items: {
            $ref: `${LOCAL_SCHEMAS_LOCATOR}/${schema.name}`
          }
        }
      }
    });
  }

  setMapField(schema: Schema) {
    this.addData({
      type: 'object',
      properties: {
        [schema.name.toLowerCase()]: {
          type: 'object',
          additionalProperties: {
            $ref: `${LOCAL_SCHEMAS_LOCATOR}/${schema.name}`
          }
        }
      }
    });
  }

  addData(data: Object) {
    const json = merge(clone(this.schema.json), data);
    const yaml = YAML.dump(json, YAML_OPTIONS);
    this.form.patchValue({editor: {yaml}}, {emitEvent: false});

    Object.assign(this.schema, {yaml, json});
    this.manager.put(this.schema);
    this.cd.detectChanges();
  }

  gotoScheme(id: string) {
    this.router.navigate(['..', id], {relativeTo: this.route});
  }

}
