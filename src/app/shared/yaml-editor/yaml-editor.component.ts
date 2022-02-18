import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  forwardRef,
  HostListener,
  Input,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {ControlValueAccessor, FormBuilder, NG_VALUE_ACCESSOR} from '@angular/forms';
import {UI} from '@esanum/ui';
import {Schema} from 'jsonschema';
import {NGXLogger} from 'ngx-logger';
import {EditorComponent, NGX_MONACO_EDITOR_CONFIG} from 'ngx-monaco-editor';
import {debounceTime, distinctUntilChanged} from 'rxjs';
import {filter, map, tap} from 'rxjs/operators';
import {LocalUI} from 'src/enums/local-ui';
import {CURRENT_LANGUAGE, MONACO_OPTIONS} from '../../../consts';
import {SpecManager} from '../../../managers/spec.manager';
import {KeyValue} from '../../../types/key-value';
import {Building, buildYAML} from '../../../utils/yaml';
import {YamlEditorValue} from './yaml-editor.types';

let initialized = false;

@Component({
  selector: 'app-yaml-editor',
  templateUrl: './yaml-editor.component.html',
  styleUrls: ['./yaml-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => YamlEditorComponent),
      multi: true
    }
  ]
})
export class YamlEditorComponent implements OnInit, AfterViewInit, ControlValueAccessor {

  ui = UI;
  localUi = LocalUI;
  consts = {language: CURRENT_LANGUAGE, monaco: MONACO_OPTIONS};

  progress = {validating: false};
  building!: Building | null;
  disabled: boolean = false;

  form = this.fb.group({
    yaml: [null]
  });

  @Input()
  schema!: Schema;

  onChange: (value: YamlEditorValue) => void = () => this.logger.error('value accessor is not registered');
  onTouched: () => void = () => this.logger.error('value accessor is not registered');
  registerOnChange = fn => this.onChange = fn;
  registerOnTouched = fn => this.onTouched = fn;
  @HostListener('blur') onBlur = () => this.onTouched();

  @ContentChild('editorShortcutsTemplate')
  shortcutsTemplate!: TemplateRef<any>;

  @ViewChild('editorRef', {read: EditorComponent})
  editor!: EditorComponent & { initMonaco: (options: { [key: string]: any }) => void };

  constructor(private fb: FormBuilder,
              private logger: NGXLogger,
              private cd: ChangeDetectorRef,
              private manager: SpecManager) {
  }

  ngOnInit() {
    this.form.valueChanges.pipe(map(({yaml}) => yaml),
      distinctUntilChanged(),
      tap(() => this.building = null),
      tap(() => {
        this.progress.validating = true;
        this.cd.detectChanges();
      }),
      debounceTime(1000),
      tap(() => {
        this.progress.validating = false;
        this.cd.detectChanges();
      }))
      .subscribe((yaml: string) => {
        this.building = buildYAML(yaml, this.schema);
        this.cd.detectChanges();
        const {error, json, schema} = this.building;
        if (!error && schema?.valid) {
          this.onChange({yaml, json: json as KeyValue});
        }
      });
  }

  ngAfterViewInit() {
    // TODO: hack for lazy loaded editor
    if (!initialized) {
      initialized = true;
      const {spec} = this.manager;
      monaco.languages.registerCompletionItemProvider('yaml', {
        provideCompletionItems: (model, position) => {
          const {word, startColumn, endColumn} = model.getWordUntilPosition(position);
          return {
            suggestions: spec?.schemas
              .filter(s => s.name.toLowerCase().indexOf(word.toLowerCase()) !== -1)
              .map(s => ({
                label: `${s.name}`,
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: `'#/components/schemas/${s.name}'`,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: {
                  startLineNumber: position.lineNumber,
                  endLineNumber: position.lineNumber,
                  startColumn,
                  endColumn
                }
              })) || []
          };
        }
      });
      this.editor.initMonaco(MONACO_OPTIONS);
    }
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
    this.cd.markForCheck();
  }

  writeValue(value: YamlEditorValue | null) {
    if (!!value) {
      this.form.patchValue({yaml: value.yaml}, {emitEvent: false});
      this.cd.markForCheck();
    }
  }

}
