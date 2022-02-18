import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {SelectComponent, UI} from '@esanum/ui';
import * as YAML from 'js-yaml';
import {filter} from 'rxjs/operators';
import {EXAMPLE_SCHEMA_YAML} from '../../../consts/examples';
import {SpecManager} from '../../../managers/spec.manager';
import {Schema} from '../../../models/schema';
import {Spec} from '../../../models/spec';


@Component({
  selector: 'app-select-schema',
  templateUrl: './select-schema.component.html',
  styleUrls: ['./select-schema.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectSchemaComponent implements OnInit, AfterViewInit {

  ui = UI;

  @Input()
  spec!: Spec;

  form = this.fb.group({
    schema: [null, [Validators.required]]
  });

  @Output()
  selected = new EventEmitter<Schema>();

  @ViewChild('selectRef')
  selectRef!: SelectComponent;

  constructor(private manager: SpecManager,
              private cd: ChangeDetectorRef,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.form.valueChanges.pipe(filter(() => this.form.valid))
      .subscribe(({schema: id}) => {
        const schema = this.spec.schemas.find(s => s.id === id);
        this.selected.emit(schema);
      });
  }

  ngAfterViewInit() {
    this.selectRef.open();
  }

  addSchema(name: string) {
    const s = new Schema({
      name: name.replace(/\s*/ig, ''),
      yaml: EXAMPLE_SCHEMA_YAML,
      json: YAML.load(EXAMPLE_SCHEMA_YAML)
    });
    const links = s.new();
    links.push(s);
    links.forEach(o => this.manager.put(o));

    s.linking({spec: this.spec});

    this.spec.addSchema(s);
    this.manager.put(this.spec);
    this.cd.detectChanges();

    this.selected.emit(s);
    this.form.reset();
  }

}
