import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {PopoverInstance, UI} from '@esanum/ui';
import * as  merge from 'deepmerge';
import * as YAML from 'js-yaml';
import {filter} from 'rxjs/operators';
import {CURRENT_LANGUAGE} from '../../../../consts';
import {OPERATION_SCHEMA_V3_0} from '../../../../consts/open-api';
import {EditMode} from '../../../../enums/edit-mode';
import {HttpMethods} from '../../../../enums/http-methods';
import {Language} from '../../../../enums/language';
import {LocalUI} from '../../../../enums/local-ui';
import {SpecManager} from '../../../../managers/spec.manager';
import {Path, PathInJson} from '../../../../models/path';
import {Project} from '../../../../models/project';
import {Schema} from '../../../../models/schema';
import {assign} from 'lodash';
import {MeUser} from '../../../../models/user';
import {KeyValue} from "../../../../types/key-value";

export function urlWithSpacesValidator(control: AbstractControl) {
  return /\s+/.test(control.value) ? {urlWithSpaces: true} : {};
}

const YAML_OPTIONS = {noArrayIndent: true};

@Component({
  selector: 'app-edit-path',
  templateUrl: './edit-path.component.html',
  styleUrls: ['./edit-path.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditPathComponent implements OnInit {

  readonly ui = UI;
  readonly localUi = LocalUI;
  readonly language = Language;
  readonly httpMethods = HttpMethods;
  readonly consts = {
    language: CURRENT_LANGUAGE,
    operation: OPERATION_SCHEMA_V3_0
  };
  readonly editMode = EditMode;
  readonly originalOrder = () => 0;

  private _path!: Path;

  mode: EditMode = EditMode.view;

  instance: { popover?: PopoverInstance } = {};
  created: { tags: string[] } = {tags: []};

  me!: MeUser;
  project!: Project;

  set path(path: Path) {
    this._path = path;
    this.updateForm();
  }

  get path() {
    return this._path;
  }

  tagsControl = this.fb.control([]);
  form = this.fb.group({
    method: [null, [Validators.required]],
    tags: this.tagsControl,
    url: [null, [Validators.required, urlWithSpacesValidator]],
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

    this.route.data.subscribe(({me, project, path}) => {
      [this.me, this.project, this.path] = [me, project, path];
      this.cd.detectChanges();
    });

    this.form.valueChanges.subscribe(({method, tags, url, editor: {yaml, json}}) => {
      if (this.form.valid) {
        Object.assign(this.path, {
          method, tags, url, yaml, json
        });
        this.manager.put(this.path, this.me);
        this.cd.detectChanges();
      }
    });

    this.manager.replicated$
      .pipe(filter(entities => entities.some(e => e === this.path)))
      .subscribe(() => {
        this.updateForm();
        this.cd.detectChanges();
      });
  }

  updateForm() {
    const {method, tags, url, yaml, json} = this.path;
    this.form.patchValue({
      method: method,
      tags: tags,
      url: url,
      editor: {
        yaml: yaml,
        json: json
      }
    }, {emitEvent: false});
  }

  addTag(tag: string, close: Function) {
    this.created.tags.push(tag);
    const {value: tags} = this.tagsControl;
    this.tagsControl.setValue([...tags, tag]);
    close();
  }

  addBooleanParameter() {
    this.addData({
      parameters: [
        {
          name: 'caching',
          in: 'query',
          required: true,
          description: 'Enable cache results',
          schema:
            {
              type: 'boolean',
              default: false,
              example: true
            }
        }]
    });
  }

  addStringParameter() {
    this.addData({
      parameters: [
        {
          name: 'search',
          in: 'query',
          required: false,
          description: 'Search query',
          schema:
            {
              type: 'string',
              example: 'keyword'
            }
        }]
    });
  }

  addNumberParameter() {
    this.addData({
      parameters: [
        {
          name: 'page',
          in: 'query',
          required: false,
          description: 'Page for navigation',
          schema:
            {
              type: 'integer',
              format: 'int32',
              default: 1,
              example: 1
            }
        }]
    });
  }

  addEnumParameter() {
    this.addData({
      parameters: [
        {
          name: 'lang',
          in: 'query',
          required: false,
          description: 'Language',
          schema:
            {
              type: 'string',
              example: 'en',
              enum: ['en', 'ru', 'de']
            }
        }]
    });
  }

  add200() {
    this.addData({
      responses: {
        '200': {description: 'OK'}
      }
    });
  }

  add401() {
    this.addData({
      responses: {
        '401': {description: 'Unauthorized'}
      }
    });
  }

  add404() {
    this.addData({
      responses: {
        '404': {description: 'Not Found'}
      }
    });
  }

  setInput(schema: Schema) {
    this.addData({
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              '$ref': `#/components/schemas/${schema.name}`
            }
          }
        }
      }
    });
  }

  setOutputSchema(schema: Schema) {
    assign(this.path.json?.responses['200']?.content, {'application/json': {}});
    this.addData({
      responses: {
        '200': {
          content: {
            'application/json': {
              schema: {
                '$ref': `#/components/schemas/${schema.name}`
              }
            }
          }
        }
      }
    });
  }

  setOutputArray(schema: Schema) {
    assign(this.path.json?.responses['200']?.content, {'application/json': {}});
    this.addData({
      responses: {
        '200': {
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  '$ref': `#/components/schemas/${schema.name}`
                }
              }
            }
          }
        }
      }
    });
  }

  setOutputPaging(code: Object) {
    assign(this.path.json?.responses['200']?.content, {'application/json': {}});
    this.addData({
      responses: {
        '200': {
          content: {
            'application/json': {
              schema: code
            }
          }
        }
      }
    });
  }

  setOutputMap(schema: Schema) {
    assign(this.path.json?.responses['200']?.content, {'application/json': {}});
    this.addData({
      responses: {
        '200': {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                additionalProperties: {
                  '$ref': `#/components/schemas/${schema.name}`
                }
              }
            }
          }
        }
      }
    });
  }

  addData(data: Object) {
    const json: PathInJson = merge(this.path.json, data);
    const sorted: Partial<PathInJson> = {};
    if (!!json.parameters) {
      sorted.parameters = json.parameters;
    }
    if (!!json.requestBody) {
      sorted.requestBody = json.requestBody;
    }
    if (!!json.responses) {
      sorted.responses = json.responses;
    }
    const yaml = YAML.dump(sorted, YAML_OPTIONS);
    this.form.patchValue({editor: {yaml}}, {emitEvent: false});

    Object.assign(this.path, {yaml, sorted});
    this.manager.put(this.path);
    this.cd.detectChanges();
  }

  gotoScheme(id: string) {
    this.router.navigate(['projects', this.project.id, 'schemas', id]);
  }

}
